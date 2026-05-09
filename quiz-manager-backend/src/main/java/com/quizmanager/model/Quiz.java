package com.quizmanager.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
      @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdBy;
    @Column(length = 1000)
    private String description;
    @Column(name = "access_code", length = 10)
    private String accessCode;
    @Column(nullable = false, length = 100)
    private String category;
    
    @Column(name = "time_limit")
    @Builder.Default
    private Integer timeLimit = 30;
    
    @Column(name = "passing_score")
    @Builder.Default
    private Integer passingScore = 70;
    
    @Column(name = "is_published")
    @Builder.Default
    private Boolean published = false;
    
    @Column(name = "is_randomized")
    @Builder.Default
    private Boolean randomized = false;
    
    @Column(name = "max_questions")
    @Builder.Default
    private Integer maxQuestions = 10;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Question> questions = new ArrayList<>();
    
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<QuizAttempt> attempts = new ArrayList<>();
    
    public void addQuestion(Question question) {
        questions.add(question);
        question.setQuiz(this);
    }
    
    public void removeQuestion(Question question) {
        questions.remove(question);
        question.setQuiz(null);
    }
    
    public Integer getTotalPoints() {
        return questions.stream()
            .mapToInt(Question::getPoints)
            .sum();
    }
    
    public Boolean getIsPublished() {
        return published;
    }
    
    public void setIsPublished(Boolean isPublished) {
        this.published = isPublished;
    }
    
    public Boolean getIsRandomized() {
        return randomized;
    }
    
    public void setIsRandomized(Boolean isRandomized) {
        this.randomized = isRandomized;
    }
}