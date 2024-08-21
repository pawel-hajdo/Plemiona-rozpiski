package plemiona.rozpiski.accountSitting;

import org.springframework.stereotype.Service;
import plemiona.rozpiski.exceptions.ActiveSittingAlreadyExistsException;
import plemiona.rozpiski.exceptions.IllegalSittingState;
import plemiona.rozpiski.exceptions.InvalidPlayerForSittingException;
import plemiona.rozpiski.exceptions.SittingNotFoundException;
import plemiona.rozpiski.user.UserService;

import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccountSittingService {

    private final AccountSittingRepository accountSittingRepository;
    private final UserService userService;

    public AccountSittingService(AccountSittingRepository accountSittingRepository, UserService userService) {
        this.accountSittingRepository = accountSittingRepository;
        this.userService = userService;
    }

    public AccountSittingResponse setSitterForAccount(Integer playerId, AccountSittingRequest request){
        List<AccountSittingStatus> statuses = List.of(AccountSittingStatus.ACTIVE, AccountSittingStatus.PENDING);
        Optional<AccountSitting> existingSittingOpt = accountSittingRepository.findByPlayerIdAndWorldAndStatusIn(playerId, request.world(), statuses);

        if (existingSittingOpt.isPresent()) {
            AccountSitting existingSitting = existingSittingOpt.get();

            if (existingSitting.getStatus() == AccountSittingStatus.ACTIVE) {
                throw new ActiveSittingAlreadyExistsException("Player already has an active sitter in this world.");
            } else if (existingSitting.getStatus() == AccountSittingStatus.PENDING) {
                throw new ActiveSittingAlreadyExistsException("There is already a pending sitting request for this player in this world.");
            }
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
        newAccountSitting.setStartDate(null);
        newAccountSitting.setEndDate(null);
        newAccountSitting.setStatus(AccountSittingStatus.PENDING);
        newAccountSitting.setStatusChangeDate(LocalDateTime.now());

        AccountSitting savedAccountSitting = accountSittingRepository.save(newAccountSitting);

        return new AccountSittingResponse(newAccountSitting.getId(), savedAccountSitting.getPlayerId(), savedAccountSitting.getPlayerName(), savedAccountSitting.getSitterId(), savedAccountSitting.getSitterName(), savedAccountSitting.getWorld(), savedAccountSitting.getStartDate(), savedAccountSitting.getEndDate(), savedAccountSitting.getStatus());
    }

    public List<AccountSittingResponse> getAccountsWhereUserIsSitter(Integer sitterId) {
        List<AccountSittingStatus> statuses = List.of(AccountSittingStatus.ACTIVE, AccountSittingStatus.PENDING);
        List<AccountSitting> sittings = accountSittingRepository.findBySitterIdAndStatusIn(sitterId, statuses);

        return sittings.stream().map(sitting -> new AccountSittingResponse(
                sitting.getId(),
                sitting.getPlayerId(),
                sitting.getPlayerName(),
                sitting.getSitterId(),
                sitting.getSitterName(),
                sitting.getWorld(),
                sitting.getStartDate(),
                sitting.getEndDate(),
                sitting.getStatus()
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
                        sitting.getEndDate(),
                        sitting.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public void endSitting(Long sittingId) {
        AccountSitting sitting = accountSittingRepository.findById(sittingId)
                .orElseThrow(() -> new SittingNotFoundException("Sitting with ID " + sittingId + " not found."));

        if(!sitting.getStatus().equals(AccountSittingStatus.ACTIVE)){
            throw new IllegalSittingState("Sitting state before this action should be active");
        }

        sitting.setEndDate(LocalDateTime.now());
        sitting.setStatus(AccountSittingStatus.ENDED);
        sitting.setStatusChangeDate(LocalDateTime.now());
        accountSittingRepository.save(sitting);
    }

    public void acceptSittingRequest(Long sittingId, Integer sitterId) {
        AccountSitting sitting = accountSittingRepository.findById(sittingId)
                .orElseThrow(() -> new SittingNotFoundException("Sitting with ID " + sittingId + " not found."));

        if (!sitting.getSitterId().equals(sitterId)) {
            throw new InvalidPlayerForSittingException("Player ID " + sitterId + " does not match the sitting request.");
        }

        if(!sitting.getStatus().equals(AccountSittingStatus.PENDING)){
            throw new IllegalSittingState("Sitting state before this action should be pending");
        }
        sitting.setStartDate(LocalDateTime.now());
        sitting.setStatus(AccountSittingStatus.ACTIVE);
        sitting.setStatusChangeDate(LocalDateTime.now());
        accountSittingRepository.save(sitting);
    }

    public void rejectSittingRequest(Long sittingId, Integer sitterId) {
        AccountSitting sitting = accountSittingRepository.findById(sittingId)
                .orElseThrow(() -> new SittingNotFoundException("Sitting with ID " + sittingId + " not found."));

        if (!sitting.getSitterId().equals(sitterId)) {
            throw new InvalidPlayerForSittingException("Player ID " + sitterId + " does not match the sitting request.");
        }
        if(!sitting.getStatus().equals(AccountSittingStatus.PENDING)){
            throw new IllegalSittingState("Sitting state before this action should be pending");
        }
        sitting.setStatus(AccountSittingStatus.REJECTED);
        sitting.setStatusChangeDate(LocalDateTime.now());
        accountSittingRepository.save(sitting);
    }

    public void cancelSittingRequest(Long sittingId, Integer ownerId) {
        AccountSitting sitting = accountSittingRepository.findById(sittingId)
                .orElseThrow(() -> new SittingNotFoundException("Sitting with ID " + sittingId + " not found."));

        if (!sitting.getPlayerId().equals(ownerId)) {
            throw new InvalidPlayerForSittingException("Player ID " + ownerId + " does not match the sitting request.");
        }
        if(!sitting.getStatus().equals(AccountSittingStatus.PENDING)){
            throw new IllegalSittingState("Sitting state before this action should be pending");
        }

        sitting.setStatus(AccountSittingStatus.CANCELED);
        sitting.setStatusChangeDate(LocalDateTime.now());
        accountSittingRepository.save(sitting);
    }
}
