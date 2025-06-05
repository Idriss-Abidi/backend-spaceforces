package com.ensias.spaceforces.exception;

public class EmailTakenException extends RuntimeException {
    public EmailTakenException(String message) {
        super(message);
    }

    public EmailTakenException() {
        super("Email is already taken");
    }

}