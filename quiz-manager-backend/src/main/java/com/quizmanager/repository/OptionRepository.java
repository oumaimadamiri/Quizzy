package com.quizmanager.repository;

import com.quizmanager.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    
    List<Option> findByQuestionId(Long questionId);
    
    List<Option> findByCorrectTrueAndQuestionId(Long questionId);
    
    List<Option> findByQuestionIdOrderByOrderAsc(Long questionId);
}