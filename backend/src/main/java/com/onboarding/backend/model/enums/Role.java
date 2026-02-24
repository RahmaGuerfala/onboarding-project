package com.onboarding.backend.model.enums;

public enum Role {
    SALARIE,   // Employé recruté standard
    MANAGER,   // Manager (peut lui-même être un salarié recruté)
    ADMIN      // RH = Admin : gère les comptes, les parcours, les affectations
}