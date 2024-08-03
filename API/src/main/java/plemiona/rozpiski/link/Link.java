package plemiona.rozpiski.link;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "links")
@Getter
@Setter
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "playerId")
    private String playerId;

    @Column(name = "url")
    private String url;

    @Column(name = "operation_name")
    private String operation_name;
}
