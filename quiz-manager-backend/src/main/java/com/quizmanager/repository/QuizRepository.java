package com.quizmanager.repository;

import com.quizmanager.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByCategory(String category);
    
    List<Quiz> findByPublishedTrue();  
    
    @Query("SELECT q FROM Quiz q WHERE q.createdBy.id = :createdById")
    List<Quiz> findByCreatedBy(@Param("createdById") Long createdById);

    @Query("SELECT q FROM Quiz q WHERE q.createdBy.id = :createdById AND q.published = true")
    List<Quiz> findByCreatedByAndPublishedTrue(@Param("createdById") Long createdById);  
    
    List<Quiz> findByCategoryAndPublishedTrue(String category); 
    
    @Query("SELECT q FROM Quiz q WHERE SIZE(q.questions) >= :minQuestions")
    List<Quiz> findByMinQuestions(@Param("minQuestions") int minQuestions);
    
    List<Quiz> findByTitleContainingIgnoreCase(String title);
    
    @Query("SELECT q FROM Quiz q WHERE q.category = :category AND SIZE(q.questions) >= :minQuestions")
    List<Quiz> findByCategoryWithMinQuestions(
            @Param("category") String category,
            @Param("minQuestions") int minQuestions);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.quiz.id = :quizId")
    Long countQuestionsByQuizId(@Param("quizId") Long quizId);
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.createdBy = :createdBy")
int countByCreatedBy(@Param("createdBy") Long createdBy);

@Query("SELECT CASE WHEN COUNT(q) > 0 THEN true ELSE false END FROM Quiz q WHERE q.createdBy = :createdBy")
boolean existsByCreatedBy(@Param("createdBy") Long createdBy);
    @Query("SELECT DISTINCT q FROM Quiz q " +
           "LEFT JOIN FETCH q.questions " +
           "LEFT JOIN FETCH q.attempts " +
           "WHERE q.id = :quizId")
    Optional<Quiz> findByIdWithDetails(@Param("quizId") Long quizId);
}