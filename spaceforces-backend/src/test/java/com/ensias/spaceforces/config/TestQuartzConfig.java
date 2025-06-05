package com.ensias.spaceforces.config;

import org.mockito.Mockito;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestQuartzConfig {

    @Bean
    @Primary
    public Scheduler quartzScheduler() throws SchedulerException {
        Scheduler mockScheduler = Mockito.mock(Scheduler.class);
        Mockito.doNothing().when(mockScheduler).start();
        Mockito.doNothing().when(mockScheduler).shutdown();
        Mockito.doNothing().when(mockScheduler).scheduleJob(Mockito.any(), Mockito.any());
        Mockito.doNothing().when(mockScheduler).deleteJob(Mockito.any());
        return mockScheduler;
    }
} 