package plemiona.rozpiski.command;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command,Long> {
    List<Command> findByPlayerIdAndDeletedFalse(String playerId);
    List<Command> findByPlayerIdAndDeletedTrue(String playerId);
    List<Command> findAllByDeletedTrueAndIdIn(List<Long> commandsIds);
}
