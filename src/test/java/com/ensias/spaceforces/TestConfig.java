package com.ensias.spaceforces;

import com.cloudinary.Cloudinary;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.Map;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "mock-cloud");
        config.put("api_key", "mock-key");
        config.put("api_secret", "mock-secret");
        return new Cloudinary(config);
    }
}