package com.quizmanager.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;
    
    @Column(name = "user_name")
    private String userName;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer score = 0;
    
    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double percentage = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean passed = false;
    
    @Column(name = "time_taken")
    private Integer timeTaken; 
    
    @CreationTimestamp
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Quiz quiz;
    
    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserAnswer> userAnswers = new ArrayList<>();
    
    @PrePersist
    @PreUpdate
    private void setUserName() {
        if (this.user != null && this.userName == null) {
            this.userName = this.user.getFullName();
        }
    }
    
    public void addUserAnswer(UserAnswer userAnswer) {
        userAnswers.add(userAnswer);
        userAnswer.setAttempt(this);
    }
    
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}