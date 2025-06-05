package com.ensias.spaceforces.quiz.dto;

import com.ensias.spaceforces.quiz.QuizMode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizCreateDTO {

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
        @NotNull(message = "Mode is required")
        private QuizMode mode;

}
