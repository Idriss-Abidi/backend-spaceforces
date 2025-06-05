package com.ensias.spaceforces.quiz;

import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "difficulty_id")
    private ContestDifficulty difficulty;

    private String topic;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(nullable = false)
    private int duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_quiz", nullable = false)
    private QuizStatus status=QuizStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_quiz", nullable = false)
    private QuizMode mode;

}