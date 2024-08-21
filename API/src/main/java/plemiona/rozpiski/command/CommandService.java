package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import plemiona.rozpiski.accountSitting.AccountSitting;
import plemiona.rozpiski.accountSitting.AccountSittingRepository;
import plemiona.rozpiski.accountSitting.AccountSittingStatus;
import plemiona.rozpiski.exceptions.CommandNotFoundException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommandService {

    private final CommandRepository commandRepository;
    private final AccountSittingRepository accountSittingRepository;

    @Autowired
    public CommandService(CommandRepository commandRepository, AccountSittingRepository accountSittingRepository) {
        this.commandRepository = commandRepository;
        this.accountSittingRepository = accountSittingRepository;
    }
//    public List<CommandResponse> getAllCommands(){
//        return commandRepository.findAll().stream().map(this::mapToCommandResponse).collect(Collectors.toList());
//    }

    public List<CommandResponse> getCommandsByPlayerId(Integer playerId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        return commandRepository.findByPlayerIdAndDeletedFalseOrderByMaxTimeAsc(playerId, pageable).getContent();
    }
    public List<CommandResponse> getDeletedCommandsByPlayerId(Integer playerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return commandRepository.findByPlayerIdAndDeletedTrueOrderByMaxTimeDesc(playerId, pageable).getContent();
    }

    public ResponseEntity<String> softDeleteCommands(List<Long> commandIds) {
        List<Command> commands = commandRepository.findAllById(commandIds);

        if (commands.isEmpty()) {
            throw new CommandNotFoundException("Commands not found for given IDs");
        }
        for(Command command : commands){
            command.setDeleted(true);
        }
        commandRepository.saveAll(commands);
        return ResponseEntity.ok("Commands deleted successfully");
    }

    public ResponseEntity<String> restoreDeletedCommands(List<Long> commandIds) {
        List<Command> commands = commandRepository.findAllByDeletedTrueAndIdIn(commandIds);

        if (commands.isEmpty()) {
            throw new CommandNotFoundException("Commands not found for given IDs");
        }
        for(Command command : commands){
            command.setDeleted(false);
        }
        commandRepository.saveAll(commands);
        return ResponseEntity.ok("Commands restored successfully");
    }

    public List<SourceVillagesResponse> getSourceVillages(Integer playerId, String type) {
        return commandRepository.findDistinctSourceWithCountByPlayerIdAndTypeLike(playerId, type);
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

}
