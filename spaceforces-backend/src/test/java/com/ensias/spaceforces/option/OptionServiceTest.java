package com.ensias.spaceforces.option;

import com.ensias.spaceforces.exception.ResourceNotFoundException;
import com.ensias.spaceforces.option.dto.OptionDTO;
import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.question.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OptionServiceTest {

    @Mock private OptionRepository optionRepository;
    @Mock private QuestionRepository questionRepository;

    @InjectMocks private OptionService optionService;

    @Test
    void createOption_ValidInput_ReturnsDTO() {
        // Arrange
        OptionDTO dto = new OptionDTO();
        dto.setQuestionId(1L);
        dto.setOptionText("Test Option");
        dto.setValid(true);

        Question question = new Question();
        question.setId(1L);

        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        when(optionRepository.save(any(Option.class))).thenAnswer(invocation -> {
            Option option = invocation.getArgument(0);
            option.setId(1L);
            return option;
        });

        // Act
        OptionDTO result = optionService.createOption(dto);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId()); // Now this will pass
        assertEquals(1L, result.getQuestionId());
        assertEquals("Test Option", result.getOptionText());
        assertTrue(result.isValid());
    }
    @Test
    void createOption_InvalidQuestion_ThrowsException() {
        // Arrange
        OptionDTO dto = new OptionDTO();
        dto.setQuestionId(999L);
        when(questionRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                optionService.createOption(dto));
    }

    @Test
    void getOptionById_ExistingId_ReturnsDTO() {
        // Arrange
        Option option = Option.builder()
                .id(1L)
                .optionText("Test")
                .valid(true)
                .question(new Question())
                .build();
        when(optionRepository.findById(1L)).thenReturn(Optional.of(option));

        // Act
        OptionDTO result = optionService.getOptionById(1L);

        // Assert
        assertEquals(1L, result.getId());
        assertEquals("Test", result.getOptionText());
    }

    @Test
    void deleteOption_ExistingId_DeletesSuccessfully() {
        // Arrange
        when(optionRepository.existsById(1L)).thenReturn(true);

        // Act
        optionService.deleteOption(1L);

        // Assert
        verify(optionRepository).deleteById(1L);
    }

    @Test
    void deleteOption_NonExistingId_ThrowsException() {
        // Arrange
        when(optionRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                optionService.deleteOption(999L));
    }
}