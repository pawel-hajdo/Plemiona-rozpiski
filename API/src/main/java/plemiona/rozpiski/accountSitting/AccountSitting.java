package plemiona.rozpiski.accountSitting;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sittings")
@Getter
@Setter
public class AccountSitting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "player_id")
    private Integer playerId;

    @Column(name = "player_name")
    private String playerName;

    @Column(name = "sitter_id")
    private Integer sitterId;

    @Column(name = "sitter_name")
    private String sitterName;

    @Column(name = "world")
    private String world;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private AccountSittingStatus status;

    @Column(name = "status_change_date")
    private LocalDateTime statusChangeDate;
}
