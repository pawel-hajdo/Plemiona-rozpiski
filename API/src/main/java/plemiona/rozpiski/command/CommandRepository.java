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
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackTime, c.attackSequenceNumber, c.totalCommandsFromSource)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted IS NULL ORDER BY c.maxTime ASC, c.attackSequenceNumber asc
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedNullOrderByMaxTimeAsc(@Param("playerId") Integer playerId, Pageable pageable);
    @Query("""
            SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackTime, c.attackSequenceNumber, c.totalCommandsFromSource)
            FROM Command c WHERE c.playerId = :playerId AND c.deleted IS NOT NULL ORDER BY c.maxTime DESC
            """)
    Page<CommandResponse> findByPlayerIdAndDeletedNotNullOrderByMaxTimeDesc(@Param("playerId") Integer playerId, Pageable pageable);

    @Query("""
    SELECT new plemiona.rozpiski.command.SourceVillagesResponse(c.source, COUNT(c), c.world)
    FROM Command c
    WHERE c.playerId = :playerId
      AND c.type LIKE %:type%
    GROUP BY c.source, c.world
    ORDER BY COUNT(c) DESC
    """)
    List<SourceVillagesResponse> findDistinctSourceWithCountByPlayerIdAndTypeLike(
            @Param("playerId") Integer playerId,
            @Param("type") String type
    );
    @Query("""
    SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackTime, c.attackSequenceNumber, c.totalCommandsFromSource)
    FROM Command c
    WHERE c.playerId = :playerId AND c.world IN :worlds AND c.deleted IS NULL
    ORDER BY c.maxTime ASC, c.attackSequenceNumber asc
""")
    List<CommandResponse> findCommandsByPlayerIdAndWorlds(
            @Param("playerId") Integer playerId,
            @Param("worlds") List<String> worlds
    );

    @Query("""
    SELECT new plemiona.rozpiski.command.CommandResponse(c.id, c.commandNumberId, c.minTime, c.maxTime, c.source, c.sourceId, c.target, c.targetId, c.type, c.playerId, c.world, c.attackTime, c.attackSequenceNumber, c.totalCommandsFromSource)
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
        COUNT(CASE WHEN c.maxTime > c.deleted AND NOT (c.minTime <= c.deleted AND c.maxTime >= c.deleted) THEN 1 END),
        COUNT(CASE WHEN c.minTime <= c.deleted AND c.maxTime >= c.deleted THEN 1 END),
        COUNT(CASE WHEN c.maxTime <= c.deleted then 1 end),
        COUNT(CASE WHEN c.deleted is null then 1 end),
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

    Page<Command> findByPlayerIdAndWorldOrderByMaxTimeAsc(String playerId, String world, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Command c WHERE c.target IN :targets AND c.world = :world")
    void deleteByTargetInAndWorld(@Param("targets") List<String> targets, @Param("world") String world);

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

    @Query("""
    SELECT new plemiona.rozpiski.command.AdminCommandResponse(
        c.id,
        c.commandNumberId,
        c.minTime,
        c.maxTime,
        c.source,
        c.sourceId,
        c.target,
        c.targetId,
        c.type,
        c.playerId,
        c.playerName,
        c.world,
        c.attackTime,
        c.deleted,
        c.operationName,
        c.attackSequenceNumber,
        c.totalCommandsFromSource,
        CASE
            WHEN c.deleted IS NOT NULL
            THEN CAST(FUNCTION('TIMESTAMPDIFF', MINUTE, c.maxTime, c.deleted) AS java.lang.Long)
            ELSE NULL
        END
    )
    FROM Command c
    WHERE (c.maxTime < c.deleted OR (c.maxTime < CURRENT_TIMESTAMP AND c.deleted IS NULL))
    AND c.world = :world
    ORDER BY c.maxTime ASC
""")
    List<AdminCommandResponse> findBadCommands(@Param("world") String world, Pageable pageable);


    @Query("""
    SELECT new plemiona.rozpiski.command.AdminCommandResponse(
        c.id,
        c.commandNumberId,
        c.minTime,
        c.maxTime,
        c.source,
        c.sourceId,
        c.target,
        c.targetId,
        c.type,
        c.playerId,
        c.playerName,
        c.world,
        c.attackTime,
        c.deleted,
        c.operationName,
        c.attackSequenceNumber,
        c.totalCommandsFromSource,
        CASE
            WHEN c.deleted IS NOT NULL
            THEN CAST(FUNCTION('TIMESTAMPDIFF', MINUTE, c.maxTime, c.deleted) AS java.lang.Long)
            ELSE NULL
        END
    )
    FROM Command c
    WHERE (c.maxTime < c.deleted OR (c.maxTime < CURRENT_TIMESTAMP AND c.deleted IS NULL))
    AND (c.type LIKE 'SZLACHCIC%' OR c.type LIKE '%OFF%')
    AND c.world = :world
    ORDER BY c.maxTime ASC
""")
    List<AdminCommandResponse> findBadCommandsImportant(@Param("world") String world, Pageable pageable);

    @Query("""
    SELECT c FROM Command c 
    WHERE c.target IN :targets 
    AND c.world = :world
    ORDER BY c.minTime ASC
    """)
    List<Command> findByTargetInOrderByMinTimeAsc(
            @Param("targets") List<String> targets,
            @Param("world") String world
    );

    @Query("""
    SELECT c FROM Command c 
    WHERE c.target IN :targets 
    AND (c.type LIKE 'SZLACHCIC%' OR c.type LIKE '%OFF%')
    AND c.world = :world
    ORDER BY c.minTime asc
    """)
    List<Command> findByTargetInAndTypeLikeImportant(
            @Param("targets") List<String> targets,
            @Param("world") String world
    );

    List<Command> findByTargetAndWorld(String target, String world);

    List<Command> findByTargetAndWorldAndDeletedNull(String target, String world);
}
