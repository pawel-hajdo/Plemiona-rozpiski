package plemiona.rozpiski.report;

import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public int saveReports(Long playerId, List<String> reportIds){
        Set<String> existingReportIds = reportRepository.findAllByPlayerId(playerId).stream()
                .map(Report::getReportId)
                .collect(Collectors.toSet());

        ZoneId warsawZone = ZoneId.of("Europe/Warsaw");
        ZonedDateTime currentTime = ZonedDateTime.now(warsawZone);

        List<Report> newReports = reportIds.stream()
                .filter(reportId -> !existingReportIds.contains(reportId))
                .map(reportId -> {
                    Report report = new Report();
                    report.setPlayerId(playerId);
                    report.setReportId(reportId);
                    report.setCreatedAt(currentTime.toLocalDateTime());
                    return report;
                })
                .collect(Collectors.toList());

        if (!newReports.isEmpty()) {
            reportRepository.saveAll(newReports);
        }
        return newReports.size();
    }
}
