package plemiona.rozpiski.command;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "command_list")
@Getter
@Setter
public class Command {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "command_number_id")
    private Long commandNumberId;

    @Column(name = "command_custom_id")
    private String customId;

    @Column(name = "command_minTime")
    private LocalDateTime minTime;

    @Column(name = "command_maxTime")
    private LocalDateTime maxTime;

    @Column(name = "command_source")
    private String source;

    @Column(name = "command_source_id")
    private String sourceId;

    @Column(name = "command_target")
    private String target;

    @Column(name = "command_target_id")
    private String targetId;

    @Column(name = "command_type")
    private String type;

    @Column(name = "command_link")
    private String link;

    @Column(name = "command_link_sitting")
    private String linkSitting;

    @Column(name = "command_player_id")
    private String playerId;

    @Column(name = "command_player_name")
    private String playerName;

    @Column(name = "command_world")
    private String world;

    @Column(name = "command_attack_time")
    private String attackTime;

    @Column(name = "deleted")
    private boolean deleted = false;
}
