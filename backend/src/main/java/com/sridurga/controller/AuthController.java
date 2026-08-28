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
        LoginResponse response = new LoginResponse(
            token, 
            user.getId(), 
            user.getUserId(), 
            user.getFullName(), 
            user.getRole(), 
            user.getPermissions() != null ? user.getPermissions() : "all"
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(u -> Map.of(
            "id", u.getId(),
            "userId", u.getUserId(),
            "fullName", u.getFullName(),
            "role", u.getRole(),
            "permissions", u.getPermissions() != null ? u.getPermissions() : "all",
            "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
        )).toList());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        String password = payload.get("password");
        String fullName = payload.get("fullName");
        String role = payload.get("role");
        String permissions = payload.get("permissions");

        if (userId == null || userId.trim().isEmpty() || password == null || password.trim().isEmpty() || fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID, Full Name, and Password are required."));
        }

        userId = userId.trim().toLowerCase();
        if (userRepository.existsByUserId(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID '" + userId + "' already exists."));
        }

        User user = new User();
        user.setUserId(userId);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName.trim());
        user.setRole(role != null && !role.trim().isEmpty() ? role.trim().toUpperCase() : "STAFF");
        user.setPermissions(permissions != null && !permissions.trim().isEmpty() ? permissions.trim() : "all");

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "userId", saved.getUserId(),
            "fullName", saved.getFullName(),
            "role", saved.getRole(),
            "permissions", saved.getPermissions(),
            "message", "User created successfully"
        ));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (payload.containsKey("fullName") && payload.get("fullName") != null) {
            user.setFullName(payload.get("fullName").trim());
        }
        if (payload.containsKey("role") && payload.get("role") != null) {
            user.setRole(payload.get("role").trim().toUpperCase());
        }
        if (payload.containsKey("permissions") && payload.get("permissions") != null) {
            user.setPermissions(payload.get("permissions").trim());
        }
        if (payload.containsKey("password") && payload.get("password") != null && !payload.get("password").trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(payload.get("password").trim()));
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "userId", saved.getUserId(),
            "fullName", saved.getFullName(),
            "role", saved.getRole(),
            "permissions", saved.getPermissions(),
            "message", "User updated successfully"
        ));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if ("admin".equalsIgnoreCase(user.getUserId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Master Admin account cannot be deleted."));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
