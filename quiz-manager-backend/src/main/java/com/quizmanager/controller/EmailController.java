package com.quizmanager.controller;

import com.quizmanager.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/emails")
@RequiredArgsConstructor
public class EmailController {
    
    private final EmailService emailService;
    
    @PostMapping("/test")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> sendTestEmail(@RequestParam String email) {
        String content = "This is a test email from Quiz Manager.\n\n" +
                        "If you received this email, your email configuration is working correctly.\n\n" +
                        "Best regards,\n" +
                        "Quiz Manager Team";
        
        try {
            emailService.sendEmail(email, "Test Email from Quiz Manager", content);
            return ResponseEntity.ok("Test email sent successfully to " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
    
    @PostMapping("/bulk/quiz-results")
    @PreAuthorize("hasAuthority('PROFESSOR')")
    public ResponseEntity<String> sendBulkQuizResults(
            @RequestParam Long quizId,
            @RequestParam String message) {
        return ResponseEntity.ok("Bulk email sending initiated");
    }
}