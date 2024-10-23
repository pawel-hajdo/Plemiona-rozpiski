package plemiona.rozpiski.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "api/users")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request){
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/auth")
    public ResponseEntity<AuthenticationResponse> auth(@RequestBody AuthenticationRequest request){
        return ResponseEntity.ok(userService.authenticateUser(request));
    }

    @PutMapping()
    public void changePassword(@RequestBody ChangePasswordRequest request){
        userService.changePassword(request);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody RegisterRequest request){
        userService.resetPassword(request);
    }
}
