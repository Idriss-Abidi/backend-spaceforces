package com.ensias.spaceforces;

import com.ensias.spaceforces.config.TestCloudinaryConfig;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Import({TestCloudinaryConfig.class})
public abstract class BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected EntityManager entityManager;

    @BeforeEach
    void setUp() {
        try {
            entityManager.createNativeQuery("ALTER TABLE rank ALTER COLUMN id RESTART WITH 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE app_users ALTER COLUMN id RESTART WITH 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE quizzes ALTER COLUMN id RESTART WITH 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE questions ALTER COLUMN id RESTART WITH 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE options ALTER COLUMN id RESTART WITH 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE contest_difficulty ALTER COLUMN id RESTART WITH 1").executeUpdate();
        } catch (Exception e) {
            System.err.println("Error resetting sequences: " + e.getMessage());
        }
    }
}