package com.ensias.spaceforces.quiz;

import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.contestdifficulty.ContestDifficultyRepository;
import com.ensias.spaceforces.exception.ResourceNotFoundException;
import com.ensias.spaceforces.option.OptionRepository;
import com.ensias.spaceforces.question.QuestionRepository;
import com.ensias.spaceforces.quiz.dto.QuizCreateDTO;
 import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.SchedulerException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private ContestDifficultyRepository difficultyRepository;
    @Mock private UserRepository userRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private QuizSchedulerService schedulerService;
    @Mock private OptionRepository optionRepository;

    @InjectMocks private QuizService quizService;

    @Test
    void createQuiz_WithValidData_ReturnsSavedQuiz() throws SchedulerException {
        // Arrange
        QuizCreateDTO dto = new QuizCreateDTO();
        dto.setTitle("Test Quiz");
        dto.setDifficultyId(1L);
        dto.setStartDateTime(LocalDateTime.now().plusHours(1));
        dto.setDuration(60);
        dto.setMode(QuizMode.PUBLIC);

        ContestDifficulty difficulty = new ContestDifficulty();
        User user = new User();
        Quiz expectedQuiz = Quiz.builder().id(1L).build();

        when(difficultyRepository.findById(1L)).thenReturn(Optional.of(difficulty));
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(quizRepository.save(any(Quiz.class))).thenReturn(expectedQuiz);

        // Act
        Quiz result = quizService.createQuiz(dto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(schedulerService).scheduleQuizStatusUpdate(any(Quiz.class));
    }

    @Test
    void createQuiz_WithPastStartTime_ThrowsException() {
        QuizCreateDTO dto = new QuizCreateDTO();
        dto.setTitle("Test Quiz");
        dto.setDifficultyId(1L);
        dto.setDuration(60);
        dto.setMode(QuizMode.PUBLIC);
        dto.setStartDateTime(LocalDateTime.now().minusHours(1));

        // Mock dependencies
        when(difficultyRepository.findById(1L))
                .thenReturn(Optional.of(new ContestDifficulty()));
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(new User()));


        assertThrows(IllegalArgumentException.class, () ->
                quizService.createQuiz(dto, 1L));
    }

    @Test
    void getQuizById_ExistingId_ReturnsQuiz() {
        Quiz expected = new Quiz();
        when(quizRepository.findById(1L)).thenReturn(Optional.of(expected));

        Quiz result = quizService.getQuizById(1L);
        assertEquals(expected, result);
    }

    @Test
    void getQuizById_NonExistingId_ThrowsException() {
        when(quizRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                quizService.getQuizById(999L));
    }

    @Test
    void updateQuizStatus_ValidTransition_UpdatesStatus() {
        Quiz quiz = new Quiz();
        quiz.setStatus(QuizStatus.CREATED);
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz result = quizService.updateQuizStatus(1L, QuizStatus.LIVE);
        assertEquals(QuizStatus.LIVE, result.getStatus());
    }

    @Test
    void deleteQuiz_ValidUser_DeletesQuiz() throws Exception {
        User owner = new User();
        owner.setId(1L);
        Quiz quiz = new Quiz();
        quiz.setCreatedBy(owner);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));

        quizService.deleteQuiz(1L, 1L);
        verify(quizRepository).delete(quiz);
        verify(schedulerService).unscheduleQuizStatusUpdate(1L);
    }
}