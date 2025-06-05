package com.ensias.spaceforces.quiz.dto;

import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.question.dto.QuestionWithOptionsDTO;
import com.ensias.spaceforces.quiz.QuizMode;
import com.ensias.spaceforces.quiz.QuizStatus;
import com.ensias.spaceforces.user.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizDetailsDTO {
    private Long id;
    private String title;
    private String description;
    private ContestDifficulty difficultyId;
    private String topic;
    private User createdById;
    private LocalDateTime createdAt;
    private LocalDateTime startDateTime;
    private int duration;
    private QuizStatus status;
    private QuizMode mode;
    private List<QuestionWithOptionsDTO> questions;
}