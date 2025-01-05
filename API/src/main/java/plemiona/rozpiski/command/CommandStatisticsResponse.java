package plemiona.rozpiski.command;

public record CommandStatisticsResponse(
        String playerName,
        Long earlyCommandsCount,
        Long correctCommandsCount,
        Long lateCommandsCount,
        Long expiredCommandsCount,
        Long totalCommandsCount
) {}
