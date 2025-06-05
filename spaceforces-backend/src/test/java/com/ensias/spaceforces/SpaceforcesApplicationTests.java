package com.ensias.spaceforces;

import com.ensias.spaceforces.config.TestCloudinaryConfig;
import com.ensias.spaceforces.config.TestQuartzConfig;
import com.ensias.spaceforces.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import({TestCloudinaryConfig.class, TestQuartzConfig.class, TestSecurityConfig.class})
class SpaceforcesApplicationTests {

	@Test
	void contextLoads() {
	}

}
