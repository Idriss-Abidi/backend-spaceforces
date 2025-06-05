package com.ensias.spaceforces.option;

import com.ensias.spaceforces.option.dto.OptionDTO;
import com.ensias.spaceforces.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/options")
@RequiredArgsConstructor
public class OptionController {

    private final OptionService optionService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<OptionDTO> createOption(@RequestBody OptionDTO optionDTO) {
        return new ResponseEntity<>(
                optionService.createOption(optionDTO),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<OptionDTO>> getAllOptions() {
        return new ResponseEntity<>(
                optionService.getAllOptions(),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OptionDTO> getOptionById(@PathVariable Long id) {
        return ResponseEntity.ok(optionService.getOptionById(id));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOption(@PathVariable Long id) {
        optionService.deleteOption(id);
    }
}