package com.onboarding.backend.model;

import com.onboarding.backend.model.enums.Role;
import com.onboarding.backend.model.enums.StatutCompte;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String nom;
    private String prenom;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;
    private StatutCompte statutCompte;
    private int profilCompletion;

    private Profile profile;

    private LocalDateTime dateCreation;
    private LocalDateTime dateValidation;

    @Data
    @NoArgsConstructor
    public static class Profile {
        private String adresse;
        private String rib;
        private String telephone;
        private String image;
    }
}