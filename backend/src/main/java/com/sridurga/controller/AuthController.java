package com.sridurga.controller;

import com.sridurga.dto.LoginRequest;
import com.sridurga.dto.LoginResponse;
import com.sridurga.model.User;
import com.sridurga.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getUserId() == null || request.getUserId().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID and Password are required."));
        }

        Optional<User> userOpt = userRepository.findByUserId(request.getUserId().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid User ID or Password."));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid User ID or Password."));
        }

        // Generate dummy session token for demonstration
        String token = "SD-SESSION-" + UUID.randomUUID().toString();
        LoginResponse response = new LoginResponse(token, user.getUserId(), user.getFullName(), user.getRole());

        return ResponseEntity.ok(response);
    }
}
