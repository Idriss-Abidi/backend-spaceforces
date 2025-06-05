package com.ensias.spaceforces.quiz;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerKey;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizSchedulerServiceTest {

    @Mock private Scheduler scheduler;
    @InjectMocks private QuizSchedulerService schedulerService;


    @Test
    void scheduleQuizStatusUpdate_ValidQuiz_SchedulesJobs() throws SchedulerException {
        Quiz quiz = Quiz.builder()
                .id(1L)
                .startDateTime(LocalDateTime.now().plusHours(1))
                .duration(60)
                .build();

        schedulerService.scheduleQuizStatusUpdate(quiz);

        verify(scheduler, times(2)).scheduleJob(any(), any());
    }

    @Test
    void unscheduleQuizStatusUpdate_ValidId_RemovesJobs() throws SchedulerException {
        schedulerService.unscheduleQuizStatusUpdate(1L);

        verify(scheduler).unscheduleJob(eq(TriggerKey.triggerKey("quiz-start-trigger-1", "quiz-triggers")));
        verify(scheduler).deleteJob(eq(JobKey.jobKey("quiz-start-1", "quiz-jobs")));
    }
}