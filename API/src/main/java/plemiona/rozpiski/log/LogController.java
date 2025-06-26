package plemiona.rozpiski.log;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import plemiona.rozpiski.command.Command;

import java.util.List;

@RestController
@RequestMapping(path = "api/logs")
@PreAuthorize("hasRole('ADMIN')")
public class LogController {
    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping("/last-login")
    public ResponseEntity<List<LastPlayerLoginResponse>> getLastLoginForTribePlayers() {
        //tmp solution
        List<LastPlayerLoginResponse> lastLoginsList = logService.getLastLoginForTribePlayers();
        return ResponseEntity.ok(lastLoginsList);
    }

}
