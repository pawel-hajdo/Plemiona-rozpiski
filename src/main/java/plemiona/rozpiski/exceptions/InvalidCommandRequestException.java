package plemiona.rozpiski.exceptions;

public class InvalidCommandRequestException extends RuntimeException {
    public InvalidCommandRequestException(String message) {
        super(message);
    }
}
