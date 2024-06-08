package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
