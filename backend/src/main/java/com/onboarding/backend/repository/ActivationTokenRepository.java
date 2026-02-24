package com.onboarding.backend.repository;

import com.onboarding.backend.model.ActivationToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivationTokenRepository extends MongoRepository<ActivationToken, String> {
    Optional<ActivationToken> findByToken(String token);
    List<ActivationToken> findAllByExpirationDateBeforeAndUsedFalse(LocalDateTime now);
}