package com.onboarding.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendActivationEmail(String toEmail, String token, String fullName) {
        String activationLink = frontendUrl + "/activate-account?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Activez votre compte - Onboarding");
        message.setText(
                "Bonjour " + fullName + ",\n\n" +
                        "Votre compte a été créé. Veuillez cliquer sur le lien ci-dessous pour activer votre compte " +
                        "et définir votre mot de passe :\n\n" +
                        activationLink + "\n\n" +
                        "Ce lien expire dans 24 heures.\n\n" +
                        "Cordialement,\nL'équipe RH"
        );

        mailSender.send(message);
    }
}