package plemiona.rozpiski.report;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import plemiona.rozpiski.config.JwtService;
import plemiona.rozpiski.config.PageDto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

        String formattedDate = (parsedDate != null) ? parsedDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HHmmss")) : "all_reports";
        String fileName = "reports_" + formattedDate + ".txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(fileContent.toString());
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public PageDto<Report> getLatestReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "false") boolean ascending,
            @RequestParam(required = false) Long playerId
    ) {

        Sort sort = ascending ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Report> reports;
        if (playerId != null) {
            reports = reportService.findByPlayerId(playerId, pageable);
        } else {
            reports = reportService.findAll(pageable);
        }

        return new PageDto<>(
                reports.getNumber(),
                reports.getSize(),
                reports.getTotalElements(),
                reports.getTotalPages(),
                reports.getContent()
        );
    }

    @GetMapping("/players")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlayerReportsResponse>> getPlayersWithReports() {
        List<PlayerReportsResponse> players = reportService.getPlayersWithReports();
        return ResponseEntity.ok(players);
    }
}
