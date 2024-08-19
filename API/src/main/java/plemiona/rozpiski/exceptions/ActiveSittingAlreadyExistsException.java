package plemiona.rozpiski.exceptions;

public class ActiveSittingAlreadyExistsException extends RuntimeException{
    public ActiveSittingAlreadyExistsException(String message){
        super(message);
    }
}
