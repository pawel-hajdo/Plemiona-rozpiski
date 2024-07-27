package plemiona.rozpiski.user;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final LogRepository logRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;
    private static final String BASE_URL = "https://pl200.plemiona.pl/";

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
        if(userRepository.findByName(request.getName()).isPresent()){
            throw new UserWithSameNameExistsException("User with this name already exists");
        }

        if(!checkPlayer(request.getName(), request.getCode())){
            throw new UserCodeNotMatchingException("Provided code not matching code on user profile");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User();
        newUser.setName(request.getName());
        newUser.setPassword(hashedPassword);
        var playerId = getPlayerId(request.getName());
        newUser.setPlayerId(playerId);

        userRepository.save(newUser);
        saveToLogs(newUser.getId(), LogType.USER_REGISTER);

        Map<String, Object> claims = new HashMap<>();
        claims.put("playerId", playerId.toString());

        var jwtToken = jwtService.generateToken(claims, newUser);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticateUser(AuthenticationRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getName(), request.getPassword())
        );
        var user = userRepository.findByName(request.getName()).orElseThrow();
        Map<String, Object> claims = new HashMap<>();
        claims.put("playerId", user.getPlayerId().toString());
        var jwtToken = jwtService.generateToken(claims, user);
        saveToLogs(user.getId(), LogType.USER_LOGIN_SUCCESSFUL);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    private boolean checkPlayer(String name, String code){
        String url = String.format(BASE_URL + "guest.php?name=%s", name);
        String response = restTemplate.getForObject(url, String.class);

        String profileUrl;
        String profileResponse;
        try{
             profileUrl = extractProfileUrl(response);
             profileResponse = restTemplate.getForObject(profileUrl, String.class);
        } catch (Exception e){
            throw new PlayerDoesNotExistException("Couldn't find player with this name " + name);
        }


        return profileResponse.contains(code);
    }


    private String extractProfileUrl(String response) {
        Document doc = Jsoup.parse(response);
        Element link = doc.select("a[href*=info_player]").first();
        if (link != null) {
            String relativeUrl = link.attr("href");
            return BASE_URL + relativeUrl;
        }
        return null;
    }
    private Integer extractPlayerIdFromUrl(String profileUrl) {
        try {
            URI uri = new URI(profileUrl);
            String query = uri.getQuery();
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && "id".equals(pair[0])) {
                    return Integer.parseInt(pair[1]);
                }
            }
        } catch (URISyntaxException | NumberFormatException e) {
            throw new RuntimeException("Failed to extract player ID from URL: " + profileUrl, e);
        }
        return null;
    }

    private Integer getPlayerId(String name){
        String url = String.format(BASE_URL + "guest.php?name=%s", name);
        String response = restTemplate.getForObject(url, String.class);

        String profileUrl = extractProfileUrl(response);
        if (profileUrl == null) {
            throw new PlayerDoesNotExistException("Profile URL could not be extracted for player: " + name);
        }

        return extractPlayerIdFromUrl(profileUrl);
    }

    public void changePassword(ChangePasswordRequest request) {
        var user = userRepository.findByName(request.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getName(), request.getOldPassword())
        );

        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(hashedPassword);

        userRepository.save(user);
        saveToLogs(user.getId(), LogType.USER_UPDATE);
    }

    private void saveToLogs(Long userId, LogType logType) {
        Log log = new Log();
        log.setUserId(userId);
        log.setType(logType);
        log.setDate(LocalDateTime.now());
        logRepository.save(log);
    }
}
