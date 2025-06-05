package com.ensias.spaceforces.quiz.dto;

import com.ensias.spaceforces.quiz.QuizMode;
import com.ensias.spaceforces.quiz.QuizStatus;
import lombok.Data;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

@Data
public class QuizDTO {
    private Long id;
    @NotNull(message = "Title is required")
    private String title;
    private String description;
    @NotNull(message = "Difficulty is required")
    private Long difficultyId;
    private String topic;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime startDateTime;
    private int duration;
    private QuizStatus status;
    @NotNull(message = "Mode is required")
    private QuizMode mode;
}