package com.ensias.spaceforces.user;

import com.ensias.spaceforces.exception.EmailTakenException;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.ensias.spaceforces.user.dto.RegistrationDTO;
import com.ensias.spaceforces.user.dto.UserDTO;
import com.ensias.spaceforces.utils.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private RankRepository rankRepository;

    @InjectMocks private UserService userService;

    private User testUser;
    private RegistrationDTO registrationDTO;
    private LoginDTO loginDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .isAdmin(false)
                .points(0)
                .build();

        registrationDTO = new RegistrationDTO();
        registrationDTO.setUsername("testuser");
        registrationDTO.setEmail("test@example.com");
        registrationDTO.setPassword("password");
        registrationDTO.setDescription("Test description");

        loginDTO = new LoginDTO();
        loginDTO.setEmail("test@example.com");
        loginDTO.setPassword("password");
    }

    @Test
    void registerUser_ValidInput_Success() throws EmailTakenException {
        // Arrange
        Rank defaultRank = new Rank();
        defaultRank.setId(1L);
        defaultRank.setTitle("Beginner");
        defaultRank.setMinPoints(0);
        defaultRank.setMaxPoints(100);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(rankRepository.findAll()).thenReturn(List.of(defaultRank));

        // Act
        userService.registerUser(registrationDTO);

        // Assert
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_EmailTaken_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail(any())).thenReturn(true);

        // Act & Assert
        assertThrows(EmailTakenException.class, () ->
                userService.registerUser(registrationDTO));
    }

    @Test
    void login_ValidCredentials_ReturnsToken() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtTokenProvider.generateToken(any())).thenReturn("testToken");

        // Act
        String token = userService.login(loginDTO);

        // Assert
        assertEquals("testToken", token);
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        // Arrange
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () ->
                userService.login(loginDTO));
    }

    @Test
    void findUser_ExistingId_ReturnsUser() {
        // Arrange
        when(userRepository.getReferenceById(1L)).thenReturn(testUser);

        // Act
        User user = userService.findUser(1L);

        // Assert
        assertEquals("testuser", user.getUsername());
    }

    @Test
    void getAllUserInfo_ValidUser_ReturnsDTO() {
        // Arrange
        testUser.setRank(new Rank());

        // Act
        UserDTO dto = userService.getAllUserInfo(testUser);

        // Assert
        assertEquals("testuser", dto.getUsername());
        assertEquals("test@example.com", dto.getEmail());
    }

    @Test
    void makeUserAdmin_ValidUser_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        userService.makeUserAdmin(1L);

        // Assert
        assertTrue(testUser.isAdmin());
        verify(userRepository).save(testUser);
    }

    @Test
    void makeUserAdmin_AlreadyAdmin_ThrowsException() {
        // Arrange
        testUser.setAdmin(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(IllegalStateException.class, () ->
                userService.makeUserAdmin(1L));
    }

    @Test
    void registerUser_NoRanksInSystem_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(rankRepository.findAll()).thenReturn(List.of());

        // Act & Assert
        assertThrows(IllegalStateException.class, () ->
                userService.registerUser(registrationDTO));
    }
}