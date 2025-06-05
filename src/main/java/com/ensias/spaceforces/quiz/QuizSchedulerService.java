package com.ensias.spaceforces.quiz;

import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;

@Service
public class QuizSchedulerService {

    @Autowired
    private Scheduler scheduler;

    public void scheduleQuizStatusUpdate(Quiz quiz) throws SchedulerException {
        if (quiz.getId() == null) {
            throw new IllegalArgumentException("Quiz ID cannot be null");
        }

        // Calculate end time (start time + duration minutes)
        Date startTime = Date.from(quiz.getStartDateTime()
                .atZone(ZoneId.systemDefault()).toInstant());
        Date endTime = Date.from(quiz.getStartDateTime()
                .plusMinutes(quiz.getDuration())
                .atZone(ZoneId.systemDefault()).toInstant());

        // Create job for starting the quiz (LIVE status)
        JobDetail startJob = JobBuilder.newJob(QuizStatusUpdateJob.class)
                .withIdentity("quiz-start-" + quiz.getId(), "quiz-jobs")
                .usingJobData("quizId", quiz.getId())
                .usingJobData("newStatus", QuizStatus.LIVE.toString())
                .storeDurably()
                .build();

        // Create trigger for start time
        Trigger startTrigger = TriggerBuilder.newTrigger()
                .withIdentity("quiz-start-trigger-" + quiz.getId(), "quiz-triggers")
                .startAt(startTime)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow())
                .forJob(startJob)
                .build();

        // Create job for ending the quiz (FINISHED status)
        JobDetail endJob = JobBuilder.newJob(QuizStatusUpdateJob.class)
                .withIdentity("quiz-end-" + quiz.getId(), "quiz-jobs")
                .usingJobData("quizId", quiz.getId())
                .usingJobData("newStatus", QuizStatus.FINISHED.toString())
                .storeDurably()
                .build();

        // Create trigger for end time
        Trigger endTrigger = TriggerBuilder.newTrigger()
                .withIdentity("quiz-end-trigger-" + quiz.getId(), "quiz-triggers")
                .startAt(endTime)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow())
                .forJob(endJob)
                .build();

        // Schedule both jobs
        scheduler.scheduleJob(startJob, startTrigger);
        scheduler.scheduleJob(endJob, endTrigger);

        System.out.println("Quiz " + quiz.getId() + " scheduled:");
        System.out.println("- LIVE at " + quiz.getStartDateTime());
        System.out.println("- FINISHED at " + quiz.getStartDateTime().plusMinutes(quiz.getDuration()));
    }

    public void unscheduleQuizStatusUpdate(Long quizId) throws SchedulerException {
        // Delete both triggers and jobs
        scheduler.unscheduleJob(TriggerKey.triggerKey("quiz-start-trigger-" + quizId, "quiz-triggers"));
        scheduler.deleteJob(JobKey.jobKey("quiz-start-" + quizId, "quiz-jobs"));

        scheduler.unscheduleJob(TriggerKey.triggerKey("quiz-end-trigger-" + quizId, "quiz-triggers"));
        scheduler.deleteJob(JobKey.jobKey("quiz-end-" + quizId, "quiz-jobs"));

        System.out.println("Quiz " + quizId + " jobs unscheduled");
    }
}