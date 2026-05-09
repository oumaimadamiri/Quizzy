package com.quizmanager.service;

import com.quizmanager.dto.*;
import com.quizmanager.model.User;
import com.quizmanager.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final ModelMapper modelMapper;
    
@Transactional
public String register(RegisterRequest request) { 
    if (userRepository.existsByEmailAndNotDeleted(request.getEmail())) {
        throw new RuntimeException("Email déjà utilisé par un compte actif");
    }
    
    User.Role role = request.getRole() != null ? request.getRole() : User.Role.STUDENT;
    
    String token = generateToken(); 
    
    User user = User.builder()
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .firstName(request.getFirstName())
        .lastName(request.getLastName())
        .role(role)
        .enabled(false) 
        .deleted(false) 
        .emailVerificationToken(token) 
        .tokenExpiryDate(LocalDateTime.now().plusDays(1))
        .build();
    
    User savedUser = userRepository.save(user);
    
    try {
        emailService.sendVerificationEmail(
            savedUser.getEmail(),
            token, 
            savedUser.getFullName()
        );
    } catch (Exception e) {
        System.err.println("Failed to send email, but user created: " + e.getMessage());
    }
    
    return token; 
}
    
    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        
        User user = userRepository.findByEmailAndNotDeleted(request.getEmail())
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    
    if (!user.getEnabled()) {
        throw new RuntimeException("Compte non activé. Veuillez vérifier votre email.");
    }
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                    user.getRole().name()
                )
            )
        );
        
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        return AuthResponse.builder()
            .token(jwtToken)
            .refreshToken(refreshToken)
            .user(AuthResponse.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .build())
            .build();
    }
    
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("Token de vérification invalide"));
        
        if (user.getTokenExpiryDate() != null && user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token de vérification expiré");
        }
        
        user.setEnabled(true);
        user.setEmailVerificationToken(null);
        user.setTokenExpiryDate(null);
        userRepository.save(user);
        
        try {
            emailService.sendEmail(
                user.getEmail(),
                "Email Vérifié avec Succès - Quiz Manager",
                String.format(
                    "Cher/Chère %s,\n\n" +
                    "Votre email a été vérifié avec succès!\n\n" +
                    "Vous pouvez maintenant vous connecter à votre compte Quiz Manager.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Quiz Manager",
                    user.getFullName()
                )
            );
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }
    
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        String resetToken = generateToken();
        user.setResetPasswordToken(resetToken);
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(2));
        
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(
            user.getEmail(),
            resetToken,
            user.getFullName()
        );
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        
        if (user.getTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setTokenExpiryDate(null);
        
        userRepository.save(user);
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        if (user.getEnabled()) {
            throw new RuntimeException("Account is already verified");
        }
        
        String newToken = generateToken();
        user.setEmailVerificationToken(newToken);
        user.setTokenExpiryDate(LocalDateTime.now().plusDays(1));
        
        userRepository.save(user);
        
        emailService.sendVerificationEmail(
            user.getEmail(),
            newToken,
            user.getFullName()
        );
    }
    
    public AuthResponse refreshToken(String refreshToken) {
        String token = refreshToken.substring(7); 
        String userEmail = jwtService.extractUsername(token);
        
        if (userEmail == null) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            java.util.Collections.singletonList(
                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                    user.getRole().name()
                )
            )
        );
        
        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        String newJwtToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);
        
        return AuthResponse.builder()
            .token(newJwtToken)
            .refreshToken(newRefreshToken)
            .user(AuthResponse.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .enabled(user.getEnabled())
                .build())
            .build();
    }
    
    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}