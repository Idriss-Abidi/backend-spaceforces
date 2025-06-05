package com.ensias.spaceforces.contestdifficulty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contest-difficulties")
public class ContestDifficultyController {

    @Autowired
    private ContestDifficultyService contestDifficultyService;

    @GetMapping
    public List<ContestDifficulty> getAllDifficulties() {
        return contestDifficultyService.getAllDifficulties();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestDifficulty> getDifficultyById(@PathVariable Long id) {
        return ResponseEntity.ok(contestDifficultyService.getDifficultyById(id));
    }

    @PostMapping
    public ContestDifficulty createDifficulty(@RequestBody ContestDifficulty difficulty) {
        return contestDifficultyService.createDifficulty(difficulty);
    }

    @PutMapping("/{id}")
    public ContestDifficulty updateDifficulty(@PathVariable Long id, @RequestBody ContestDifficulty difficultyDetails) {
        return contestDifficultyService.updateDifficulty(id, difficultyDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteDifficulty(@PathVariable Long id) {
        contestDifficultyService.deleteDifficulty(id);
    }
}