package com.ensias.spaceforces.submission;

import com.ensias.spaceforces.submission.dto.QuizSubmissionRequest;
import com.ensias.spaceforces.submission.dto.SubmissionDTO;
import com.ensias.spaceforces.contestparticipation.*;
import com.ensias.spaceforces.user.UserService;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserService userService;



    @PostMapping
    public ResponseEntity<ContestParticipation> submitQuiz(
            @RequestBody QuizSubmissionRequest request) {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(
                submissionService.processQuizSubmission(request, userDetails.getId())
        );
    }

    @GetMapping
    public ResponseEntity<List<SubmissionDTO>> getAllSubmissions() {
        return new ResponseEntity<>(
                submissionService.getAllSubmissions(),
                HttpStatus.OK
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(submissionService.getSubmissionByUserId(userId));
    }
    @GetMapping("/my-submissions")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByUser() {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(submissionService.getSubmissionByUserId(userDetails.getId()));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByQuiz(
            @PathVariable Long quizId) {
        return ResponseEntity.ok(submissionService.getSubmissionByQuizId(quizId));
    }

    @GetMapping("/quiz-count/{quizId}")
    public ResponseEntity<Long> countSubmissionsByQuiz(
            @PathVariable Long quizId) {
        return ResponseEntity.ok((long) submissionService.getSubmissionByQuizId(quizId).size());
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByUserAndQuiz(
            @PathVariable Long userId,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(submissionService.getSubmissionByUserIdAndQuizId(userId, quizId));
    }

    @GetMapping("/my-submission/quiz/{quizId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByUserAndQuiz(
            @PathVariable Long quizId) {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(submissionService.getSubmissionByUserIdAndQuizId(userDetails.getId(), quizId));
    }


}
