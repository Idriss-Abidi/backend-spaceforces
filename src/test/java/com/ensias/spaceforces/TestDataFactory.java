package com.ensias.spaceforces;

import com.ensias.spaceforces.contestdifficulty.ContestDifficulty;
import com.ensias.spaceforces.option.dto.OptionInfosDTO;
import com.ensias.spaceforces.question.dto.QuestionWithOptionsDTO;
import com.ensias.spaceforces.quiz.QuizMode;
import com.ensias.spaceforces.quiz.dto.*;
import com.ensias.spaceforces.user.User;

import java.time.LocalDateTime;
import java.util.List;

public class TestDataFactory {

    public static User createUser() {
        return User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .isAdmin(false)
                .build();
    }

    public static ContestDifficulty createDifficulty() {
        return ContestDifficulty.builder()
                .diff("Easy")
                .abbreviation("Ez")
                .build();
    }

    public static QuizCreateDTO createQuizCreateDTO() {
        return QuizCreateDTO.builder()
                .title("Test Quiz")
                .description("Test Description")
                .difficultyId(1L)
                .topic("General Knowledge")
                .startDateTime(LocalDateTime.now().plusHours(1))
                .duration(60)
                .mode(QuizMode.PUBLIC)
                .build();
    }

    public static QuizWithQuestionsDTO createQuizWithQuestionsDTO() {
        return QuizWithQuestionsDTO.builder()
                .title("Quiz with Questions")
                .description("Description")
                .difficultyId(1L)
                .topic("Science")
                .startDateTime(LocalDateTime.now().plusHours(2))
                .duration(90)
                .mode(QuizMode.OFFICIAL)
                .questions(List.of(createQuestionDTO()))
                .build();
    }

    public static QuestionWithOptionsDTO createQuestionDTO() {
        return QuestionWithOptionsDTO.builder()
                .questionText("What is 2+2?")
                .points(10)
                .correctOption("4")
                .options(List.of(
                        new OptionInfosDTO(1L, false, "Option A"),
                        new OptionInfosDTO(2L,  true, "Option B"),
                        new OptionInfosDTO(3L,  false, "Option C")
                ))
                .build();
    }


}