package com.ensias.spaceforces.quiz;

import com.ensias.spaceforces.BaseIntegrationTest;
import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.contestdifficulty.ContestDifficultyRepository;
import com.ensias.spaceforces.option.dto.OptionInfosDTO;
import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.question.dto.QuestionWithOptionsDTO;
import com.ensias.spaceforces.quiz.dto.QuizCreateDTO;
import com.ensias.spaceforces.quiz.dto.QuizWithQuestionsDTO;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserRepository;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

class QuizControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RankRepository rankRepository;

    @Autowired
    private ContestDifficultyRepository difficultyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private QuizSchedulerService quizSchedulerService;

    private User testUser;
    private ContestDifficulty testDifficulty;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up
        quizRepository.deleteAll();
        userRepository.deleteAll();
        rankRepository.deleteAll();
        difficultyRepository.deleteAll();

        // Mock scheduler service
        doNothing().when(quizSchedulerService).scheduleQuizStatusUpdate(any(Quiz.class));

        // Create rank
        Rank rank = new Rank();
        rank.setTitle("Beginner");
        rank.setAbbreviation("BEG");
        rank.setMinPoints(0);
        rank.setMaxPoints(100);
        rank = rankRepository.save(rank);

        // Create test user
        testUser = User.builder()
                .username("quizmaster")
                .email("quiz@test.com")
                .password(passwordEncoder.encode("password123"))
                .isAdmin(true)
                .rank(rank)
                .points(0)
                .build();
        testUser = userRepository.save(testUser);

        // Create test difficulty
        testDifficulty = ContestDifficulty.builder()
                .diff("Easy")
                .abbreviation("Ez")
                .build();
        testDifficulty = difficultyRepository.save(testDifficulty);

        // Get auth token
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("quiz@test.com");
        loginDTO.setPassword("password123");

        ResultActions loginResult = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        authToken = objectMapper.readTree(loginResult.andReturn().getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test
    void shouldCreateQuiz() throws Exception {
        // Arrange
        QuizCreateDTO createDTO = new QuizCreateDTO();
        createDTO.setTitle("Test Quiz");
        createDTO.setDescription("Test Description");
        createDTO.setDifficultyId(testDifficulty.getId());
        createDTO.setTopic("Java");
        createDTO.setStartDateTime(LocalDateTime.now().plusDays(1));
        createDTO.setDuration(30);
        createDTO.setMode(QuizMode.PUBLIC);

        // Act & Assert
        mockMvc.perform(post("/quizzes")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Quiz"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.topic").value("Java"));
    }

    @Test
    void shouldCreateQuizWithQuestions() throws Exception {
        // Arrange
        List<OptionInfosDTO> options = Arrays.asList(
            OptionInfosDTO.builder()
                .optionText("Java Virtual Machine")
                .valid(true)
                .build(),
            OptionInfosDTO.builder()
                .optionText("Java Visual Machine")
                .valid(false)
                .build()
        );

        QuestionWithOptionsDTO question = QuestionWithOptionsDTO.builder()
                .questionText("What is JVM?")
                .points(10)
                .correctOption("Java Virtual Machine")
                .options(options)
                .build();

        QuizWithQuestionsDTO quizDTO = QuizWithQuestionsDTO.builder()
                .id(null)
                .title("Quiz With Questions")
                .description("Test Description")
                .difficultyId(testDifficulty.getId())
                .topic("Java")
                .createdById(testUser.getId())
                .startDateTime(LocalDateTime.now().plusDays(1))
                .duration(30)
                .mode(QuizMode.PUBLIC)
                .questions(List.of(question))
                .build();

        // Act & Assert
        mockMvc.perform(post("/quizzes/with-questions")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Quiz With Questions"));
    }

    @Test
    void shouldGetQuizzesByMode() throws Exception {
        // Arrange
        Quiz quiz1 = Quiz.builder()
                .title("Public Quiz 1")
                .description("Description 1")
                .difficulty(testDifficulty)
                .topic("Java")
                .createdBy(testUser)
                .startDateTime(LocalDateTime.now().plusDays(1))
                .duration(30)
                .status(QuizStatus.CREATED)
                .mode(QuizMode.PUBLIC)
                .build();

        Quiz quiz2 = Quiz.builder()
                .title("Private Quiz")
                .description("Description 2")
                .difficulty(testDifficulty)
                .topic("Python")
                .createdBy(testUser)
                .startDateTime(LocalDateTime.now().plusDays(2))
                .duration(45)
                .status(QuizStatus.CREATED)
                .mode(QuizMode.PRIVATE)
                .build();

        quizRepository.saveAll(Arrays.asList(quiz1, quiz2));

        // Act & Assert
        mockMvc.perform(get("/quizzes")
                        .header("Authorization", "Bearer " + authToken)
                        .param("mode", "PUBLIC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Public Quiz 1"));
    }

    @Test
    void shouldGetQuizById() throws Exception {
        // Arrange
        Quiz quiz = Quiz.builder()
                .title("Test Quiz")
                .description("Test Description")
                .difficulty(testDifficulty)
                .topic("Java")
                .createdBy(testUser)
                .startDateTime(LocalDateTime.now().plusDays(1))
                .duration(30)
                .status(QuizStatus.CREATED)
                .mode(QuizMode.PUBLIC)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz);

        // Act & Assert
        mockMvc.perform(get("/quizzes/" + savedQuiz.getId())
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Quiz"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void shouldGetQuizDetails() throws Exception {
        // Arrange
        Quiz quiz = Quiz.builder()
                .title("Test Quiz")
                .description("Test Description")
                .difficulty(testDifficulty)
                .topic("Java")
                .createdBy(testUser)
                .startDateTime(LocalDateTime.now().plusDays(1))
                .duration(30)
                .status(QuizStatus.CREATED)
                .mode(QuizMode.PUBLIC)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz);

        // Act & Assert
        mockMvc.perform(get("/quizzes/" + savedQuiz.getId() + "/details")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Quiz"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }
} 