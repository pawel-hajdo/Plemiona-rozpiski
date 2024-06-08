package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "api/commands")
public class CommandController {

    private final CommandService commandService;

    @Autowired
    public CommandController(CommandService commandService) {
        this.commandService = commandService;
    }
    @GetMapping
    public List<Command> getAllCommands(){
        return commandService.getAllCommands();
    }

    @GetMapping("/player/{playerId}")
    public List<Command> getCommandsByPlayerId(@PathVariable String playerId){
        return commandService.getCommandsByPlayerId(playerId);
    }

    @GetMapping("/player/{playerId}/deleted")
    public List<Command> getDeletedCommandsByPlayerId(@PathVariable String playerId){
        return commandService.getDeletedCommandsByPlayerId(playerId);
    }

    @DeleteMapping
    public ResponseEntity<String> softDeleteCommands(@RequestBody CommandRequest request) {
        return commandService.softDeleteCommands(request.getCommandIds());
    }

    @PutMapping
    public ResponseEntity<String> restoreDeletedCommands(@RequestBody CommandRequest request) {
        return commandService.restoreDeletedCommands(request.getCommandIds());
    }
}
