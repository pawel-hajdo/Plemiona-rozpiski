package plemiona.rozpiski.accountSitting;

import org.springframework.stereotype.Service;
import plemiona.rozpiski.exceptions.ActiveSittingAlreadyExistsException;
import plemiona.rozpiski.exceptions.SittingNotFoundException;
import plemiona.rozpiski.user.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccountSittingService {

    private final AccountSittingRepository accountSittingRepository;
    private final UserService userService;
    private Map<String, Integer> playerIdMap = new HashMap<>();

    public AccountSittingService(AccountSittingRepository accountSittingRepository, UserService userService) {
        this.accountSittingRepository = accountSittingRepository;
        this.userService = userService;
    }

    public AccountSittingResponse setSitterForAccount(Integer playerId, AccountSittingRequest request){
        Optional<AccountSitting> existingSitting = accountSittingRepository.findActiveSittingByPlayerIdAndWorld(playerId, request.world());
        if (existingSitting.isPresent()) {
            throw new ActiveSittingAlreadyExistsException("Player already has an active sitter in this world.");
        }

        userService.loadPlayersFromApi(request.world());
        String playerName = userService.getPlayerName(playerId);
        Integer sitterId = userService.getPlayerId(request.sitterName());

        AccountSitting newAccountSitting = new AccountSitting();
        newAccountSitting.setPlayerId(playerId);
        newAccountSitting.setPlayerName(playerName);
        newAccountSitting.setSitterId(sitterId);
        newAccountSitting.setSitterName(request.sitterName());
        newAccountSitting.setWorld(request.world());
        newAccountSitting.setStartDate(LocalDateTime.now());
        newAccountSitting.setEndDate(null);

        AccountSitting savedAccountSitting = accountSittingRepository.save(newAccountSitting);

        return new AccountSittingResponse(newAccountSitting.getId(), savedAccountSitting.getPlayerId(), savedAccountSitting.getPlayerName(), savedAccountSitting.getSitterId(), savedAccountSitting.getSitterName(), savedAccountSitting.getWorld(), savedAccountSitting.getStartDate(), savedAccountSitting.getEndDate());
    }

    public List<AccountSittingResponse> getAccountsWhereUserIsSitter(Integer sitterId) {
        List<AccountSitting> sittings = accountSittingRepository.findBySitterIdAndEndDateIsNull(sitterId);

        return sittings.stream().map(sitting -> new AccountSittingResponse(
                sitting.getId(),
                sitting.getPlayerId(),
                sitting.getPlayerName(),
                sitting.getSitterId(),
                sitting.getSitterName(),
                sitting.getWorld(),
                sitting.getStartDate(),
                sitting.getEndDate()
        )).collect(Collectors.toList());
    }

    public List<AccountSittingResponse> getSittingsByOwner(Integer playerId) {
        List<AccountSitting> sittings = accountSittingRepository.findByPlayerId(playerId);
        return sittings.stream()
                .map(sitting -> new AccountSittingResponse(
                        sitting.getId(),
                        sitting.getPlayerId(),
                        sitting.getPlayerName(),
                        sitting.getSitterId(),
                        sitting.getSitterName(),
                        sitting.getWorld(),
                        sitting.getStartDate(),
                        sitting.getEndDate()))
                .collect(Collectors.toList());
    }


    public void endSitting(Long sittingId) {
        AccountSitting sitting = accountSittingRepository.findById(sittingId)
                .orElseThrow(() -> new SittingNotFoundException("Sitting with ID " + sittingId + " not found."));

        sitting.setEndDate(LocalDateTime.now());
        accountSittingRepository.save(sitting);
    }

}
