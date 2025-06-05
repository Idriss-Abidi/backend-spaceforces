package com.ensias.spaceforces.option.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionInfosDTO {
    private Long id;
    @NotNull(message = "Specify if it's valid or not")
    private boolean valid;
    @NotNull(message = "Text is required")
    private String optionText;
}