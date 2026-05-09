package com.quizmanager.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE users SET deleted = true WHERE id = ?")  
@Where(clause = "deleted = false")  
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(nullable = false, length = 100)
    private String lastName;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = false;
     @Column(name = "deleted", nullable = false)
    private boolean deleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deletion_reason")
    private String deletionReason;
    
    public boolean isDeleted() {
        return deleted;
    }
    
    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
    
    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
    
    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
    
    public String getDeletionReason() {
        return deletionReason;
    }
    
    public void setDeletionReason(String deletionReason) {
        this.deletionReason = deletionReason;
    }
    @Column(name = "email_verification_token", length = 100)
    private String emailVerificationToken;
    
    @Column(name = "reset_password_token", length = 100)
    private String resetPasswordToken;
    
    @Column(name = "token_expiry_date")
    private LocalDateTime tokenExpiryDate;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private Set<QuizAttempt> attempts = new HashSet<>();
 
    public enum Role {
        STUDENT,
        PROFESSOR,
        ADMIN
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}