package plemiona.rozpiski.accountSitting;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plemiona.rozpiski.config.JwtService;

import java.util.List;

@RestController
@RequestMapping(path = "/api/sittings")
public class AccountSittingController {


    private final AccountSittingService accountSittingService;
    private final JwtService jwtService;

    public AccountSittingController(AccountSittingService accountSittingService, JwtService jwtService) {
        this.accountSittingService = accountSittingService;
        this.jwtService = jwtService;
    }

    @PostMapping("/owner/{playerId}")
    public ResponseEntity<AccountSittingResponse> setAccountSitter(
            @PathVariable Integer playerId,
            @RequestBody AccountSittingRequest accountSittingRequest,
            HttpServletRequest request
    ){
        if(!jwtService.checkUser(playerId.toString(), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        AccountSittingResponse response = accountSittingService.setSitterForAccount(playerId, accountSittingRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sitter/{playerId}")
    public ResponseEntity<List<AccountSittingResponse>> getAccountsWhereUserIsSitter(
            @PathVariable Integer playerId,
            HttpServletRequest request
    ) {
        if(!jwtService.checkUser(playerId.toString(), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<AccountSittingResponse> sittings = accountSittingService.getAccountsWhereUserIsSitter(playerId);
        return ResponseEntity.ok(sittings);
    }

    @GetMapping("/owner/{playerId}")
    public ResponseEntity<List<AccountSittingResponse>> getSittingsByOwner(
            @PathVariable Integer playerId,
            HttpServletRequest request
    ) {
        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<AccountSittingResponse> sittings = accountSittingService.getSittingsByOwner(playerId);
        return ResponseEntity.ok(sittings);
    }

    @DeleteMapping("{sittingId}/player/{playerId}")
    public ResponseEntity<String> endSitting(
            @PathVariable Integer playerId,
            @PathVariable Long sittingId,
            HttpServletRequest request
    ){
        if(!jwtService.checkUser(playerId.toString(), request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        accountSittingService.endSitting(sittingId);
        return ResponseEntity.ok("Sitting with id " + sittingId +" ended successfully");
    }

    @PutMapping("/{sittingId}/accept/sitter/{playerId}")
    public ResponseEntity<String> acceptSittingRequest(
            @PathVariable Long sittingId,
            @PathVariable Integer playerId,
            HttpServletRequest request
    ) {
        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        accountSittingService.acceptSittingRequest(sittingId, playerId);
        return ResponseEntity.ok("Sitting request accepted.");
    }

    @PutMapping("/{sittingId}/reject/sitter/{playerId}")
    public ResponseEntity<String> rejectSittingRequest(
            @PathVariable Long sittingId,
            @PathVariable Integer playerId,
            HttpServletRequest request
    ) {
        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        accountSittingService.rejectSittingRequest(sittingId, playerId);
        return ResponseEntity.ok("Sitting request rejected.");
    }

    @PutMapping("/{sittingId}/cancel/owner/{playerId}")
    public ResponseEntity<String> cancelSittingRequest(
            @PathVariable Long sittingId,
            @PathVariable Integer playerId,
            HttpServletRequest request
    ) {
        if (!jwtService.checkUser(playerId.toString(), request)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        accountSittingService.cancelSittingRequest(sittingId, playerId);
        return ResponseEntity.ok("Sitting request canceled.");
    }
}
