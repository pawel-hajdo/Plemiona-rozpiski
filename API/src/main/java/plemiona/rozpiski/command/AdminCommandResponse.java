package plemiona.rozpiski.command;

import java.time.LocalDateTime;

public record AdminCommandResponse(
        Long id,
        Long commandNumberId,
        LocalDateTime minTime,
        LocalDateTime maxTime,
        String source,
        String sourceId,
        String target,
        String targetId,
        String type,
        String playerId,
        String playerName,
        String world,
        String attackTime,
        LocalDateTime deleted,
        String operationName,
        Integer attackSequenceNumber,
        Integer totalCommandsFromSource,
        Long minutesLate
) {}
