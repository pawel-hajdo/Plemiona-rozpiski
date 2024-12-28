package plemiona.rozpiski.report;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plemiona.rozpiski.config.JwtService;

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
    public ResponseEntity<String> addNewReports(
            @PathVariable Long playerId,
            @RequestBody ReportRequest reportRequest,
            HttpServletRequest request
    ){
        if(!jwtService.checkUser(playerId.toString(), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        reportService.saveReports(playerId, reportRequest.reportIds());

        return ResponseEntity.ok("Reports added successfully");
    }
}
