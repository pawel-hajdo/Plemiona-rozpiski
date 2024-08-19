package plemiona.rozpiski.user;

public record AuthenticationRequest(
        String name,
        String password
) {}
