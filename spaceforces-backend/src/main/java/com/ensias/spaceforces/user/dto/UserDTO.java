package com.ensias.spaceforces.user.dto;

import com.ensias.spaceforces.rank.dto.RankDTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class UserDTO {
    private Long id;

    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @JsonProperty("isAdmin")
    private boolean isAdmin;
    @JsonProperty("rank")
    private RankDTO rank;
    private int points;
    private String description;
}