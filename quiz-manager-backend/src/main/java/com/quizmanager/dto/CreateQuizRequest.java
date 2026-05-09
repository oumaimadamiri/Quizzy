package com.quizmanager.dto;

import lombok.Data;
import java.util.List;

import jakarta.validation.constraints.Size;

@Data
public class CreateQuizRequest {
    private String title;
    private String description;
    private String category;
    private Integer timeLimit;
    private Integer passingScore;
    private Boolean isPublished;
    private Boolean isRandomized;
    private Integer maxQuestions;
    private List<QuestionRequest> questions;
     @Size(min = 4, max = 10, message = "Le code d'accès doit contenir entre 4 et 10 caractères")
    private String accessCode;
    @Data
    public static class QuestionRequest {
        private String text;
        private String category;
        private Integer points;
        private String type;
        private String explanation;
        private List<OptionRequest> options;
        private Long createdBy;
        @Data
        public static class OptionRequest {
            private String text;
            private Boolean isCorrect;
            private Integer order;
        }
    }
}