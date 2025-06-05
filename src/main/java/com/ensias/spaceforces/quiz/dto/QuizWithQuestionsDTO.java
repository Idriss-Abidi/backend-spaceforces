package com.ensias.spaceforces.quiz.dto;

import com.ensias.spaceforces.question.dto.QuestionWithOptionsDTO;
import com.ensias.spaceforces.quiz.QuizMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;


import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
public class QuizWithQuestionsDTO {
    private Long id;

    @NotNull(message = "Title is required")
    private String title;
    private String description;
    @NotNull(message = "Difficulty is required")
    private Long difficultyId;
    private String topic;
    private Long createdById;
    private LocalDateTime startDateTime;
    private int duration;
    @NotNull(message = "Mode is required")
    private QuizMode mode;
    private List<QuestionWithOptionsDTO> questions; 
}