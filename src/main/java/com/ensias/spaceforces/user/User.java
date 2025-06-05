package com.ensias.spaceforces.user;

import com.ensias.spaceforces.rank.Rank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin;

    @ManyToOne
    @JoinColumn(name = "rank_id")
    private Rank rank;

    @Column(nullable = false)
    private int points=0;

    @Column
    private String description;

}