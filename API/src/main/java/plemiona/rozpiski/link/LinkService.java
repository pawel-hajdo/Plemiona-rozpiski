package plemiona.rozpiski.link;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LinkService {

    private final LinkRepository linkRepository;

    public LinkService(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    public LinkResponse getLinksByPlayerId(String playerId) {
        List<String> links = linkRepository.findByPlayerId(playerId).stream()
                .map(Link::getUrl)
                .collect(Collectors.toList());
        return new LinkResponse(links);
    }
}
