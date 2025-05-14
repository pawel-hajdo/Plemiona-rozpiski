package plemiona.rozpiski.log;

import java.time.LocalDateTime;

public record LastPlayerLoginResponse(
        String name,
        LocalDateTime lastLogin
) {
}
