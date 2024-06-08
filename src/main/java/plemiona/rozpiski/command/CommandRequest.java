package plemiona.rozpiski.command;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CommandRequest {
    private List<Long> commandIds;
}
