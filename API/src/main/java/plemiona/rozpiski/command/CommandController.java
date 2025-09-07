package plemiona.rozpiski.command;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plemiona.rozpiski.config.JwtService;

import java.util.List;

@RestController
@RequestMapping(path = "api/commands")
public class CommandController {

    private final CommandService commandService;
    private final JwtService jwtService;

    @Autowired
    public CommandController(CommandService commandService, JwtService jwtService) {
        this.commandService = commandService;
        this.jwtService = jwtService;
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<CommandResponse>> getCommandsByPlayerId(
            @PathVariable Integer playerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            HttpServletRequest request) {

        if(!jwtService.checkUser(String.valueOf(playerId), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<CommandResponse> commands = commandService.getCommandsByPlayerId(playerId, page, size);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/player/{playerId}/deleted")
    public ResponseEntity<List<CommandResponse>> getDeletedCommandsByPlayerId(
            @PathVariable Integer playerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            HttpServletRequest request) {

        if(!jwtService.checkUser(String.valueOf(playerId), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<CommandResponse> commands = commandService.getDeletedCommandsByPlayerId(playerId, page, size);
        return ResponseEntity.ok(commands);
    }

    @DeleteMapping("/player/{playerId}")
    public ResponseEntity<String> softDeleteCommands(
            @RequestBody CommandRequest commandRequest,
            @PathVariable Integer playerId,
            HttpServletRequest request) {

        if(!jwtService.checkUser(String.valueOf(playerId), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return commandService.softDeleteCommands(commandRequest.commandIds());
    }

    @PutMapping("/player/{playerId}")
    public ResponseEntity<String> restoreDeletedCommands(
            @RequestBody CommandRequest commandRequest,
            @PathVariable String playerId,
            HttpServletRequest request) {

        if(!jwtService.checkUser(playerId, request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return commandService.restoreDeletedCommands(commandRequest.commandIds());
    }

    @GetMapping("/player/{playerId}/sourceVillages")
    public ResponseEntity<List<SourceVillagesResponse>> getSourceVillages(
            @PathVariable Integer playerId,
            @RequestParam() String type,
            HttpServletRequest request) {

        if(!jwtService.checkUser(String.valueOf(playerId), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<SourceVillagesResponse> villages = commandService.getSourceVillages(playerId, type);
        return ResponseEntity.ok(villages);
    }

    @GetMapping("/sitter/{playerId}")
    public ResponseEntity<List<CommandResponse>> getCommandsForActiveSittings(
            @PathVariable Integer playerId,
            HttpServletRequest request) {

        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<CommandResponse> commands = commandService.getCommandsForActiveSittings(playerId);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/sitter/{playerId}/deleted")
    public ResponseEntity<List<CommandResponse>> getDeletedCommandsForActiveSittings(
            @PathVariable Integer playerId,
            HttpServletRequest request) {

        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<CommandResponse> commands = commandService.getDeletedCommandsForActiveSittings(playerId);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/admin/statistics")
    public ResponseEntity<List<CommandStatisticsResponse>> getCommandStatistics(
            @RequestParam String world,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(world, request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<CommandStatisticsResponse> statistics = commandService.getCommandStatistics(world);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/admin/players/{playerId}")
    public ResponseEntity<List<AdminCommandResponse>> getPlayerCommandsAdmin(
            @PathVariable Integer playerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam String world,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(world, request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<AdminCommandResponse> commands = commandService.getCommandsByPlayerIdAdmin(playerId, world, page, size);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/admin/players")
    public ResponseEntity<List<CommandPlayerInfoResponse>> getDistinctPlayersWithCommands(
            @RequestParam String world,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(world, request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<CommandPlayerInfoResponse> players = commandService.getDistinctPlayersWithCommands(world);
        return ResponseEntity.ok(players);
    }

    @DeleteMapping("/admin/villages")
    public ResponseEntity<String> deleteVillagesAdmin(
            @RequestBody CommandDeletedVillagesRequest villagesToDelete,
            HttpServletRequest request
        ) {
        if (!jwtService.checkWorldAdmin(villagesToDelete.world(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return commandService.deleteTargetVillages(villagesToDelete.targetVillages(), villagesToDelete.world());
    }

    @GetMapping("/admin/bad-commands")
    public ResponseEntity<List<AdminCommandResponse>> getBadCommandsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam String world,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(world, request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<AdminCommandResponse> commands = commandService.getBadCommands(page, size, filter, world);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/admin/villages")
    public ResponseEntity<List<AdminCommandResponse>> getCommandsForTargetVillage(
            @RequestParam String targetVillage,
            @RequestParam String world,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(world, request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<AdminCommandResponse> commands = commandService.getCommandsForTargetVillage(
                targetVillage,
                world
        );
        return ResponseEntity.ok(commands);
    }

    @PostMapping("/admin/shift-commands")
    public ResponseEntity<String> shiftCommandTimes(
            @RequestBody CommandShiftRequest shiftRequest,
            HttpServletRequest request
    ) {
        if (!jwtService.checkWorldAdmin(shiftRequest.world(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        commandService.shiftCommandTimes(
                shiftRequest.commandIds(),
                shiftRequest.shiftMinutes(),
                shiftRequest.world()
        );
        return ResponseEntity.ok("Commands shifted successfully");
    }
}
