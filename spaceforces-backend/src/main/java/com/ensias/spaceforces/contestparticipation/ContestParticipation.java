package com.ensias.spaceforces.contestparticipation;

import com.ensias.spaceforces.quiz.Quiz;
import com.ensias.spaceforces.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contest_participation")
@Data
public class ContestParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participation")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private int score = 0;

    @Column(name = "completion_time", nullable = false)
    private LocalDateTime completionTime = LocalDateTime.now();
}