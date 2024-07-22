package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import plemiona.rozpiski.exceptions.CommandNotFoundException;

import java.util.List;

@Service
public class CommandService {

    private final CommandRepository commandRepository;

    @Autowired
    public CommandService(CommandRepository commandRepository) {
        this.commandRepository = commandRepository;
    }

    public List<Command> getAllCommands(){
        return commandRepository.findAll();
    }

    public List<Command> getCommandsByPlayerId(String playerId) {
        List<Command> commands = commandRepository.findByPlayerIdAndDeletedFalse(playerId);
//        if (commands.isEmpty()) {
//            throw new CommandNotFoundException("Commands not found for player id: " + playerId);
//        }
        return commands;
    }

    public List<Command> getDeletedCommandsByPlayerId(String playerId){
        List<Command> commands = commandRepository.findByPlayerIdAndDeletedTrue(playerId);
//        if (commands.isEmpty()) {
//            throw new CommandNotFoundException("Deleted commands not found for player id: " + playerId);
//        }
        return commands;
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
}
