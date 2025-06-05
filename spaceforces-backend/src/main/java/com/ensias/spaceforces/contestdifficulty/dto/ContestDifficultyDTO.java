package com.ensias.spaceforces.contestdifficulty.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContestDifficultyDTO {
    private Long id;
    @NotBlank(message = "Name is required")
    private String diff;
    @NotBlank(message = "Abbreviation is required")
    private String abbreviation;
}