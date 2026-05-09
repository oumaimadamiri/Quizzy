package com.quizmanager.repository;

import com.quizmanager.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    @Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId")
    List<QuizAttempt> findByUserId(@Param("userId") Long userId);
    
    List<QuizAttempt> findByQuizId(Long quizId);
    
    @Query("SELECT a FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.user.id = :userId")
    List<QuizAttempt> findByQuizIdAndUserId(@Param("quizId") Long quizId, @Param("userId") Long userId);
    
    @Query("SELECT a FROM QuizAttempt a WHERE a.quiz.id = :quizId ORDER BY a.score DESC")
    List<QuizAttempt> findTopScoresByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Long countByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT AVG(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Double findAveragePercentageByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT MAX(a.score) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Integer findMaxScoreByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT MIN(a.score) FROM QuizAttempt a WHERE a.quiz.id = :quizId")
    Integer findMinScoreByQuizId(@Param("quizId") Long quizId);
    
    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.passed = true")
    Long countPassedAttemptsByQuizId(@Param("quizId") Long quizId);
@Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.user.id = :userId")
long countByUserId(@Param("userId") Long userId);

@Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM QuizAttempt a WHERE a.user.id = :userId")
boolean existsByUserId(@Param("userId") Long userId);
}