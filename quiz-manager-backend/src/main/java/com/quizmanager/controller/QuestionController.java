package com.quizmanager.controller;

import com.quizmanager.dto.QuestionDTO;
import com.quizmanager.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {
    
    private final QuestionService questionService;
    
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        QuestionDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuestionDTO> questions = questionService.getQuestionsByQuizId(quizId);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByCategory(@PathVariable String category) {
        List<QuestionDTO> questions = questionService.getQuestionsByCategory(category);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/random/{category}")
    public ResponseEntity<List<QuestionDTO>> getRandomQuestionsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "10") int limit) {
        List<QuestionDTO> questions = questionService.getRandomQuestionsByCategory(category, limit);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/count/{quizId}")
    public ResponseEntity<Long> countQuestionsByQuizId(@PathVariable Long quizId) {
        Long count = questionService.countQuestionsByQuizId(quizId);
        return ResponseEntity.ok(count);
    }
}