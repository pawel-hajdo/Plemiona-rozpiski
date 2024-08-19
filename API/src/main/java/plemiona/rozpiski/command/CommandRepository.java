package plemiona.rozpiski.command;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command,Long> {
    List<Command> findAllByDeletedTrueAndIdIn(List<Long> commandsIds);
    @Query("""
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.commandCount, c.playerId, c.world)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted = false ORDER BY c.maxTime ASC
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedFalseOrderByMaxTimeAsc(@Param("playerId") String playerId, Pageable pageable);
    @Query("""
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.commandCount, c.playerId, c.world)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted = true ORDER BY c.maxTime DESC
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedTrueOrderByMaxTimeDesc(@Param("playerId") String playerId, Pageable pageable);

    @Query("""
    SELECT new plemiona.rozpiski.command.SourceVillagesResponse(c.source, COUNT(c))
    FROM Command c
    WHERE c.playerId = :playerId 
      AND c.type LIKE %:type% 
    GROUP BY c.source
    ORDER BY c.source ASC
    """)
    List<SourceVillagesResponse> findDistinctSourceWithCountByPlayerIdAndTypeLike(
            @Param("playerId") String playerId,
            @Param("type") String type
    );
}
