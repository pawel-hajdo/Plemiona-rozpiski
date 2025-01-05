package plemiona.rozpiski.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByPlayerId(Long userId);
    List<Report> findByCreatedAtAfter(LocalDateTime createdAt);
    Page<Report> findByPlayerId(Long playerId, Pageable pageable);

    @Query("SELECT DISTINCT new plemiona.rozpiski.report.PlayerReportsResponse(r.playerId, u.name) " +
            "FROM Report r JOIN User u ON r.playerId = u.playerId")
    List<PlayerReportsResponse> findPlayersWithReports();

}
