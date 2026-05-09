package com.quizmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Integer totalAttempts;
    private Integer passedAttempts;
    private Double averageScore;
    private Double averagePercentage;
    
    private Integer totalQuizzesCreated;
    private Integer totalQuestionsCreated;
    private Integer totalAttemptsOnQuizzes;
}