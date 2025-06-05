package com.ensias.spaceforces.contestparticipation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContestParticipationRepository extends JpaRepository<ContestParticipation, Long> {
    List<ContestParticipation> findByUserId(Long userId);
    List<ContestParticipation> findByQuizId(Long quizId);
    boolean existsByUserIdAndQuizId(Long userId, Long quizId);
    Optional<ContestParticipation> findByUserIdAndQuizId(Long userId, Long quizId);


}