package plemiona.rozpiski.accountSitting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AccountSittingRepository extends JpaRepository<AccountSitting,Long> {
    @Query("SELECT a FROM AccountSitting a WHERE a.playerId = :playerId AND a.world = :world AND a.endDate IS NULL")
    Optional<AccountSitting> findActiveSittingByPlayerIdAndWorld(Integer playerId, String world);

    List<AccountSitting> findBySitterIdAndEndDateIsNull(Integer sitterId);
    List<AccountSitting> findByPlayerId(Integer playerId);
}
