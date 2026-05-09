package com.quizmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 2000)
    private String text;
    
    @Column(length = 100)
    private String category;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer points = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private QuestionType type = QuestionType.MULTIPLE_CHOICE;
    
    @Column(name = "correct_option_id")
    private Long correctOptionId;
    
    @Column(name = "explanation", length = 1000)
    private String explanation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Quiz quiz;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("id ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Option> options = new ArrayList<>();
    
    public enum QuestionType {
        MULTIPLE_CHOICE,
        TRUE_FALSE,
        MULTIPLE_ANSWER,
        SHORT_ANSWER
    }
    
    public void addOption(Option option) {
        options.add(option);
        option.setQuestion(this);
    }
    
    public void removeOption(Option option) {
        options.remove(option);
        option.setQuestion(null);
    }
    
    public Option getCorrectOption() {
        return options.stream()
            .filter(Option::getCorrect)
            .findFirst()
            .orElse(null);
    }
    
    public boolean isCorrectAnswer(Long optionId) {
        if (correctOptionId == null || optionId == null) {
            return false;
        }
        return correctOptionId.equals(optionId);
    }
}