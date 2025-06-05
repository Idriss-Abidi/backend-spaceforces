package com.ensias.spaceforces.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;


import java.time.Instant;
@Data
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;

    public ErrorResponse(HttpStatus status, String message) {
        this.timestamp = Instant.now();
        this.status = status.value();
        this.error = status.getReasonPhrase();
        this.message = message;
    }

}