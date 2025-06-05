package com.ensias.spaceforces.option.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OptionDTO {
    private Long id;
    @NotNull(message = "Question ID is required")
    private Long questionId;
    @NotNull(message = "Specify if it's valid or not")
    private boolean valid;
    @NotNull(message = "Text is required")
    private String optionText;
}