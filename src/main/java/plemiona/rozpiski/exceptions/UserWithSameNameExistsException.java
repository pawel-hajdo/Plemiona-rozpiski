package plemiona.rozpiski.exceptions;

public class UserWithSameNameExistsException extends RuntimeException{
    public UserWithSameNameExistsException(String message) {
        super(message);
    }
}
