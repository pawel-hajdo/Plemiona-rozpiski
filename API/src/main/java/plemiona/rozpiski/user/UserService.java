package plemiona.rozpiski.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import plemiona.rozpiski.config.JwtService;
import plemiona.rozpiski.exceptions.PlayerDoesNotExistException;
import plemiona.rozpiski.exceptions.UserCodeNotMatchingException;
import plemiona.rozpiski.exceptions.UserNotFoundException;
import plemiona.rozpiski.exceptions.UserWithSameNameExistsException;
import plemiona.rozpiski.log.Log;
import plemiona.rozpiski.log.LogRepository;
import plemiona.rozpiski.log.LogType;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final LogRepository logRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;
    private Map<String, Integer> playerIdMap = new HashMap<>();

    @Autowired
    public UserService(UserRepository userRepository, LogRepository logRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.logRepository = logRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.restTemplate = restTemplate;
    }

    public AuthenticationResponse registerUser(RegisterRequest request){
        loadPlayersFromApi(request.world());
        var playerId = getPlayerId(request.name());

        if(userRepository.findByPlayerId(playerId).isPresent()){
            throw new UserWithSameNameExistsException("User with this id already exists");
        }

        if(!checkPlayer(playerId, request.code(), request.world())){
            throw new UserCodeNotMatchingException("Provided code not matching code on user profile");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User newUser = new User();
        newUser.setName(request.name());
        newUser.setPassword(hashedPassword);
        newUser.setPlayerId(playerId);
        newUser.addRole(Role.USER);

        userRepository.save(newUser);
        saveToLogs(newUser.getId(), LogType.USER_REGISTER);

        Map<String, Object> claims = new HashMap<>();
        claims.put("playerId", playerId.toString());
        claims.put("roles", newUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        var jwtToken = jwtService.generateToken(claims, newUser);
        return new AuthenticationResponse(jwtToken);
    }

    public AuthenticationResponse authenticateUser(AuthenticationRequest request){
        var user = userRepository.findByName(request.name()).orElseThrow(() -> new PlayerDoesNotExistException("User not found"));
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.name(), request.password())
        );
        Map<String, Object> claims = new HashMap<>();
        claims.put("playerId", user.getPlayerId().toString());
        claims.put("roles", user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        var jwtToken = jwtService.generateToken(claims, user);
        saveToLogs(user.getId(), LogType.USER_LOGIN_SUCCESSFUL);
        return new AuthenticationResponse(jwtToken);
    }

    public void changePassword(ChangePasswordRequest request) {
        var user = userRepository.findByName(request.name())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.name(), request.oldPassword())
        );

        String hashedPassword = passwordEncoder.encode(request.newPassword());
        user.setPassword(hashedPassword);

        userRepository.save(user);
        saveToLogs(user.getId(), LogType.USER_UPDATE);
    }

    public void resetPassword(RegisterRequest request) {
        loadPlayersFromApi(request.world());
        var playerId = getPlayerId(request.name());

        User user = userRepository.findByPlayerId(playerId).orElseThrow(() -> new PlayerDoesNotExistException("User not found"));

        if(!checkPlayer(playerId, request.code(), request.world())){
            throw new UserCodeNotMatchingException("Provided code not matching code on user profile");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        user.setPassword(hashedPassword);
        userRepository.save(user);
        saveToLogs(user.getId(), LogType.PASSWORD_RESET);
    }

    private boolean checkPlayer(Integer playerId, String code, String world){
        String profileUrl = String.format("https://%s.plemiona.pl/guest.php?screen=info_player&id=%d", world, playerId);
        String profileResponse;

        try{
             profileResponse = restTemplate.getForObject(profileUrl, String.class);
        } catch (Exception e){
            throw new PlayerDoesNotExistException("Couldn't find player with this id " + playerId);
        }
        return profileResponse.contains(code);
    }

    public Integer getPlayerId(String playerName){
        Integer playerId = playerIdMap.get(playerName);
        if (playerId == null) {
            throw new PlayerDoesNotExistException("Player with name " + playerName + " does not exist.");
        }
        return playerId;
    }

    public String getPlayerName(Integer playerId) {
        for (Map.Entry<String, Integer> entry : playerIdMap.entrySet()) {
            if (entry.getValue().equals(playerId)) {
                return entry.getKey();
            }
        }
        throw new PlayerDoesNotExistException("Player with ID " + playerId + " does not exist.");
    }

    public void loadPlayersFromApi(String world){
        String apiUrl = String.format("https://%s.plemiona.pl/map/player.txt", world);
        try {
            String response = restTemplate.getForObject(new URI(apiUrl), String.class);
            if (response != null) {
                playerIdMap.clear();
                String[] lines = response.split("\n");
                for (String line : lines) {
                    String[] parts = line.split(",");
                    if (parts.length > 1) {
                        Integer id = Integer.valueOf(parts[0]);
                        String name = parts[1];
                        String decodedName = URLDecoder.decode(name, StandardCharsets.UTF_8);
                        playerIdMap.put(decodedName, id);
                    }
                }
            }
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    private void saveToLogs(Long userId, LogType logType) {
        Log log = new Log();
        log.setUserId(userId);
        log.setType(logType);
        ZonedDateTime warsawTime = ZonedDateTime.now(ZoneId.of("Europe/Warsaw"));
        log.setDate(warsawTime.toLocalDateTime());
        logRepository.save(log);
    }
}
