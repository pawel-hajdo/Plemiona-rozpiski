package plemiona.rozpiski.log;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogService {
    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }
    public List<LastPlayerLoginResponse> getLastLoginForTribePlayers() {
        return logRepository.findLastLoginForUsersWithReportsAccess();
    }
}
