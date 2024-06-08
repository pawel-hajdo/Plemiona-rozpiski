package plemiona.rozpiski.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        return commandRepository.findByPlayerId(playerId);
    }
}
