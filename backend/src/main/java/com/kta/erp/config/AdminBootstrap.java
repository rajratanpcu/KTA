package com.kta.erp.config;

import com.kta.erp.entity.User;
import com.kta.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Override
    @Transactional
    public void run(String... args) {
        String adminUsername = environment.getProperty("ADMIN_USERNAME", "");
        String adminPassword = environment.getProperty("ADMIN_PASSWORD", "");

        log.info("AdminBootstrap: Checking for admin credentials...");
        log.info("AdminBootstrap: ADMIN_USERNAME present: {}", !adminUsername.isBlank());
        log.info("AdminBootstrap: ADMIN_PASSWORD present: {}", !adminPassword.isBlank());

        if (adminUsername.isBlank() || adminPassword.isBlank()) {
            log.warn("AdminBootstrap: ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping admin provisioning");
            return;
        }
        if (adminPassword.length() < 12) {
            log.error("AdminBootstrap: ADMIN_PASSWORD must contain at least 12 characters");
            throw new IllegalStateException("ADMIN_PASSWORD must contain at least 12 characters");
        }

        User user = userRepository.findByUsername(adminUsername).orElseGet(User::new);
        boolean isNewUser = user.getId() == null;
        user.setUsername(adminUsername);
        user.setPassword(passwordEncoder.encode(adminPassword));
        user.setFullName(environment.getProperty("ADMIN_FULL_NAME", "KTA Administrator"));
        user.setEmail(environment.getProperty("ADMIN_EMAIL", adminUsername + "@kta.local"));
        user.setRole(User.Role.ADMIN);
        user.setActive(true);
        userRepository.save(user);

        if (isNewUser) {
            log.info("AdminBootstrap: Admin account created successfully for user: {}", adminUsername);
        } else {
            log.info("AdminBootstrap: Admin account updated successfully for user: {}", adminUsername);
        }
    }
}
