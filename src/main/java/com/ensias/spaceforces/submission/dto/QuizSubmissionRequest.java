package com.ensias.spaceforces.submission.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizSubmissionRequest {
    private Long userId;
//    @NotNull(message = "Date is required")
    private LocalDateTime completionTime;
    private List<QuestionSubmission> submissions;

    @Data
    public static class QuestionSubmission {
        private Long questionId;
        private Long optionId;
    }
}