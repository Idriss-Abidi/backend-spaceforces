package com.ensias.spaceforces.user;

import com.ensias.spaceforces.user.config.CustomUserDetails;
import com.ensias.spaceforces.user.dto.RegistrationDTO;
import com.ensias.spaceforces.user.dto.UserDTO;
import com.ensias.spaceforces.exception.EmailTakenException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.ensias.spaceforces.user.dto.LoginDTO;

import java.util.List;
import java.util.Map;

@RestController()
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody @Valid LoginDTO loginDTO) {
    try {
        String token = userService.login(loginDTO);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(Map.of(
                        "token", token,
                        "message", "Login successful"
                ));
    } catch (BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    } catch (DisabledException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Account is disabled");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Login failed");
    }
}


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody @Valid RegistrationDTO registrationDTO) {
        try {
            userService.registerUser(registrationDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("User registered successfully");
        } catch (EmailTakenException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already exists");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Registration failed");
        }
    }


    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo() {
        try {
            CustomUserDetails userDetails = userService.auth();
            User user = userService.findUser(userDetails.getId());
            UserDTO userDto = userService.getAllUserInfo(user);
            return ResponseEntity.ok(userDto);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error fetching user info");
        }
    }


    @GetMapping("/all-users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return new ResponseEntity<>(
                userService.getAllUsers(),
                HttpStatus.OK
        );
    }


    @PutMapping("/user/{userId}/make-admin")
    public ResponseEntity<?> makeUserAdmin(@PathVariable Long userId) {
        try {
            CustomUserDetails currentUser = userService.auth();
                User user = userService.findUser(currentUser.getId());

                if (!user.isAdmin()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can perform this action");
                }
            userService.makeUserAdmin(userId);
            return ResponseEntity.ok()
                    .body("User successfully promoted to admin");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}