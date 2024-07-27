package plemiona.rozpiski.command;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command,Long> {
    List<Command> findAllByDeletedTrueAndIdIn(List<Long> commandsIds);
    Page<Command> findByPlayerIdAndDeletedFalseOrderByMaxTimeAsc(String playerId, Pageable pageable);
    Page<Command> findByPlayerIdAndDeletedTrueOrderByMaxTimeDesc(String playerId, Pageable pageable);
}
