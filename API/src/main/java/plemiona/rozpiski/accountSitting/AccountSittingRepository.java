package plemiona.rozpiski.accountSitting;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountSittingRepository extends JpaRepository<AccountSitting,Long> {

    Optional<AccountSitting> findByPlayerIdAndWorldAndStatusIn(Integer playerId, String world, List<AccountSittingStatus> statuses);
    List<AccountSitting> findBySitterIdAndStatusIn(Integer sitterId, List<AccountSittingStatus> statuses);
    List<AccountSitting> findByPlayerId(Integer playerId);
}
