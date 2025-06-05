package com.ensias.spaceforces.option;

import com.ensias.spaceforces.option.dto.OptionDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OptionControllerTest {

    @Mock private OptionService optionService;
    @InjectMocks private OptionController optionController;

    @Test
    void createOption_ValidInput_ReturnsCreated() {
        // Arrange
        OptionDTO dto = new OptionDTO();
        when(optionService.createOption(any())).thenReturn(dto);

        // Act
        ResponseEntity<OptionDTO> response = optionController.createOption(dto);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getOptionById_ExistingId_ReturnsOk() {
        // Arrange
        OptionDTO dto = new OptionDTO();
        when(optionService.getOptionById(1L)).thenReturn(dto);

        // Act
        ResponseEntity<OptionDTO> response = optionController.getOptionById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void getAllOptions_ReturnsList() {
        // Arrange
        when(optionService.getAllOptions()).thenReturn(List.of(new OptionDTO()));

        // Act
        ResponseEntity<List<OptionDTO>> response = optionController.getAllOptions();

        // Assert
        assertEquals(1, response.getBody().size());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteOption_ValidId_ReturnsNoContent() {
        // Act
        optionController.deleteOption(1L);

        // Assert
        verify(optionService).deleteOption(1L);
        // Status is verified by @ResponseStatus annotation
    }
}