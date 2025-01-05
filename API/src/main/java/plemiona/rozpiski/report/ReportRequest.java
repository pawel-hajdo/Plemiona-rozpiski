package plemiona.rozpiski.report;

import java.util.List;

public record ReportRequest(
        List<String> reportIds
) {
}
