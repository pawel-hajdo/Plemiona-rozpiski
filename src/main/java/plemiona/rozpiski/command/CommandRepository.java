package plemiona.rozpiski.command;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command,Long> {
    List<Command> findByPlayerId(String playerId);
}
