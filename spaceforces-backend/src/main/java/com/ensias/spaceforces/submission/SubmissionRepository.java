package com.ensias.spaceforces.submission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserId(Long userId);
    List<Submission> findByQuestionQuizId(Long quizId);
    List<Submission> findByUserIdAndQuestionQuizId(Long userId, Long quizId);
    boolean existsByUserIdAndQuestionId(Long userId, Long questionId);

}

