package com.foodconnect.controller;

import com.foodconnect.config.JwtUtil;
import com.foodconnect.model.User;
import com.foodconnect.repository.NGOProfileRepository;
import com.foodconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.foodconnect.model.NGOProfile;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final NGOProfileRepository ngoRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        User user = new User();
        user.setName((String) body.get("name"));
        user.setEmail(email);
        user.setPassword(encoder.encode((String) body.get("password")));
        user.setRole(User.Role.valueOf((String) body.get("role")));
        user.setLocation((String) body.getOrDefault("location", ""));
        if (body.containsKey("messName")) user.setMessName((String) body.get("messName"));
        if (body.containsKey("orgName")) user.setOrgName((String) body.get("orgName"));
        User saved = userRepo.save(user);

        // Auto-create NGO profile if role is NGO
        if (saved.getRole() == User.Role.NGO) {
            NGOProfile ngo = new NGOProfile();
            ngo.setUserId(saved.getId());
            ngo.setNgoName((String) body.getOrDefault("ngoName", saved.getName()));
            ngo.setLocation((String) body.getOrDefault("location", ""));
            ngo.setAccepts((String) body.getOrDefault("accepts", ""));
            ngo.setContactEmail(email);
            ngo.setContactPhone((String) body.getOrDefault("contactPhone", ""));
            ngoRepo.save(ngo);
        }

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of("id", saved.getId(), "name", saved.getName(), "email", saved.getEmail(), "role", saved.getRole())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return userRepo.findByEmail(body.get("email"))
            .filter(u -> encoder.matches(body.get("password"), u.getPassword()))
            .map(u -> {
                String token = jwtUtil.generateToken(u.getEmail(), u.getId(), u.getRole().name());
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole())
                ));
            })
            .orElse(ResponseEntity.status(401).body(Map.of("message", "Invalid email or password")));
    }
}
