package plemiona.rozpiski.exceptions;

public class UserCodeNotMatchingException extends RuntimeException {
    public UserCodeNotMatchingException(String message) {
        super(message);
    }
}
