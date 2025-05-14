package plemiona.rozpiski.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("""
        SELECT new plemiona.rozpiski.log.LastPlayerLoginResponse(
            u.name, 
            l.date
        )
        FROM plemiona.rozpiski.user.User u
        JOIN Log l ON u.id = l.userId
        WHERE u.reportsAccess = true
        AND l.type = 0
        AND l.date = (
            SELECT MAX(l2.date)
            FROM Log l2
            WHERE l2.userId = u.id
            AND l2.type = 0
        )
        ORDER BY l.date DESC
    """)
    List<LastPlayerLoginResponse> findLastLoginForUsersWithReportsAccess();
}
