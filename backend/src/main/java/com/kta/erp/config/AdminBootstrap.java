package com.kta.erp.config;

import com.kta.erp.entity.User;
import com.kta.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${ADMIN_USERNAME:}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (adminUsername.isBlank() || adminPassword.isBlank()) {
            return;
        }
        if (adminPassword.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD must contain at least 12 characters");
        }

        User user = userRepository.findByUsername(adminUsername).orElseGet(User::new);
        user.setUsername(adminUsername);
        user.setPassword(passwordEncoder.encode(adminPassword));
        user.setFullName(environment.getProperty("ADMIN_FULL_NAME", "KTA Administrator"));
        user.setEmail(environment.getProperty("ADMIN_EMAIL", adminUsername + "@kta.local"));
        user.setRole(User.Role.ADMIN);
        user.setActive(true);
        userRepository.save(user);
    }
}
