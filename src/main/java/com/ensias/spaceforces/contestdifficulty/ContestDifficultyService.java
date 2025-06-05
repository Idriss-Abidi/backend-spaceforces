package com.ensias.spaceforces.contestdifficulty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ContestDifficultyService {

    @Autowired
    private ContestDifficultyRepository contestDifficultyRepository;

    public List<ContestDifficulty> getAllDifficulties() {
        return contestDifficultyRepository.findAll();
    }

    public ContestDifficulty getDifficultyById(Long id) {
        return contestDifficultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Difficulty not found"));
    }

    public ContestDifficulty createDifficulty(ContestDifficulty difficulty) {
        return contestDifficultyRepository.save(difficulty);
    }

    public ContestDifficulty updateDifficulty(Long id, ContestDifficulty difficultyDetails) {
        ContestDifficulty difficulty = contestDifficultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Difficulty not found"));
        difficulty.setDiff(difficultyDetails.getDiff());
        difficulty.setAbbreviation(difficultyDetails.getAbbreviation());
        return contestDifficultyRepository.save(difficulty);
    }

    public void deleteDifficulty(Long id) {
        contestDifficultyRepository.deleteById(id);
    }
}