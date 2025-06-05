package com.ensias.spaceforces.user;

import com.ensias.spaceforces.user.config.CustomUserDetails;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.ensias.spaceforces.user.dto.RegistrationDTO;
import com.ensias.spaceforces.user.dto.UserDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserService userService;
    @InjectMocks private UserController userController;

    private LoginDTO loginDTO;
    private RegistrationDTO registrationDTO;
    private UserDTO userDTO;
    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("password");

        registrationDTO = new RegistrationDTO();
        registrationDTO.setUsername("testuser");
        registrationDTO.setEmail("test@example.com");
        registrationDTO.setPassword("password");

        userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setUsername("testuser");
        userDTO.setEmail("test@example.com");

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .isAdmin(false)
                .build();

        adminUser = User.builder()
                .id(2L)
                .username("admin")
                .email("admin@example.com")
                .password("adminpass")
                .isAdmin(true)
                .build();
    }

    private void setupSecurityContext(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void login_ValidCredentials_ReturnsToken() {
        when(userService.login(any())).thenReturn("testToken");

        ResponseEntity<?> response = userController.login(loginDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getHeaders().get("Authorization"));
    }

    @Test
    void registerUser_ValidInput_ReturnsCreated() {
        doNothing().when(userService).registerUser(any());

        ResponseEntity<?> response = userController.registerUser(registrationDTO);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }


}