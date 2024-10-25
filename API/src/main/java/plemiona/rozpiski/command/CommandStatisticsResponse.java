package plemiona.rozpiski.command;

public record CommandStatisticsResponse(
        String playerName,
        Long earlyCommandsCount,
        Long lateCommandsCount,
        Long correctCommandsCount,
        Long expiredCommandsCount,
        Long totalCommandsCount
) {}
