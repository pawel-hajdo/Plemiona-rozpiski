package plemiona.rozpiski.user;

public record ChangePasswordRequest(
        String name,
        String oldPassword,
        String newPassword
) {}
