package com.ensias.spaceforces.contestparticipation;

import com.ensias.spaceforces.contestparticipation.dto.ContestParticipationDTO;
import com.ensias.spaceforces.quiz.Quiz;
import com.ensias.spaceforces.quiz.QuizRepository;
import com.ensias.spaceforces.quiz.QuizStatus;
import com.ensias.spaceforces.user.User;
import com.ensias.spaceforces.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestParticipationService {

    private final ContestParticipationRepository participationRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;

    public ContestParticipation createParticipation(ContestParticipationDTO participationDto, Long idUser) {
        User user = userRepository.findById(idUser)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Quiz quiz = quizRepository.findById(participationDto.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        if (participationRepository.existsByUserIdAndQuizId(participationDto.getUserId(), participationDto.getQuizId())) {
            throw new RuntimeException("User already participated in this quiz");
        }
        if (!((QuizStatus.CREATED).equals(quiz.getStatus()))) {
            throw new RuntimeException("Quiz is not available for registration! Current status: " + quiz.getStatus());
        }
        ContestParticipation participation = new ContestParticipation();
        participation.setUser(user);
        participation.setQuiz(quiz);
        participation.setScore(0);

        return participationRepository.save(participation);
    }

    public List<ContestParticipation> getAllParticipations() {
        return new ArrayList<>(participationRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<ContestParticipation> getParticipationByUserId(Long userId) {
        return participationRepository.findByUserId(userId).stream()
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ContestParticipation> getParticipationByQuizId(Long quizId) {
        return participationRepository.findByQuizId(quizId).stream()
                .sorted(Comparator.comparingInt(ContestParticipation::getScore).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean hasUserParticipatedInQuiz(Long userId, Long quizId) {
        return participationRepository.existsByUserIdAndQuizId(userId, quizId);
    }

    @Transactional
    public void deleteParticipation(Long participationId) {
        if (!participationRepository.existsById(participationId)) {
            throw new RuntimeException("Participation not found with ID: " + participationId);
        }
        System.out.println("Deleting participation: " + participationId);
        participationRepository.deleteById(participationId);
    }
}