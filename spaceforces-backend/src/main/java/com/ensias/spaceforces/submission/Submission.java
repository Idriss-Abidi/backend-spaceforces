package com.ensias.spaceforces.submission;

import com.ensias.spaceforces.option.Option;
import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submission",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "question_id"}))
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_submission")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;


    @ManyToOne
    @JoinColumn(name = "option_id")
    private Option option;



    @Column(nullable = false)
    private int score;

    @Column(name = "completion_time", nullable = false)
    private LocalDateTime completionTime = LocalDateTime.now();
}
