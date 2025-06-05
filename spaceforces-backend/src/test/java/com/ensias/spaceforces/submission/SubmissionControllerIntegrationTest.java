package com.ensias.spaceforces.submission;

import com.ensias.spaceforces.BaseIntegrationTest;
import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.contestdifficulty.ContestDifficultyRepository;
import com.ensias.spaceforces.contestparticipation.ContestParticipation;
import com.ensias.spaceforces.option.Option;
import com.ensias.spaceforces.option.OptionRepository;
import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.question.QuestionRepository;
import com.ensias.spaceforces.quiz.*;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.submission.dto.QuizSubmissionRequest;
import com.ensias.spaceforces.submission.dto.SubmissionDTO;
import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserRepository;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

class SubmissionControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private RankRepository rankRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private ContestDifficultyRepository difficultyRepository;

    private User testUser;
    private Quiz testQuiz;
    private Question testQuestion;
    private Option testOption;
    private String authToken;
    private Rank defaultRank;
    private ContestDifficulty difficulty;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        quizRepository.deleteAll();
        rankRepository.deleteAll();
        questionRepository.deleteAll();
        optionRepository.deleteAll();
        difficultyRepository.deleteAll();

        entityManager.createNativeQuery("ALTER TABLE rank ALTER COLUMN id RESTART WITH 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE app_users ALTER COLUMN id RESTART WITH 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE quizzes ALTER COLUMN id RESTART WITH 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE questions ALTER COLUMN id RESTART WITH 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE options ALTER COLUMN id RESTART WITH 1").executeUpdate();
        entityManager.createNativeQuery("ALTER TABLE contest_difficulty ALTER COLUMN id RESTART WITH 1").executeUpdate();

        difficulty = ContestDifficulty.builder()
                .abbreviation("Easy")
                .diff("Easy difficulty")
                .build();
        difficulty = difficultyRepository.save(difficulty);

        defaultRank = Rank.builder()
                .title("Beginner")
                .abbreviation("BEG")
                .minPoints(0)
                .maxPoints(100)
                .build();
        defaultRank = rankRepository.save(defaultRank);

        // Create test user
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .isAdmin(false)
                .rank(defaultRank)
                .points(0)
                .build();
        testUser = userRepository.save(testUser);

        testQuiz = Quiz.builder()
                .title("Test Quiz")
                .description("Test Description")
                .difficulty(difficulty)
                .topic("Test Topic")
                .createdBy(testUser)
                .startDateTime(LocalDateTime.now().plusHours(1))
                .duration(30)
                .status(QuizStatus.LIVE)  
                .mode(QuizMode.PUBLIC)
                .createdAt(LocalDateTime.now())
                .build();
        testQuiz = quizRepository.save(testQuiz);

        // Create test question
        testQuestion = Question.builder()
                .quiz(testQuiz)
                .questionText("Test Question")
                .points(10)
                .build();
        testQuestion = questionRepository.save(testQuestion);

        // Create test options
        testOption = Option.builder()
                .question(testQuestion)
                .optionText("Test Option")
                .valid(true)
                .build();
        testOption = optionRepository.save(testOption);

        Option incorrectOption = Option.builder()
                .question(testQuestion)
                .optionText("Incorrect Option")
                .valid(false)
                .build();
        optionRepository.save(incorrectOption);
    }

    private String getAuthToken() throws Exception {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("password123");

        ResultActions loginResult = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)));

        return objectMapper.readTree(loginResult.andReturn().getResponse().getContentAsString())
                .get("token").asText();
    }

    @Test
    void shouldSubmitQuiz() throws Exception {
        // Arrange
        String token = getAuthToken();
        QuizSubmissionRequest request = new QuizSubmissionRequest();
        List<QuizSubmissionRequest.QuestionSubmission> submissions = new ArrayList<>();
        
        QuizSubmissionRequest.QuestionSubmission submission = new QuizSubmissionRequest.QuestionSubmission();
        submission.setQuestionId(testQuestion.getId());
        submission.setOptionId(testOption.getId());
        submissions.add(submission);
        
        request.setSubmissions(submissions);

        // Act & Assert
        mockMvc.perform(post("/submissions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(testUser.getId()))
                .andExpect(jsonPath("$.quiz.id").value(testQuiz.getId()))
                .andExpect(jsonPath("$.score").value(10)) // Since our test option is valid and question points is 10
                .andExpect(jsonPath("$.completionTime").exists())
                .andExpect(jsonPath("$.user.points").value(10)) // User points should be updated
                .andExpect(jsonPath("$.quiz.status").value("LIVE"))
                .andExpect(jsonPath("$.quiz.mode").value("PUBLIC"));
    }

    @Test
    void shouldFailSubmissionForNonLiveQuiz() throws Exception {
        // Change quiz status to CREATED
        testQuiz.setStatus(QuizStatus.CREATED);
        quizRepository.save(testQuiz);

        // Arrange
        String token = getAuthToken();
        QuizSubmissionRequest request = new QuizSubmissionRequest();
        List<QuizSubmissionRequest.QuestionSubmission> submissions = new ArrayList<>();
        
        QuizSubmissionRequest.QuestionSubmission submission = new QuizSubmissionRequest.QuestionSubmission();
        submission.setQuestionId(testQuestion.getId());
        submission.setOptionId(testOption.getId());
        submissions.add(submission);
        
        request.setSubmissions(submissions);

        // Act & Assert
        mockMvc.perform(post("/submissions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Quiz is not Live")));
    }

    @Test
    void shouldFailDuplicateSubmission() throws Exception {
        // First submission
        String token = getAuthToken();
        QuizSubmissionRequest request = new QuizSubmissionRequest();
        List<QuizSubmissionRequest.QuestionSubmission> submissions = new ArrayList<>();
        
        QuizSubmissionRequest.QuestionSubmission submission = new QuizSubmissionRequest.QuestionSubmission();
        submission.setQuestionId(testQuestion.getId());
        submission.setOptionId(testOption.getId());
        submissions.add(submission);
        
        request.setSubmissions(submissions);

        mockMvc.perform(post("/submissions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Second submission - should fail
        mockMvc.perform(post("/submissions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("User already submitted answer for question")));
    }

    @Test
    void shouldUpdateUserRankAfterSubmission() throws Exception {
        // Create a higher rank
        Rank advancedRank = Rank.builder()
                .title("Advanced")
                .abbreviation("ADV")
                .minPoints(10)
                .maxPoints(200)
                .build();
        rankRepository.save(advancedRank);

        // Submit quiz
        String token = getAuthToken();
        QuizSubmissionRequest request = new QuizSubmissionRequest();
        List<QuizSubmissionRequest.QuestionSubmission> submissions = new ArrayList<>();
        
        QuizSubmissionRequest.QuestionSubmission submission = new QuizSubmissionRequest.QuestionSubmission();
        submission.setQuestionId(testQuestion.getId());
        submission.setOptionId(testOption.getId());
        submissions.add(submission);
        
        request.setSubmissions(submissions);

        // Act & Assert
        mockMvc.perform(post("/submissions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.rank.title").value("Advanced")) // User should be promoted
                .andExpect(jsonPath("$.user.points").value(10));
    }


    @Test
    void shouldGetSubmissionsByUser() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldGetMySubmissions() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/my-submissions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldGetSubmissionsByQuiz() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/quiz/" + testQuiz.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldCountSubmissionsByQuiz() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/quiz-count/" + testQuiz.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNumber());
    }

    @Test
    void shouldGetSubmissionsByUserAndQuiz() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/user/" + testUser.getId() + "/quiz/" + testQuiz.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void shouldGetMySubmissionsByQuiz() throws Exception {
        // Arrange
        String token = getAuthToken();

        // Act & Assert
        mockMvc.perform(get("/submissions/my-submission/quiz/" + testQuiz.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
} 