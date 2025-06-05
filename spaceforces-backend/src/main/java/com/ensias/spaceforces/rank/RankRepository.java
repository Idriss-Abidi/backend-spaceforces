package com.ensias.spaceforces.rank;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface RankRepository extends JpaRepository<Rank, Long> {
    Optional<Rank> findTopByMinPointsLessThanEqualOrderByMinPointsDesc(int points);
}