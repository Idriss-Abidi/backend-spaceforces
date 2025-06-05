package com.ensias.spaceforces.question.dto;
import com.ensias.spaceforces.option.dto.OptionInfosDTO;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionWithOptionsDTO {
    private Long id;
    @Min(1)
    private int points;
    private String tags;
    @NotNull(message = "Text is required")
    private String questionText;
    private String correctOption;
    private String imageUrl;
    private List<OptionInfosDTO> options;
}