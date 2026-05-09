package com.quizmanager.repository;

import com.quizmanager.model.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    
    List<UserAnswer> findByAttemptId(Long attemptId);
    
    List<UserAnswer> findByQuestionId(Long questionId);
    
    List<UserAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}