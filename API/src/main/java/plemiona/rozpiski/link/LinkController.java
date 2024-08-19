package plemiona.rozpiski.link;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import plemiona.rozpiski.config.JwtService;

@RestController
@RequestMapping(path = "/api/links")
public class LinkController {

    private final LinkService linkService;
    private final JwtService jwtService;

    public LinkController(LinkService linkService, JwtService jwtService) {
        this.linkService = linkService;
        this.jwtService = jwtService;
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<LinkResponse> getLinksByPlayerId(
        @PathVariable String playerId,
        HttpServletRequest request
    ){
        if(!jwtService.checkUser(playerId, request)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        LinkResponse linkResponse = linkService.getLinksByPlayerId(playerId);
        return ResponseEntity.ok(linkResponse);
    }
}
