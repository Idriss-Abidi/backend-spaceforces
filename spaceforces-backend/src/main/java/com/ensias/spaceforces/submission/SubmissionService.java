package com.ensias.spaceforces.submission;

import com.ensias.spaceforces.contestparticipation.ContestParticipation;
import com.ensias.spaceforces.contestparticipation.ContestParticipationRepository;
import com.ensias.spaceforces.exception.BadRequestException;
import com.ensias.spaceforces.exception.ResourceNotFoundException;
import com.ensias.spaceforces.option.Option;
import com.ensias.spaceforces.option.OptionRepository;
import com.ensias.spaceforces.question.Question;
import com.ensias.spaceforces.question.QuestionRepository;
import com.ensias.spaceforces.quiz.Quiz;
import com.ensias.spaceforces.quiz.QuizRepository;
import com.ensias.spaceforces.quiz.QuizService;
import com.ensias.spaceforces.quiz.QuizStatus;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.submission.dto.QuizSubmissionRequest;
import com.ensias.spaceforces.submission.dto.SubmissionDTO;
import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final ContestParticipationRepository participationRepository;
    private final RankRepository rankRepository;


    public List<SubmissionDTO> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionByUserId(Long userId) {
        return submissionRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .toList();
    }

    private SubmissionDTO convertToDto(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUser().getId());
        dto.setQuestionId(submission.getQuestion().getId());
        dto.setOptionId(submission.getOption().getId());
        return dto;
    }


    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionByQuizId(Long quizId) {
        return submissionRepository.findByQuestionQuizId(quizId).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubmissionDTO> getSubmissionByUserIdAndQuizId(Long userId, Long quizId) {
        return submissionRepository.findByUserIdAndQuestionQuizId(userId, quizId).stream()
                .map(this::convertToDto)
                .toList();
    }


    @Transactional
    public ContestParticipation processQuizSubmission(QuizSubmissionRequest request, Long idUser) {
        Long quizId = validateSameQuiz(request.getSubmissions());

        int totalScore = 0;
        for (QuizSubmissionRequest.QuestionSubmission qs : request.getSubmissions()) {
            Submission submission = processSingleSubmission(idUser, qs);
            totalScore += submission.getScore();
        }

        return updateParticipationScore(idUser, quizId, totalScore, LocalDateTime.now());
    }

    private Submission processSingleSubmission(Long userId, QuizSubmissionRequest.QuestionSubmission qs) {
        if (submissionRepository.existsByUserIdAndQuestionId(userId, qs.getQuestionId())) {
            throw new BadRequestException("User already submitted answer for question: " + qs.getQuestionId());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Question question = questionRepository.findById(qs.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + qs.getQuestionId()));
        Option option = optionRepository.findById(qs.getOptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Option not found: " + qs.getOptionId()));

        int score = option.isValid() ? question.getPoints() : 0;

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setQuestion(question);
        submission.setOption(option);
        submission.setScore(score);
        submission.setCompletionTime(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    private ContestParticipation updateParticipationScore(Long userId, Long quizId, int totalScore, LocalDateTime completionTime) {
        ContestParticipation participation = participationRepository
                .findByUserIdAndQuizId(userId, quizId)
                .orElseGet(() -> {
                    ContestParticipation newParticipation = new ContestParticipation();
                    newParticipation.setUser(userRepository.findById(userId).get());
                    newParticipation.setQuiz(quizRepository.findById(quizId).get());
                    return newParticipation;
                });

        participation.setScore(totalScore);
        participation.setCompletionTime(completionTime);


        User user = userRepository.findById(userId).orElseThrow();
        user.setPoints(user.getPoints() + totalScore);
        checkAndUpdateUserRank(user, user.getPoints());
        userRepository.save(user);

        return participationRepository.save(participation);
    }
    private void checkAndUpdateUserRank(User user, int newPoints) {
        Optional<Rank> newRank = rankRepository.findTopByMinPointsLessThanEqualOrderByMinPointsDesc(newPoints);

        if (newRank.isPresent() &&
                (user.getRank() == null || !newRank.get().getId().equals(user.getRank().getId()))) {
            user.setRank(newRank.get());
        }
    }
    private Long validateSameQuiz(List<QuizSubmissionRequest.QuestionSubmission> submissions) {
        Set<Long> quizIds = submissions.stream()
                .map(qs -> questionRepository.findById(qs.getQuestionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + qs.getQuestionId()))
                        .getQuiz().getId())
                .collect(Collectors.toSet());

        if (quizIds.size() != 1) {
            throw new BadRequestException("All questions must be from the same quiz");
        }
        Long quizId = quizIds.iterator().next();
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        if (!((QuizStatus.LIVE).equals(quiz.getStatus()))) {
            throw new BadRequestException("Quiz is not Live! Current status: " + quiz.getStatus());
        }

        return quizId;
    }

}