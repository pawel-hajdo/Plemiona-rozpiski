package plemiona.rozpiski.command;

import java.util.List;

public record CommandDeletedVillagesRequest(List<String> targetVillages, String world) {
}
