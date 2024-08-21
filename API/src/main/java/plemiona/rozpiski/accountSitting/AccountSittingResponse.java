package plemiona.rozpiski.accountSitting;

import java.time.LocalDateTime;

public record AccountSittingResponse(
        Long id,
        Integer playerId,
        String playerName,
        Integer sitterId,
        String sitterName,
        String world,
        LocalDateTime startDate,
        LocalDateTime endDate,
        AccountSittingStatus status
) {
}
