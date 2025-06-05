package com.ensias.spaceforces.rank;

import com.ensias.spaceforces.rank.dto.RankDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ranks")
@RequiredArgsConstructor
public class RankController {

    private final RankService rankService;

    @PostMapping
    public ResponseEntity<RankDTO> createRank(@RequestBody RankDTO rankDTO) {
        return new ResponseEntity<>(
                rankService.createRank(rankDTO),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<RankDTO>> getAllRanks() {
        return ResponseEntity.ok(rankService.getAllRanks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RankDTO> getRankById(@PathVariable Long id) {
        return ResponseEntity.ok(rankService.getRankById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RankDTO> updateRank(
            @PathVariable Long id,
            @RequestBody RankDTO rankDTO) {
        return ResponseEntity.ok(rankService.updateRank(id, rankDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRank(@PathVariable Long id) {
        rankService.deleteRank(id);
        return ResponseEntity.noContent().build();
    }
}