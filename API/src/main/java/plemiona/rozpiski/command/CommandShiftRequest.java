package plemiona.rozpiski.command;

import java.util.List;

public record CommandShiftRequest(List<Long> commandIds, String world, int shiftMinutes) {}
