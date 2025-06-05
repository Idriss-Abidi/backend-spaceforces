package com.ensias.spaceforces.user;
import com.ensias.spaceforces.rank.Rank;
import com.ensias.spaceforces.rank.dto.RankDTO;
import com.ensias.spaceforces.exception.UserNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.ensias.spaceforces.rank.RankRepository;
import com.ensias.spaceforces.user.config.CustomUserDetails;
import com.ensias.spaceforces.user.dto.LoginDTO;
import com.ensias.spaceforces.user.dto.RegistrationDTO;
import com.ensias.spaceforces.user.dto.UserDTO;
import com.ensias.spaceforces.exception.EmailTakenException;
import com.ensias.spaceforces.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    protected final JwtTokenProvider jwtTokenProvider;
    private final RankRepository rankRepository;

    public CustomUserDetails auth() {
        return (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional
    public void registerUser(RegistrationDTO registrationDTO) throws EmailTakenException, IllegalStateException {

        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new EmailTakenException();
        }

        // Get the default rank (first one in the database)
        Rank defaultRank = rankRepository.findAll()
                .stream().min(Comparator.comparing(Rank::getId))
                .orElseThrow(() -> new IllegalStateException("No ranks found in the system"));

        User newUser = new User();
        newUser.setUsername(registrationDTO.getUsername());
        newUser.setEmail(registrationDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        newUser.setAdmin(false);
        newUser.setRank(defaultRank);
        newUser.setDescription(registrationDTO.getDescription());
        newUser.setPoints(0);
        userRepository.save(newUser);
    }

    public String login(LoginDTO loginDTO) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Load user details
        return jwtTokenProvider.generateToken(authentication);
    }


    private boolean isTokenExpired(Timestamp tokenExpiry) {
        return tokenExpiry.before(new Timestamp(System.currentTimeMillis()));
    }

    public User findUser(long id) {
        return userRepository.getReferenceById(id);
    }

    @Transactional(readOnly = true)
    public UserDTO getAllUserInfo(User user) {
        return mapToDto(user);
    }


    public UserDTO mapToDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAdmin(user.isAdmin());
        dto.setPoints(user.getPoints());
        dto.setDescription(user.getDescription());

        if(user.getRank() != null) {
            dto.setRank(mapRankToDto(user.getRank()));
        }


        return dto;
    }

    private RankDTO mapRankToDto(Rank rank) {
        RankDTO rankDto = new RankDTO();
        rankDto.setId(rank.getId());
        rankDto.setTitle(rank.getTitle());
        rankDto.setAbbreviation(rank.getAbbreviation());
        rankDto.setMinPoints(rank.getMinPoints());
        rankDto.setMaxPoints(rank.getMaxPoints());
        return rankDto;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .sorted(Comparator.comparingInt(UserDTO::getPoints).reversed())
                .collect(Collectors.toList());
    }


    @Transactional
    public void makeUserAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if(user.isAdmin()) {
            throw new IllegalStateException("User is already an admin");
        }

        user.setAdmin(true);
        userRepository.save(user);
    }

}