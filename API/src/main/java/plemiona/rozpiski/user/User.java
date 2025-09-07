package plemiona.rozpiski.user;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    @Column(name = "player_id")
    private Integer playerId;

    @Column(name = "register_world")
    private String registerWorld;

    @ElementCollection
    @CollectionTable(name = "admin_worlds", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "world")
    private Set<String> adminWorlds = new HashSet<>();

    @Column(name = "reports_access")
    private Boolean reportsAccess;

    @Column(name = "register_date")
    private LocalDateTime registerDate;

    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptySet();
    }

    @Override
    public String getUsername() {
        return name;
    }
}
