package plemiona.rozpiski.report;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByPlayerId(Long userId);

    List<Report> findByCreatedAtAfter(LocalDateTime createdAt);
}
