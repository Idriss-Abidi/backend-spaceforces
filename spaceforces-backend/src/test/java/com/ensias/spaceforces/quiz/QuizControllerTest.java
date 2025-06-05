package com.ensias.spaceforces.quiz;

import com.ensias.spaceforces.quiz.dto.QuizCreateDTO;
import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserService;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizControllerTest {

    @Mock private QuizService quizService;
    @Mock private UserService userService;
    @InjectMocks private QuizController quizController;

    @Test
    void createQuiz_ValidInput_ReturnsCreated() {
        // Arrange
        User mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("pass")
                .build();

        CustomUserDetails userDetails = new CustomUserDetails(mockUser);

        when(userService.auth()).thenReturn(userDetails);
        when(quizService.createQuiz(any(), anyLong())).thenReturn(new Quiz());

        // Act
        ResponseEntity<Quiz> response = quizController.createQuiz(new QuizCreateDTO());

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }
    @Test
    void getQuizById_ExistingId_ReturnsQuiz() {
        Quiz expected = new Quiz();
        when(quizService.getQuizById(1L)).thenReturn(expected);

        ResponseEntity<Quiz> response = quizController.getQuizById(1L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void getQuizzesByFilter_NoParams_ReturnsAll() {
        when(quizService.getAllQuizzes()).thenReturn(List.of(new Quiz()));

        ResponseEntity<?> response = quizController.getQuizzes(null, null);
        assertEquals(1, ((List<?>) response.getBody()).size());
    }

    @Test
    void updateQuizStatus_ValidRequest_ReturnsUpdatedQuiz() {
        Quiz quiz = new Quiz();
        when(quizService.updateQuizStatus(anyLong(), any())).thenReturn(quiz);

        ResponseEntity<Quiz> response = quizController.updateQuizStatus(1L, QuizStatus.LIVE);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}