package com.quizmanager.controller;

import com.quizmanager.dto.CreateQuizRequest;
import com.quizmanager.dto.QuizAttemptDTO;
import com.quizmanager.dto.SubmitQuizRequest;
import com.quizmanager.dto.staticQuizDTO;
import com.quizmanager.model.User;
import com.quizmanager.service.QuizAttemptService;
import com.quizmanager.service.QuizService;
import com.quizmanager.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {
    
    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService; 
    private final UserService userService; 
@PostMapping
@PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
public ResponseEntity<staticQuizDTO> createQuiz(@Valid @RequestBody CreateQuizRequest request, BindingResult bindingResult) {
    
    System.out.println("=== CREATE QUIZ REQUEST DETAILS ===");
    System.out.println("Request: " + request.toString());
    
    if (bindingResult.hasErrors()) {
        System.out.println("=== VALIDATION ERRORS ===");
        bindingResult.getAllErrors().forEach(error -> {
            System.out.println("Error: " + error.getDefaultMessage());
            System.out.println("Field: " + ((FieldError) error).getField());
            System.out.println("Rejected value: " + ((FieldError) error).getRejectedValue());
        });
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Validation failed");
    }
    
    User currentUser = userService.getCurrentUserEntity();
    System.out.println("Current user ID: " + currentUser.getId());
    System.out.println("Current user email: " + currentUser.getEmail());
    
    staticQuizDTO quiz = quizService.createQuiz(request, currentUser.getId());
    
    System.out.println("=== QUIZ CREATED SUCCESSFULLY ===");
    System.out.println("Quiz ID: " + quiz.getId());
    System.out.println("Quiz title: " + quiz.getTitle());
    
    return new ResponseEntity<>(quiz, HttpStatus.CREATED);
}
    
    @GetMapping("/{id}")
    public ResponseEntity<staticQuizDTO> getQuizById(@PathVariable Long id) {
        staticQuizDTO quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(quiz);
    }
    
    @GetMapping
    public ResponseEntity<List<staticQuizDTO>> getAllQuizzes() {
        List<staticQuizDTO> quizzes = quizService.getAllQuizzes();
        return ResponseEntity.ok(quizzes);
    }
    
    @GetMapping("/published")
    public ResponseEntity<List<staticQuizDTO>> getPublishedQuizzes() {
        List<staticQuizDTO> quizzes = quizService.getPublishedQuizzes();
        return ResponseEntity.ok(quizzes);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<staticQuizDTO>> getQuizzesByCategory(@PathVariable String category) {
        List<staticQuizDTO> quizzes = quizService.getQuizzesByCategory(category);
        return ResponseEntity.ok(quizzes);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<staticQuizDTO> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody CreateQuizRequest request) {
        staticQuizDTO quiz = quizService.updateQuiz(id, request);
        return ResponseEntity.ok(quiz);
    }
    
   @DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
    User currentUser = userService.getCurrentUserEntity();
    
    quizService.deleteQuiz(id, currentUser.getId());
    return ResponseEntity.noContent().build();
}
    
    
@PostMapping("/{id}/verify-access-code")
public ResponseEntity<Void> verifyQuizAccessCode(
        @PathVariable Long id,
        @RequestBody Map<String, String> requestBody) {
    String accessCode = requestBody.get("accessCode");
    boolean isValid = quizService.verifyQuizAccessCode(id, accessCode);
    
    if (isValid) {
        return ResponseEntity.ok().build();
    } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
@GetMapping("/{id}/take")
public ResponseEntity<staticQuizDTO> getQuizForTaking(
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean randomize,
        @RequestParam(required = false) String accessCode) {
    staticQuizDTO quiz = quizService.getQuizForTaking(id, randomize, accessCode);
    return ResponseEntity.ok(quiz);
}

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizAttemptDTO> submitQuiz(
            @PathVariable Long id,
            @Valid @RequestBody SubmitQuizRequest request) {
        QuizAttemptDTO attempt = quizService.submitQuiz(id, request);
        return ResponseEntity.ok(attempt);
    }
    
    @GetMapping("/student")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<List<staticQuizDTO>> getQuizzesForStudent() {
        List<staticQuizDTO> quizzes = quizService.getPublishedQuizzes();
        return ResponseEntity.ok(quizzes);
    }
    
    @GetMapping("/professor/{professorId}/attempts")
    @PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsForProfessor(@PathVariable Long professorId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttemptsByProfessor(professorId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/professor/{professorId}/quiz/{quizId}/attempts")
    @PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsForProfessorQuiz(
            @PathVariable Long professorId,
            @PathVariable Long quizId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttemptsByProfessorAndQuiz(professorId, quizId);
        return ResponseEntity.ok(attempts);
    }

    @PostMapping("/generate-random")
    public ResponseEntity<staticQuizDTO> generateRandomQuiz( 
            @RequestParam String category,
            @RequestParam(defaultValue = "10") int questions,
            @RequestParam(required = false) Long userId) {
        staticQuizDTO quiz = quizService.generateRandomQuiz(category, questions, userId);
        return new ResponseEntity<>(quiz, HttpStatus.CREATED);
    }
    
    
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long id) {
        Map<String, Object> stats = quizService.getQuizStatistics(id);
        return ResponseEntity.ok(stats);
    }
    
    
    @GetMapping("/search")
    public ResponseEntity<List<staticQuizDTO>> searchQuizzes(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean published) {
        List<staticQuizDTO> quizzes = quizService.searchQuizzes(title, category, published);
        return ResponseEntity.ok(quizzes);
    }
    
    
    @GetMapping("/professor/{professorId}/students-results")
    @PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStudentsResultsForProfessor(
            @PathVariable Long professorId) {
        Map<String, Object> results = quizAttemptService.getStudentsResultsByProfessor(professorId);
        return ResponseEntity.ok(results);
    }
     @GetMapping("/mine")
    @PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
    public ResponseEntity<List<staticQuizDTO>> getMyQuizzes() {
        User currentUser = userService.getCurrentUserEntity();
        List<staticQuizDTO> quizzes = quizService.getQuizzesByProfessor(currentUser.getId());
        return ResponseEntity.ok(quizzes);
    }
    @GetMapping("/quiz/{quizId}/students")
    @PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByStudent(
            @PathVariable Long quizId,
            @RequestParam Long studentId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttemptsByQuizAndStudent(quizId, studentId);
        return ResponseEntity.ok(attempts);
    }
}