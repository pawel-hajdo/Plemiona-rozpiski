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
    String commandCount,
    String playerId,
    String world
) { }
