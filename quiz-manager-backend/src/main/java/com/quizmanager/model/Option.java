package com.quizmanager.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "options")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Option {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 1000)
    private String text;
    
    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private Boolean correct = false;
    
    @Column(name = "option_order")
    private Integer order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Question question;
    
    @Transient
    public Boolean getIsCorrect() {
        return correct;
    }
    
    @Transient
    public void setIsCorrect(Boolean isCorrect) {
        this.correct = isCorrect;
    }
}