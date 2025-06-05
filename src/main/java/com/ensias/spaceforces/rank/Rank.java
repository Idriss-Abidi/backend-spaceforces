package com.ensias.spaceforces.rank;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rank")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 20)
    private String abbreviation;

    @Column(name = "min_points", nullable = false)
    private int minPoints;

    @Column(name = "max_points", nullable = true)
    private Integer maxPoints;
}