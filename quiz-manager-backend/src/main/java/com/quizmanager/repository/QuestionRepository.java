package com.quizmanager.repository;

import com.quizmanager.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    List<Question> findByQuizId(Long quizId);
    
    List<Question> findByCategory(String category);
    
    @Query("SELECT q FROM Question q WHERE q.quiz.id = :quizId AND q.category = :category")
    List<Question> findByQuizIdAndCategory(
            @Param("quizId") Long quizId,
            @Param("category") String category);
    
    @Query("SELECT q FROM Question q WHERE q.quiz.id = :quizId ORDER BY RANDOM() LIMIT :limit")
    List<Question> findRandomQuestionsByQuizId(
            @Param("quizId") Long quizId,
            @Param("limit") int limit);
    
    @Query("SELECT q FROM Question q WHERE q.category = :category ORDER BY RANDOM() LIMIT :limit")
    List<Question> findRandomQuestionsByCategory(
            @Param("category") String category,
            @Param("limit") int limit);
    
    Long countByQuizId(Long quizId);
}