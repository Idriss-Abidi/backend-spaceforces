package com.ensias.spaceforces.question.dto;

import lombok.Data;
import jakarta.validation.constraints.*;


@Data
public class QuestionDTO {
    private Long id;
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
    @Min(1)
    private int points;
    private String tags;
    @NotNull(message = "Text is required")
    private String questionText;
    private String correctOption;
    private String imageUrl;

}