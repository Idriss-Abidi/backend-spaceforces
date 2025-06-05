package com.ensias.spaceforces.user;

import com.ensias.spaceforces.BaseIntegrationTest;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.ensias.spaceforces.user.dto.RegistrationDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RankRepository rankRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    private Rank defaultRank;
    private String authToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        rankRepository.deleteAll();

        entityManager.createNativeQuery("ALTER TABLE rank ALTER COLUMN id RESTART WITH 1").executeUpdate();

        defaultRank = Rank.builder()
                .title("Beginner")
                .abbreviation("BEG")
                .minPoints(0)
                .maxPoints(100)
                .build();
        defaultRank = rankRepository.save(defaultRank);

        User adminUser = User.builder()
                .username("admin")
                .email("admin@test.com")
                .password(passwordEncoder.encode("password"))
                .isAdmin(true)
                .rank(defaultRank)
                .points(0)
                .build();
        userRepository.save(adminUser);
    }

    @Test
    void shouldRegisterNewUser() throws Exception {
        // Arrange
        RegistrationDTO registrationDTO = RegistrationDTO.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .build();

        // Act & Assert
        mockMvc.perform(post("/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().string("User registered successfully"));

        User createdUser = userRepository.findByEmail("test@example.com").orElseThrow();
        assert createdUser.getRank().getId().equals(1L);
    }

    @Test
    void shouldLoginUser() throws Exception {
        // Arrange
        User user = User.builder()
                .username("logintest")
                .email("login@test.com")
                .password(passwordEncoder.encode("password123"))
                .isAdmin(false)
                .rank(defaultRank)
                .points(0)
                .build();
        userRepository.save(user);

        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("login@test.com");
        loginDTO.setPassword("password123");

        // Act & Assert
        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void shouldGetUserInfo() throws Exception {
        // Arrange
        User user = User.builder()
                .username("infotest")
                .email("info@test.com")
                .password(passwordEncoder.encode("password123"))
                .isAdmin(false)
                .rank(defaultRank)
                .points(0)
                .build();
        userRepository.save(user);

        // Login to get token
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("info@test.com");
        loginDTO.setPassword("password123");

        ResultActions loginResult = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        String token = objectMapper.readTree(loginResult.andReturn().getResponse().getContentAsString())
                .get("token").asText();

        // Act & Assert
        mockMvc.perform(get("/user-info")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("infotest"))
                .andExpect(jsonPath("$.email").value("info@test.com"));
    }

    @Test
    void shouldMakeUserAdmin() throws Exception {
        // Arrange
        User regularUser = User.builder()
                .username("regular")
                .email("regular@test.com")
                .password(passwordEncoder.encode("password123"))
                .isAdmin(false)
                .rank(defaultRank)
                .points(0)
                .build();
        regularUser = userRepository.save(regularUser);

        // Login as admin to get token
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("admin@test.com");
        loginDTO.setPassword("password");

        ResultActions loginResult = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        String adminToken = objectMapper.readTree(loginResult.andReturn().getResponse().getContentAsString())
                .get("token").asText();

        // Act & Assert
        mockMvc.perform(put("/user/" + regularUser.getId() + "/make-admin")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("User successfully promoted to admin"));
    }
} 