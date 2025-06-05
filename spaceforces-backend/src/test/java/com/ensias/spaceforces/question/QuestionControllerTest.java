package com.ensias.spaceforces.question;

import com.ensias.spaceforces.question.dto.QuestionDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionControllerTest {

    @Mock private QuestionService questionService;
    @InjectMocks private QuestionController questionController;

    @Test
    void createQuestionWithImage_ValidRequest_ReturnsCreated() throws Exception {
        // Arrange
        QuestionDTO dto = new QuestionDTO();
        MockMultipartFile image = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[0]);
        when(questionService.createQuestionWithImage(any(), any())).thenReturn(dto);

        // Act
        ResponseEntity<?> response = questionController.createQuestionWithImage(dto, image);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void addQuestionImage_UploadFailure_ReturnsError() throws Exception {
        // Arrange
        MockMultipartFile image = new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[0]);
        when(questionService.addImageToQuestion(any(), any())).thenThrow(new IOException("Upload failed"));

        // Act
        ResponseEntity<?> response = questionController.addQuestionImage(1L, image);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAllQuestions_ReturnsList() {
        // Arrange
        when(questionService.getAllQuestions()).thenReturn(List.of(new Question()));

        // Act
        ResponseEntity<List<Question>> response = questionController.getAllQuestions();

        // Assert
        assertEquals(1, response.getBody().size());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}