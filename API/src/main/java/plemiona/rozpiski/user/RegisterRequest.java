package plemiona.rozpiski.user;

public record RegisterRequest(
        String name,
        String password,
        String code,
        String world
) { }
