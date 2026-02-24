package com.onboarding.backend.controller;

import com.onboarding.backend.model.User;
import com.onboarding.backend.model.enums.Role;
import com.onboarding.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // ── Mon profil (tous les rôles connectés) ───────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return ResponseEntity.ok(user);
    }

    // ── Liste tous les utilisateurs — ADMIN (RH) uniquement ────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // ── Liste tous les SALARIES — MANAGER et ADMIN ──────────────────────────
    @GetMapping("/salaries")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<User>> getAllSalaries() {
        return ResponseEntity.ok(userRepository.findByRole(Role.SALARIE));
    }

    // ── Liste tous les MANAGERS — ADMIN uniquement ──────────────────────────
    @GetMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllManagers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.MANAGER));
    }
}