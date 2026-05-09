package com.quizmanager.service;

import com.quizmanager.dto.UserDTO;
import com.quizmanager.exception.ResourceNotFoundException;
import com.quizmanager.model.Quiz;
import com.quizmanager.model.QuizAttempt;
import com.quizmanager.model.User;
import com.quizmanager.repository.QuizAttemptRepository;
import com.quizmanager.repository.QuizRepository;
import com.quizmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ModelMapper modelMapper;
     private final EmailService emailService;
       public User getCurrentUserEntity() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    return userRepository.findByEmailAndNotDeleted(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
}
   


    
    private void enrichUserWithQuizStatistics(UserDTO dto, User user, Long quizId) {
        List<com.quizmanager.model.QuizAttempt> attempts = 
            quizAttemptRepository.findByQuizId(quizId).stream()
                .filter(attempt -> attempt.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
        
        dto.setTotalAttempts(attempts.size());
        
        long passedCount = attempts.stream()
            .filter(com.quizmanager.model.QuizAttempt::getPassed)
            .count();
        dto.setPassedAttempts((int) passedCount);
        
        double avgScore = attempts.stream()
            .mapToInt(com.quizmanager.model.QuizAttempt::getScore)
            .average()
            .orElse(0.0);
        dto.setAverageScore(avgScore);
        
        double avgPercentage = attempts.stream()
            .mapToDouble(com.quizmanager.model.QuizAttempt::getPercentage)
            .average()
            .orElse(0.0);
        dto.setAveragePercentage(avgPercentage); 
    }
    
    
    public List<UserDTO> getStudentsByQuizId(Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
        
        Set<Long> studentIds = attempts.stream()
            .map(attempt -> attempt.getUser().getId())
            .collect(Collectors.toSet());
        
        List<UserDTO> students = new ArrayList<>();
        for (Long studentId : studentIds) {
            User user = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
            
            if (user.getRole() == User.Role.STUDENT) {
                UserDTO dto = convertToDTO(user);
                enrichUserWithQuizStatistics(dto, user, quizId);
                students.add(dto);
            }
        }
        
        return students;
    }
    
   
    public UserDTO getCurrentUser() {
        User user = getCurrentUserEntity();
        UserDTO dto = convertToDTO(user);
        enrichUserWithStatistics(dto, user);
        return dto;
    }
    
    public UserDTO updateCurrentUser(UserDTO userDTO) {
        User user = getCurrentUserEntity();
        
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findAll().stream()
            .filter(user -> user.getRole().name().equals(role))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
    
    public UserDTO updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    public UserDTO updateUserStatus(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        user.setEnabled(enabled);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);
    }
    
    public List<UserDTO> getStudentsByQuizAttempts(Long quizId) {
        return quizAttemptRepository.findByQuizId(quizId).stream()
            .map(attempt -> {
                User user = attempt.getUser();
                if (user != null && user.getRole() == User.Role.STUDENT) {
                    UserDTO dto = convertToDTO(user);
                    enrichUserWithQuizStatistics(dto, user, quizId);
                    return dto;
                }
                return null;
            })
            .filter(dto -> dto != null)
            .distinct()
            .collect(Collectors.toList());
    }
    @Transactional
    public boolean softDeleteUser(Long userId, String reason) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            
            if (user.isDeleted()) {
                log.warn("Utilisateur {} déjà supprimé", userId);
                return true;
            }
            
            String uniqueId = "deleted_" + System.currentTimeMillis();
            user.setEmail(uniqueId + "@deleted.com");
            user.setFirstName("Utilisateur");
            user.setLastName("Supprimé");
            user.setEnabled(false);
            
            user.setDeleted(true);
            user.setDeletedAt(LocalDateTime.now());
            user.setDeletionReason(reason);
            
            if (user.getRole() == User.Role.PROFESSOR) {
                List<Quiz> userQuizzes = quizRepository.findAll().stream()
                    .filter(quiz -> quiz.getCreatedAt() != null)
                    .collect(Collectors.toList());
                
                for (Quiz quiz : userQuizzes) {
                    quiz.setTitle("[Professeur supprimé] " + quiz.getTitle());
                    quiz.setDescription("Ce quiz a été créé par un professeur qui n'est plus sur la plateforme.");
                    quizRepository.save(quiz);
                }
                
                log.info("{} quiz(s) marqués comme créés par un professeur supprimé", userQuizzes.size());
            }
            
            userRepository.save(user);
            
            anonymizeUserQuizAttempts(userId);
            
            log.info("✅ Utilisateur {} soft deleted avec succès (raison: {})", userId, reason);
            return true;
            
        } catch (Exception e) {
            log.error("❌ Erreur soft delete utilisateur {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la suppression du compte", e);
        }
    }
    
  
    private void anonymizeUserQuizAttempts(Long userId) {
        try {
            List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
            for (QuizAttempt attempt : attempts) {
                attempt.setUserName("Utilisateur supprimé");
                quizAttemptRepository.save(attempt);
            }
            log.info("Anonymisé {} tentatives pour l'utilisateur {}", attempts.size(), userId);
        } catch (Exception e) {
            log.error("Erreur lors de l'anonymisation des tentatives pour l'utilisateur {}: {}", userId, e.getMessage());
        }
    }
public Map<String, Object> getDeletionImpact(Long userId) {
        Map<String, Object> impact = new HashMap<>();
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        impact.put("userId", userId);
        impact.put("userEmail", user.getEmail());
        impact.put("userRole", user.getRole().name());
        
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
        impact.put("quizAttempts", attempts.size());
        
        if (user.getRole() == User.Role.PROFESSOR || user.getRole() == User.Role.ADMIN) {
            List<Quiz> allQuizzes = quizRepository.findAll();
            long quizCount = allQuizzes.stream()
                .filter(quiz -> quiz.getCreatedAt() != null)
                .count();
            impact.put("quizzesCreated", quizCount);
            
            if (quizCount > 0) {
                impact.put("warning", "Vos " + quizCount + " quiz(s) resteront disponibles pour les autres utilisateurs");
            }
        }
        
        impact.put("canDelete", true);
        return impact;
    }

    private void enrichUserWithStatistics(UserDTO dto, User user) {
        if (user.getRole() == User.Role.STUDENT) {
            List<com.quizmanager.model.QuizAttempt> attempts = 
                quizAttemptRepository.findByUserId(user.getId());
            
            dto.setTotalAttempts(attempts.size());
            
            long passedCount = attempts.stream()
                .filter(com.quizmanager.model.QuizAttempt::getPassed)
                .count();
            dto.setPassedAttempts((int) passedCount);
            
            double avgScore = attempts.stream()
                .mapToInt(com.quizmanager.model.QuizAttempt::getScore)
                .average()
                .orElse(0.0);
            dto.setAverageScore(avgScore);
            
            double avgPercentage = attempts.stream()
                .mapToDouble(com.quizmanager.model.QuizAttempt::getPercentage)
                .average()
                .orElse(0.0);
            dto.setAveragePercentage(avgPercentage);
            
        } else if (user.getRole() == User.Role.PROFESSOR) {
            long totalQuizzes = quizRepository.findAll().stream()
                .filter(quiz -> quiz.getCreatedAt() != null)
                .count();
            dto.setTotalQuizzesCreated((int) totalQuizzes);
            
            long totalQuestions = quizRepository.findAll().stream()
                .mapToLong(quiz -> quiz.getQuestions().size())
                .sum();
            dto.setTotalQuestionsCreated((int) totalQuestions);
            
            long totalAttempts = quizRepository.findAll().stream()
                .mapToLong(quiz -> quiz.getAttempts().size())
                .sum();
            dto.setTotalAttemptsOnQuizzes((int) totalAttempts);
        }
    }
   
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = modelMapper.map(user, UserDTO.class);
        dto.setRole(user.getRole().name());
        return dto;
    }
}