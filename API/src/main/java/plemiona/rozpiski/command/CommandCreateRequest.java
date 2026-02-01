package plemiona.rozpiski.command;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CommandCreateRequest(
        Long commandNumberId,
        String type,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime minTime,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime maxTime,
        String attackTime,
        String source,
        String sourceId,
        String target,
        String targetId,
        String playerId,
        String playerName,
        String world,
        String operationName
) {
}
