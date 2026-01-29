package plemiona.rozpiski.command;

import java.util.List;

public record CommandDeleteRequest(
        List<Long> commandIds,
        String world
) {}