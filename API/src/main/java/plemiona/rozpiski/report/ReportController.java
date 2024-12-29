package plemiona.rozpiski.report;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import plemiona.rozpiski.config.JwtService;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping(path = "/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final JwtService jwtService;

    public ReportController(ReportService reportService, JwtService jwtService) {
        this.reportService = reportService;
        this.jwtService = jwtService;
    }

    @PostMapping("/{playerId}")
    public ResponseEntity<AddReportResponse> addNewReports(
            @PathVariable Long playerId,
            @RequestBody ReportRequest reportRequest,
            HttpServletRequest request
    ){
        if(!jwtService.checkUser(playerId.toString(), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        int addedCount = reportService.saveReports(playerId, reportRequest.reportIds());
        return ResponseEntity.ok(new AddReportResponse("Reports added successfully", addedCount));
    }

    @GetMapping(value = "/download", produces = "text/plain")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> downloadReportsAsText(@RequestParam(required = false) String date) {
        LocalDateTime parsedDate = null;

        if (date != null) {
            try {
                parsedDate = LocalDateTime.parse(date);
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body("Invalid date format. Use ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss");
            }
        }

        List<Report> reports = (parsedDate != null)
                ? reportService.getReportsByDate(parsedDate)
                : reportService.getAllReports();

        StringBuilder fileContent = new StringBuilder();
        for (Report report : reports) {
            fileContent.append("[report]")
                    .append(report.getReportId())
                    .append("[/report]\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=reports.txt")
                .body(fileContent.toString());
    }
}
