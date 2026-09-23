package com.sheets.service;

import com.sheets.dto.AuthRequest;
import com.sheets.dto.AuthResponse;
import com.sheets.entity.User;
import com.sheets.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();
        String password = request.password().trim();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, username);
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();
        String password = request.password().trim();

        Optional<User> userOpt = Optional.empty();

        if (!email.isEmpty()) {
            userOpt = userRepository.findByEmail(email);
        }

        if (userOpt.isEmpty() && !username.isEmpty()) {
            userOpt = userRepository.findByUsername(username);
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();
        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getUsername());
    }
}