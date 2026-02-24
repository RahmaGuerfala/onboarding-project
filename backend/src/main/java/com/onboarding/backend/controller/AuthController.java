package com.onboarding.backend.controller;

import com.onboarding.backend.dto.*;
import com.onboarding.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ── Créer un employé — ADMIN (RH) uniquement ───────────────────────────
    @PostMapping("/create-employee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(authService.createEmployee(request));
    }

    // ── Info du token (page d'activation) — public ─────────────────────────
    @GetMapping("/token-info")
    public ResponseEntity<Map<String, String>> getTokenInfo(@RequestParam String token) {
        return ResponseEntity.ok(authService.getTokenInfo(token));
    }

    // ── Activer le compte — public ──────────────────────────────────────────
    @PostMapping("/activate")
    public ResponseEntity<String> activateAccount(@Valid @RequestBody ActivateAccountRequest request) {
        return ResponseEntity.ok(authService.activateAccount(request));
    }

    // ── Login — public ──────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}