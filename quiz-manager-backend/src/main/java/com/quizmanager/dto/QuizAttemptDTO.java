package com.quizmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class QuizAttemptDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer totalPoints;
    private Double percentage;
    private Boolean passed;
    private Integer timeTaken;
    private LocalDateTime completedAt;
    private List<UserAnswerDTO> userAnswers = new ArrayList<>();
    
    @Data
    public static class UserAnswerDTO {
        private Long id;
        private Long questionId;
        private String questionText;
        private Long selectedOptionId;
        private String selectedOptionText;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private String correctAnswerExplanation;
    }
}