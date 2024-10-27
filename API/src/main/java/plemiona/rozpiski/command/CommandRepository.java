package plemiona.rozpiski.command;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommandRepository extends JpaRepository<Command,Long> {
    List<Command> findAllByDeletedIsNotNullAndIdIn(List<Long> commandsIds);
    @Query("""
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackSequenceNumber, c.totalCommandsFromSource)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted IS NULL ORDER BY c.maxTime ASC, c.attackSequenceNumber asc
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedNullOrderByMaxTimeAsc(@Param("playerId") Integer playerId, Pageable pageable);
    @Query("""
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackSequenceNumber, c.totalCommandsFromSource)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted IS NOT NULL ORDER BY c.maxTime DESC
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedNotNullOrderByMaxTimeDesc(@Param("playerId") Integer playerId, Pageable pageable);

    @Query("""
    SELECT new plemiona.rozpiski.command.SourceVillagesResponse(c.source, COUNT(c))
    FROM Command c
    WHERE c.playerId = :playerId
      AND c.type LIKE %:type%
    GROUP BY c.source
    ORDER BY c.source ASC
    """)
    List<SourceVillagesResponse> findDistinctSourceWithCountByPlayerIdAndTypeLike(
            @Param("playerId") Integer playerId,
            @Param("type") String type
    );
    @Query("""
    SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackSequenceNumber, c.totalCommandsFromSource)
    FROM Command c
    WHERE c.playerId = :playerId AND c.world IN :worlds AND c.deleted IS NULL
    ORDER BY c.maxTime ASC, c.attackSequenceNumber asc
""")
    List<CommandResponse> findCommandsByPlayerIdAndWorlds(
            @Param("playerId") Integer playerId,
            @Param("worlds") List<String> worlds
    );

    @Query("""
    SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackSequenceNumber, c.totalCommandsFromSource)
    FROM Command c
    WHERE c.playerId = :playerId AND c.world IN :worlds AND c.deleted IS NOT NULL
    ORDER BY c.maxTime ASC, c.attackSequenceNumber asc
""")
    List<CommandResponse> findDeletedCommandsByPlayerIdAndWorlds(
            @Param("playerId") Integer playerId,
            @Param("worlds") List<String> worlds
    );

    @Query("""
    SELECT new plemiona.rozpiski.command.CommandStatisticsResponse(
        c.playerName,
        COUNT(CASE WHEN c.maxTime > c.deleted THEN 1 END),
        COUNT(CASE WHEN c.minTime < c.deleted THEN 1 END),
        COUNT(CASE WHEN c.minTime <= c.deleted AND c.maxTime >= c.deleted THEN 1 END),
        COUNT(CASE WHEN c.maxTime < CURRENT_TIMESTAMP AND c.deleted IS NULL THEN 1 END),
        COUNT(c)
    )
    FROM Command c
    GROUP BY c.playerName
    """)
    List<CommandStatisticsResponse> getCommandStatistics();

    @Query("""
    SELECT DISTINCT new plemiona.rozpiski.command.CommandPlayerInfoResponse(c.playerName, c.playerId)
    FROM Command c
    ORDER BY c.playerName ASC
    """)
    List<CommandPlayerInfoResponse> findDistinctCommandPlayers();

    Page<Command> findByPlayerIdOrderByMaxTimeAsc(String playerId, Pageable pageable);

    void deleteByTargetIn(List<String> targets);

    @Modifying
    @Query(value = """
    UPDATE plemiona.command_list AS cl
    SET 
        total_commands_from_source = subquery.total_commands_from_source,
        attack_sequence_number = subquery.attack_sequence_number
    FROM (
        SELECT 
            id,
            COUNT(*) OVER (PARTITION BY command_source_id, command_world) AS total_commands_from_source,
            ROW_NUMBER() OVER (PARTITION BY command_source_id, command_world ORDER BY command_min_time) AS attack_sequence_number
        FROM plemiona.command_list
    ) AS subquery
    WHERE cl.id = subquery.id
    """, nativeQuery = true)
    void recalculateCommandStatistics();


}
