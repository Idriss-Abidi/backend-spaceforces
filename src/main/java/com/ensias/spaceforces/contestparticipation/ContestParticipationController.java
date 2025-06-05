package com.ensias.spaceforces.contestparticipation;

import com.ensias.spaceforces.contestparticipation.dto.ContestParticipationDTO;
import com.ensias.spaceforces.user.UserService;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/participations")
@RequiredArgsConstructor
public class ContestParticipationController {

    private final ContestParticipationService participationService;
    private final UserService userService;
    @PostMapping
    public ResponseEntity<ContestParticipation> createParticipation(@RequestBody ContestParticipationDTO dto) {
        CustomUserDetails userDetails = userService.auth();

        return new ResponseEntity<>(
                participationService.createParticipation(dto, userDetails.getId()),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<ContestParticipation>> getAllParticipations() {
        return new ResponseEntity<>(
                participationService.getAllParticipations(),
                HttpStatus.OK
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ContestParticipation>> getParticipationsByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(participationService.getParticipationByUserId(userId));
    }

    @GetMapping("/my-participations")
    public ResponseEntity<List<ContestParticipation>> getParticipationsByUser() {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(participationService.getParticipationByUserId(userDetails.getId()));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<ContestParticipation>> getParticipationsByQuiz(
            @PathVariable Long quizId) {
        return ResponseEntity.ok(participationService.getParticipationByQuizId(quizId));
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<Boolean> checkUserParticipation(
            @PathVariable Long userId,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(
                participationService.hasUserParticipatedInQuiz(userId, quizId)
        );
    }

    @GetMapping("/my-participation/quiz/{quizId}")
    public ResponseEntity<Boolean> checkUserParticipation(
            @PathVariable Long quizId) {
        CustomUserDetails userDetails = userService.auth();
        return ResponseEntity.ok(
                participationService.hasUserParticipatedInQuiz(userDetails.getId(), quizId)
        );
    }

    @DeleteMapping("/{participationId}")
    public ResponseEntity<Void> deleteParticipation(
            @PathVariable Long participationId) {
        participationService.deleteParticipation(participationId);
        return ResponseEntity.noContent().build();
    }

}