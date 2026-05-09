package com.quizmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class QuizDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer timeLimit;
    private Integer passingScore;
    private Boolean isPublished;
    private Boolean isRandomized;
    private Integer maxQuestions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuestionDTO> questions = new ArrayList<>();
}