package com.ensias.spaceforces.stat;

import com.ensias.spaceforces.quiz.QuizService;
import com.ensias.spaceforces.submission.SubmissionService;
import com.ensias.spaceforces.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.ensias.spaceforces.quiz.QuizStatus.CREATED;

@RestController
public class StatContoller {
    private final QuizService quizService;
    private final UserService userService;
    private final SubmissionService submissionService;

    public StatContoller(QuizService quizService, UserService userService, SubmissionService submissionService) {
        this.quizService = quizService;
        this.userService = userService;
        this.submissionService = submissionService;
    }


    @GetMapping("/stats")
    public ResponseEntity<StatDTO> getStats() {
        Long quizes= (long) quizService.getAllQuizzes().size();
        Long users= (long) userService.getAllUsers().size();
        Long submissions= (long) submissionService.getAllSubmissions().size();
        Long upcomingquizes= (long) quizService.getQuizzesByStatus(CREATED).size();
        StatDTO statDTO = new StatDTO();
        statDTO.quizes = quizes;
        statDTO.users = users;
        statDTO.submissions = submissions;
        statDTO.upcomingquizes = upcomingquizes;
        return ResponseEntity.ok(statDTO);
    }

}
