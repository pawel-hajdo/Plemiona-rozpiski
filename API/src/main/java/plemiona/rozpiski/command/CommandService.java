package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plemiona.rozpiski.accountSitting.AccountSitting;
import plemiona.rozpiski.accountSitting.AccountSittingRepository;
import plemiona.rozpiski.accountSitting.AccountSittingStatus;
import plemiona.rozpiski.exceptions.CommandNotFoundException;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommandService {

    private final CommandRepository commandRepository;
    private final AccountSittingRepository accountSittingRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CommandService(CommandRepository commandRepository, AccountSittingRepository accountSittingRepository, JdbcTemplate jdbcTemplate) {
        this.commandRepository = commandRepository;
        this.accountSittingRepository = accountSittingRepository;
        this.jdbcTemplate = jdbcTemplate;
    }
//    public List<CommandResponse> getAllCommands(){
//        return commandRepository.findAll().stream().map(this::mapToCommandResponse).collect(Collectors.toList());
//    }

    public List<CommandResponse> getCommandsByPlayerId(Integer playerId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        return commandRepository.findByPlayerIdAndDeletedNullOrderByMaxTimeAsc(playerId, pageable).getContent();
    }
    public List<CommandResponse> getDeletedCommandsByPlayerId(Integer playerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commandRepository.findByPlayerIdAndDeletedNotNullOrderByMaxTimeDesc(playerId, pageable).getContent();
    }

    public ResponseEntity<String> softDeleteCommands(List<Long> commandIds) {
        List<Command> commands = commandRepository.findAllById(commandIds);

        if (commands.isEmpty()) {
            throw new CommandNotFoundException("Commands not found for given IDs");
        }
        ZonedDateTime warsawTime = ZonedDateTime.now(ZoneId.of("Europe/Warsaw"));

        for(Command command : commands){
            command.setDeleted(warsawTime.toLocalDateTime());
        }
        commandRepository.saveAll(commands);
        return ResponseEntity.ok("Commands deleted successfully");
    }

    public ResponseEntity<String> restoreDeletedCommands(List<Long> commandIds) {
        List<Command> commands = commandRepository.findAllByDeletedIsNotNullAndIdIn(commandIds);

        if (commands.isEmpty()) {
            throw new CommandNotFoundException("Commands not found for given IDs");
        }
        for(Command command : commands){
            command.setDeleted(null);
        }
        commandRepository.saveAll(commands);
        return ResponseEntity.ok("Commands restored successfully");
    }

    public List<SourceVillagesResponse> getSourceVillages(Integer playerId, String type) {
        return commandRepository.findDistinctSourceWithCountByPlayerIdAndTypeLike(playerId, type);
    }

    public List<SourceVillagesSitterResponse> getSourceVillagesForActiveSittings(Integer sitterId, String type) {
        List<AccountSitting> sittings =
                accountSittingRepository.findBySitterIdAndStatusIn(
                        sitterId,
                        List.of(AccountSittingStatus.ACTIVE)
                );

        List<SourceVillagesSitterResponse> result = new ArrayList<>();

        for (AccountSitting sitting : sittings) {
            result.addAll(
                    commandRepository.findSourceVillagesForPlayerAndWorld(
                            sitting.getPlayerId(),
                            sitting.getWorld(),
                            type
                    )
            );
        }

        return result;
    }

    public List<CommandResponse> getCommandsForActiveSittings(Integer sitterId) {
        List<AccountSitting> activeSittings = accountSittingRepository.findBySitterIdAndStatusIn(sitterId, Collections.singletonList(AccountSittingStatus.ACTIVE));
        Map<Integer, List<String>> playerWorldMap = activeSittings.stream()
                .collect(Collectors.groupingBy(
                        AccountSitting::getPlayerId,
                        Collectors.mapping(AccountSitting::getWorld, Collectors.toList())
                ));

        List<CommandResponse> commands = new ArrayList<>();
        for (Map.Entry<Integer, List<String>> entry : playerWorldMap.entrySet()) {
            Integer playerId = entry.getKey();
            List<String> worlds = entry.getValue();
            commands.addAll(commandRepository.findCommandsByPlayerIdAndWorlds(playerId, worlds));
        }

        return commands;
    }

    public List<CommandResponse> getDeletedCommandsForActiveSittings(Integer sitterId) {
        List<AccountSitting> activeSittings = accountSittingRepository.findBySitterIdAndStatusIn(sitterId, Collections.singletonList(AccountSittingStatus.ACTIVE));
        Map<Integer, List<String>> playerWorldMap = activeSittings.stream()
                .collect(Collectors.groupingBy(
                        AccountSitting::getPlayerId,
                        Collectors.mapping(AccountSitting::getWorld, Collectors.toList())
                ));

        List<CommandResponse> commands = new ArrayList<>();
        for (Map.Entry<Integer, List<String>> entry : playerWorldMap.entrySet()) {
            Integer playerId = entry.getKey();
            List<String> worlds = entry.getValue();
            commands.addAll(commandRepository.findDeletedCommandsByPlayerIdAndWorlds(playerId, worlds));
        }

        return commands;
    }

    public List<CommandStatisticsResponse> getCommandStatistics(String world) {
        return commandRepository.getCommandStatistics(world);
    }

    public List<CommandPlayerInfoResponse> getDistinctPlayersWithCommands(String world) {
        return commandRepository.findDistinctCommandPlayersByWorld(world);
    }

    public List<AdminCommandResponse> getCommandsByPlayerIdAdmin(Integer playerId, String world, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
//        return commandRepository.findByPlayerIdAndWorldOrderByMaxTimeAsc(playerId, world, pageable).getContent();
        return commandRepository.findCommandsByPlayerIdAdmin(playerId, world, pageable);
    }

    @Transactional
    public ResponseEntity<String> deleteTargetVillages(List<String> targetVillages, String world) {
        commandRepository.deleteByTargetInAndWorld(targetVillages, world);
        commandRepository.recalculateCommandStatistics();
        return ResponseEntity.ok("Commands deleted and statistics recalculated successfully");
    }

    public List<AdminCommandResponse> getBadCommands(int page, int size, String filter, String world) {
        Pageable pageable = PageRequest.of(page, size);
        LocalDateTime nowWarsaw = ZonedDateTime.now(ZoneId.of("Europe/Warsaw")).toLocalDateTime();

        switch (filter.toLowerCase()) {
            case "important":
                return commandRepository.findBadCommandsImportant(world, nowWarsaw, pageable);
            case "all":
            default:
                return commandRepository.findBadCommands(world, nowWarsaw, pageable);
        }
    }

    public List<AdminCommandResponse> getCommandsForTargetVillage(String targetVillage, String world) {
            return commandRepository.findByTargetInOrderByMinTimeAsc(targetVillage, world);
    }

    @Transactional
    public void shiftCommandTimes(List<Long> commandIds, int shiftMinutes, String world) {
        List<Command> commands = commandRepository.findAllById(commandIds);

        commands.forEach(command -> {
            if (command.getMinTime() != null) {
                command.setMinTime(command.getMinTime().plusMinutes(shiftMinutes));
            }
            if (command.getMaxTime() != null) {
                command.setMaxTime(command.getMaxTime().plusMinutes(shiftMinutes));
            }

            if (command.getAttackTime() != null && !command.getAttackTime().isEmpty()) {
                command.setAttackTime(shiftAttackTimeString(command.getAttackTime(), shiftMinutes));
            }
        });

        commandRepository.saveAll(commands);
    }

    @Transactional
    public ResponseEntity<String> deleteCommandsAdmin(List<Long> commandIds, String world) {
        List<Command> commands = commandRepository.findByIdInAndWorld(commandIds, world);
    
        if (commands.isEmpty()) {
            throw new CommandNotFoundException("No commands found for given IDs in world: " + world);
        }

        commandRepository.deleteAll(commands);

        return ResponseEntity.ok("Commands deleted");
    }

    @Transactional
    public void createBulkCommands(List<CommandCreateRequest> requests) {
        String sql = """
                INSERT INTO plemiona.command_list (
                    command_number_id, command_type, command_min_time, command_max_time,
                    command_source, command_source_id, command_target, command_target_id,
                    command_world, command_player_id, command_player_name, operation_name,
                    command_attack_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        jdbcTemplate.batchUpdate(sql, requests, 1000, (ps, command) -> {
            ps.setObject(1, command.commandNumberId());
            ps.setString(2, command.type());
            ps.setTimestamp(3, Timestamp.valueOf(command.minTime()));
            ps.setTimestamp(4, Timestamp.valueOf(command.maxTime()));
            ps.setString(5, command.source());
            ps.setString(6, command.sourceId());
            ps.setString(7, command.target());
            ps.setString(8, command.targetId());
            ps.setString(9, command.world());
            ps.setString(10, command.playerId());
            ps.setString(11, command.playerName());
            ps.setString(12, command.operationName());
            ps.setString(13, command.attackTime());
        });

        commandRepository.recalculateCommandStatistics();
    }

    @Transactional
    public ResponseEntity<String> deleteCommandsByOperation(String operationName) {
        commandRepository.deleteByOperationName(operationName);
        commandRepository.recalculateCommandStatistics();
        return ResponseEntity.ok("Commands for operation '" + operationName + "' deleted successfully");
    }

    public List<CommandExportResponse> getCommandsByOperationName(String operationName) {
        return commandRepository.findAllByOperationName(operationName);
    }

    private String shiftAttackTimeString(String attackTime, int shiftMinutes) {
        String[] timeParts = attackTime.split(" ");
        String date = timeParts[0];
        String[] timeRanges = timeParts[1].split("-");

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("yyyy-M-d HH:mm:ss");
        LocalDateTime startTime = LocalDateTime.parse(date + " " + timeRanges[0], timeFormatter);
        LocalDateTime endTime = LocalDateTime.parse(date + " " + timeRanges[1], timeFormatter);

        LocalDateTime shiftedStartTime = startTime.plusMinutes(shiftMinutes);
        LocalDateTime shiftedEndTime = endTime.plusMinutes(shiftMinutes);

        return shiftedStartTime.format(timeFormatter) +
                "-" +
                shiftedEndTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }
}
