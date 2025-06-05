package com.ensias.spaceforces.question;

import com.cloudinary.Cloudinary;
import com.ensias.spaceforces.exception.ResourceNotFoundException;
import com.ensias.spaceforces.option.OptionRepository;
import com.ensias.spaceforces.quiz.Quiz;
import com.ensias.spaceforces.question.dto.QuestionDTO;
import com.ensias.spaceforces.quiz.QuizRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock private QuestionRepository questionRepository;
    @Mock private QuizRepository quizRepository;

    @InjectMocks private QuestionService questionService;

    @Test
    void createQuestionWithImage_ValidInput_ReturnsDTO() throws Exception {
        // Arrange
        QuestionDTO dto = new QuestionDTO();
        dto.setQuizId(1L);
        MultipartFile imageFile = new MockMultipartFile("test.jpg", new byte[0]);
        Quiz quiz = new Quiz();

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(questionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        QuestionDTO result = questionService.createQuestionWithImage(dto, imageFile);

        // Assert
        assertNotNull(result);
        verify(questionRepository).save(any());
    }

    @Test
    void getQuestionById_ExistingId_ReturnsQuestion() {
        // Arrange
        Question question = new Question();
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        // Act
        Question result = questionService.getQuestionById(1L);

        // Assert
        assertNotNull(result);
    }

    @Test
    void deleteQuestion_ExistingId_DeletesEntity() {
        // Arrange
        Question question = new Question();
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        // Act
        questionService.deleteQuestion(1L);

        // Assert
        verify(questionRepository).delete(question);
    }
}