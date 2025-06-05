package com.ensias.spaceforces.rank.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
@Data
public class RankDTO {
    private Long id;

    @NotNull(message = "Title is required")
    private String title;

    private String abbreviation;

    @NotNull(message = "Minimum points are required")
    private Integer minPoints;

    private Integer maxPoints;
}