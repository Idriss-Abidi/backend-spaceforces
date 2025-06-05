package com.ensias.spaceforces.quiz;

import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class QuizStatusUpdateJob implements Job {

    @Autowired
    private QuizRepository quizRepository;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap jobDataMap = context.getMergedJobDataMap();
        Long quizId = jobDataMap.getLong("quizId");
        QuizStatus newStatus = QuizStatus.valueOf(jobDataMap.getString("newStatus"));

        quizRepository.findById(quizId).ifPresent(quiz -> {
            quiz.setStatus(newStatus);
            quizRepository.save(quiz);
            System.out.println("Quiz " + quizId + " status updated to " + newStatus);
        });
    }
}