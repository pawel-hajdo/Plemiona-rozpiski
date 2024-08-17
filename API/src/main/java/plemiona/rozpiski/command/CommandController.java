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

//    @GetMapping
//    public List<CommandResponse> getAllCommands(){
//        return commandService.getAllCommands();
//    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<CommandResponse>> getCommandsByPlayerId(
            @PathVariable String playerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            HttpServletRequest request) {

        if(!jwtService.checkUser(playerId, request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<CommandResponse> commands = commandService.getCommandsByPlayerId(playerId, page, size);
        return ResponseEntity.ok(commands);
    }

    @GetMapping("/player/{playerId}/deleted")
    public ResponseEntity<List<CommandResponse>> getDeletedCommandsByPlayerId(
            @PathVariable String playerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            HttpServletRequest request) {

        if(!jwtService.checkUser(playerId, request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<CommandResponse> commands = commandService.getDeletedCommandsByPlayerId(playerId, page, size);
        return ResponseEntity.ok(commands);
    }

    @DeleteMapping("/player/{playerId}")
    public ResponseEntity<String> softDeleteCommands(
            @RequestBody CommandRequest commandRequest,
            @PathVariable String playerId,
            HttpServletRequest request) {

        if(!jwtService.checkUser(playerId, request)){
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
            @PathVariable String playerId,
            @RequestParam() String type,
            HttpServletRequest request) {

        if(!jwtService.checkUser(playerId, request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        List<SourceVillagesResponse> villages = commandService.getSourceVillages(playerId, type);
        return ResponseEntity.ok(villages);
    }
}
