package com.ensias.spaceforces.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByStatus(QuizStatus status);
    List<Quiz> findByCreatedById(Long userId);
    List<Quiz> findByMode(QuizMode mode);
    List<Quiz> findByModeAndStatus(QuizMode mode, QuizStatus status);
}