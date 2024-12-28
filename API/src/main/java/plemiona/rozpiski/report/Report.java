package plemiona.rozpiski.report;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

    @Id
    @GeneratedValue
    @Column(name = "id")
    private Long id;

    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "report_id")
    private String reportId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
