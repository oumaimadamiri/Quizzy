package com.quizmanager.controller;

import com.quizmanager.dto.UserDTO;
import com.quizmanager.model.User;
import com.quizmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;  
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j 
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateCurrentUser(userDTO));
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @PreAuthorize("hasAuthority('PROFESSOR')")
    @GetMapping("/students")
    public ResponseEntity<List<UserDTO>> getAllStudents() {
        return ResponseEntity.ok(userService.getUsersByRole("STUDENT"));
    }
   @GetMapping("/me/deletion-impact")

public ResponseEntity<Map<String, Object>> getMyAccountDeletionImpact() {
    try {
        User currentUser = userService.getCurrentUserEntity();
        Map<String, Object> impact = userService.getDeletionImpact(currentUser.getId());
        return ResponseEntity.ok(impact);
    } catch (Exception e) {
        log.error("Erreur lors de la récupération de l'impact de suppression: {}", e.getMessage());
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage()
        ));
    }
}

  @DeleteMapping("/me")
public ResponseEntity<Map<String, Object>> deleteMyAccount(
        @RequestBody(required = false) Map<String, String> request) {
    try {
        User currentUser = userService.getCurrentUserEntity();
        String reason = request != null ? request.get("reason") : "Demande utilisateur";
        
        Map<String, Object> impact = userService.getDeletionImpact(currentUser.getId());
        
        boolean success = userService.softDeleteUser(currentUser.getId(), reason);
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Votre compte a été supprimé avec succès",
                "details", "Vos données personnelles ont été anonymisées.",
                "impact", impact
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Impossible de supprimer le compte"
            ));
        }
    } catch (Exception e) {
        log.error("Erreur suppression compte: {}", e.getMessage(), e);
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Erreur lors de la suppression du compte: " + e.getMessage()
        ));
    }
}
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/professors")
    public ResponseEntity<List<UserDTO>> getAllProfessors() {
        return ResponseEntity.ok(userService.getUsersByRole("PROFESSOR"));
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(@PathVariable Long id, @RequestParam Boolean enabled) {
        return ResponseEntity.ok(userService.updateUserStatus(id, enabled));
    }
    
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
@GetMapping("/quiz/{quizId}/attempts")
@PreAuthorize("hasAuthority('PROFESSOR') or hasAuthority('ADMIN')")
public ResponseEntity<List<UserDTO>> getStudentsByQuizAttempts(@PathVariable Long quizId) {
    return ResponseEntity.ok(userService.getStudentsByQuizAttempts(quizId));
}


   
}