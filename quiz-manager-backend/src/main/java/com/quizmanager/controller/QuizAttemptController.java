package com.quizmanager.controller;

import com.quizmanager.dto.QuizAttemptDTO;
import com.quizmanager.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {
    
    private final QuizAttemptService quizAttemptService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttemptDTO>> getUserAttempts(@PathVariable Long userId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getUserAttempts(userId);
        return ResponseEntity.ok(attempts);
    }
    @GetMapping("/quiz/{quizId}/students")
@PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByStudent(
        @PathVariable Long quizId,
        @RequestParam Long studentId) {
    List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttemptsByQuizAndStudent(quizId, studentId);
    return ResponseEntity.ok(attempts);
}

@GetMapping("/professor/{professorId}/students-results")
@PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
public ResponseEntity<Map<String, Object>> getStudentsResultsForProfessor(
        @PathVariable Long professorId) {
    Map<String, Object> results = quizAttemptService.getStudentsResultsByProfessor(professorId);
    return ResponseEntity.ok(results);
}
    @GetMapping("/{attemptId}")
    public ResponseEntity<QuizAttemptDTO> getAttemptById(@PathVariable Long attemptId) {
        QuizAttemptDTO attempt = quizAttemptService.getAttemptById(attemptId);
        return ResponseEntity.ok(attempt);
    }
    
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttempts(@PathVariable Long quizId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttempts(quizId);
        return ResponseEntity.ok(attempts);
    }
    
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics(@PathVariable Long userId) {
        Map<String, Object> stats = quizAttemptService.getUserStatistics(userId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/quiz/{quizId}/leaderboard")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizLeaderboard(@PathVariable Long quizId) {
        List<QuizAttemptDTO> leaderboard = quizAttemptService.getQuizLeaderboard(quizId);
        return ResponseEntity.ok(leaderboard);
    }
}