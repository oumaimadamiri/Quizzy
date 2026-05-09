package com.quizmanager.service;

import com.quizmanager.model.User;
import com.quizmanager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SafeUserDeletionService {
    
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final EmailService emailService;
    
    /**
     * Supprime un utilisateur de manière sécurisée avec toutes ses données
     * @param userId ID de l'utilisateur à supprimer
     * @return true si suppression réussie
     */
    @Transactional
    public boolean deleteUserSafely(Long userId) {
        try {
            log.info("🚨 Début suppression sécurisée utilisateur ID: {}", userId);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("❌ Utilisateur {} non trouvé", userId);
                    return new RuntimeException("Utilisateur non trouvé: " + userId);
                });
            
            log.info("📋 Utilisateur trouvé: {} ({})", user.getEmail(), user.getRole());
            
            if (user.getRole() == User.Role.PROFESSOR || user.getRole() == User.Role.ADMIN) {
                int quizCount = quizRepository.countByCreatedBy(userId);
                log.warn("⚠️ Suppression d'un {} avec {} quiz(s) créé(s)", user.getRole(), quizCount);
                
               
            }
            
           
            userRepository.delete(user);
            
            log.info("✅ Utilisateur {} supprimé avec succès", userId);
            
            boolean userExists = userRepository.existsById(userId);
            boolean hasQuizzes = quizRepository.existsByCreatedBy(userId);
            boolean hasAttempts = quizAttemptRepository.existsByUserId(userId);
            
            if (userExists || hasQuizzes || hasAttempts) {
                log.error("❌ Vérification échouée après suppression");
                return false;
            }
            
            log.info("✅ Vérification réussie - Toutes les données sont supprimées");
            return true;
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la suppression de l'utilisateur {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Échec de la suppression de l'utilisateur: " + e.getMessage(), e);
        }
    }
    
    /**
     * Méthode pour obtenir des statistiques avant suppression
     */
    public DeletionStats getDeletionStats(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        int quizCount = quizRepository.countByCreatedBy(userId);
        int attemptCount = (int) quizAttemptRepository.countByUserId(userId);
        
        return new DeletionStats(
            userId,
            user.getEmail(),
            user.getRole(),
            quizCount,
            attemptCount,
            quizCount + attemptCount
        );
    }
    
    public static class DeletionStats {
        private Long userId;
        private String userEmail;
        private User.Role userRole;
        private int quizCount;
        private int attemptCount;
        private int totalImpact;
        
        public DeletionStats(Long userId, String userEmail, User.Role userRole, 
                           int quizCount, int attemptCount, int totalImpact) {
            this.userId = userId;
            this.userEmail = userEmail;
            this.userRole = userRole;
            this.quizCount = quizCount;
            this.attemptCount = attemptCount;
            this.totalImpact = totalImpact;
        }
        
        public Long getUserId() { return userId; }
        public String getUserEmail() { return userEmail; }
        public User.Role getUserRole() { return userRole; }
        public int getQuizCount() { return quizCount; }
        public int getAttemptCount() { return attemptCount; }
        public int getTotalImpact() { return totalImpact; }
        
        @Override
        public String toString() {
            return "DeletionStats{" +
                   "userId=" + userId +
                   ", userEmail='" + userEmail + '\'' +
                   ", userRole=" + userRole +
                   ", quizCount=" + quizCount +
                   ", attemptCount=" + attemptCount +
                   ", totalImpact=" + totalImpact +
                   '}';
        }
    }
}