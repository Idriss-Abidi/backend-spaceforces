package com.ensias.spaceforces.question;

import com.ensias.spaceforces.option.dto.OptionInfosDTO;
import com.ensias.spaceforces.question.dto.QuestionDTO;
import com.ensias.spaceforces.user.UserService;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createQuestionWithImage(
            @RequestPart("question") @Valid QuestionDTO questionDTO,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            QuestionDTO createdQuestion = questionService.createQuestionWithImage(questionDTO, imageFile);
            return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Image upload failed",
                            "message", e.getMessage(),
                            "timestamp", Instant.now()
                    ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Question creation failed",
                            "message", e.getMessage(),
                            "timestamp", Instant.now()
                    ));
        }
    }


    @PutMapping("/{id}/add-image")
    public ResponseEntity<?> addQuestionImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) {

        try {
            QuestionDTO updatedQuestion = questionService.addImageToQuestion(id, imageFile);
            return ResponseEntity.ok(updatedQuestion);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Image upload failed",
                            "message", e.getMessage(),
                            "timestamp", Instant.now()
                    ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error", "Question update failed",
                            "message", e.getMessage(),
                            "timestamp", Instant.now()
                    ));
        }
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return new ResponseEntity<>(
                questionService.getAllQuestions(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }
    @GetMapping("/{questionId}/options")
    public ResponseEntity<List<OptionInfosDTO>> getQuestionOptions(
            @PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getQuestionOptions(questionId));
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
    }

}