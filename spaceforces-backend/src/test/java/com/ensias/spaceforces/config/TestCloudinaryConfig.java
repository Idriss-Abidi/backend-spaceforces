package com.ensias.spaceforces.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@TestConfiguration
public class TestCloudinaryConfig {

    @Bean
    @Primary
    public Cloudinary cloudinary() throws Exception {
        Cloudinary mockCloudinary = mock(Cloudinary.class);
        Uploader mockUploader = mock(Uploader.class);
        
        Map<String, String> uploadResult = new HashMap<>();
        uploadResult.put("url", "https://test-cloudinary-url.com/test-image.jpg");
        
        when(mockCloudinary.uploader()).thenReturn(mockUploader);
        when(mockUploader.upload(any(), any())).thenReturn(uploadResult);
        
        return mockCloudinary;
    }
} 