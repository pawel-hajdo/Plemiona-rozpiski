package plemiona.rozpiski.config;

import java.util.List;

public record PageDto<T>(
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        List<T> content
) {
}
