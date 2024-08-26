package plemiona.rozpiski.command;

import java.time.LocalDateTime;

public record CommandResponse(
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
    String world,
    Integer attackSequenceNumber,
    Integer totalCommandsFromSource
) { }
