package com.ensias.spaceforces.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data

public class SubmissionDTO {
    private Long id;
    @NotNull(message = "User is required")
    private Long userId;
    @NotNull(message = "Question is required")
    private Long questionId;
    @NotNull(message = "Option is required")
    private Long optionId;
}
