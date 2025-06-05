package com.ensias.spaceforces.contestparticipation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContestParticipationDTO {
    private Long id;
    @NotNull(message = "User ID is required")
    private Long userId;
    @NotNull(message = "Quiz ID is required")
    private Long quizId;
}