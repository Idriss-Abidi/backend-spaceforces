package com.ensias.spaceforces.quiz;

import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.quiz.dto.QuizCreateDTO;
import com.ensias.spaceforces.quiz.dto.QuizWithQuestionsDTO;
import com.ensias.spaceforces.quiz.dto.QuizDetailsDTO;
import com.ensias.spaceforces.user.UserService;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;


    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody QuizCreateDTO quizDTO) {
        CustomUserDetails userDetails = userService.auth();
        return new ResponseEntity<>(
                quizService.createQuiz(quizDTO, userDetails.getId()),
                HttpStatus.CREATED
        );
    }


        @PostMapping("/with-questions")
        public ResponseEntity<Quiz> createQuizWithQuestions(
                @RequestBody QuizWithQuestionsDTO quizDTO) {
            CustomUserDetails userDetails = userService.auth();
            return new ResponseEntity<>(
                    quizService.createQuizWithQuestions(quizDTO,  userDetails.getId()),
                    HttpStatus.CREATED
            );
        }



    @GetMapping
    public ResponseEntity<?> getQuizzes(
            @RequestParam(required = false) QuizMode mode,
            @RequestParam(required = false) QuizStatus status) {

        if (mode != null && status != null) {
            return ResponseEntity.ok(quizService.getQuizzesByModeAndStatus(mode, status));
        } else if (mode != null) {
            return ResponseEntity.ok(quizService.getQuizzesByMode(mode));
        } else if (status != null) {
            return ResponseEntity.ok(quizService.getQuizzesByStatus(status));
        }
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }


    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<Quiz> updateQuizStatus(
            @PathVariable Long id,
            @RequestParam QuizStatus newStatus) {
        return ResponseEntity.ok(quizService.updateQuizStatus(id, newStatus));
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuizQuestions(
            @PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizQuestions(quizId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Quiz>> getQuizzesByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getQuizzesByUserId(userId));
    }

    @GetMapping("/my-quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesByUser() {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(quizService.getQuizzesByUserId(userDetails.getId()));
    }


    @GetMapping("/{id}/details")
    public ResponseEntity<QuizDetailsDTO> getQuizDetails(
            @PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizDetailsById(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(@PathVariable Long id) throws AccessDeniedException {
        CustomUserDetails userDetails = userService.auth();
        quizService.deleteQuiz(id, userDetails.getId());
    }




}