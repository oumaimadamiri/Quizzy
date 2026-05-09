package com.quizmanager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendVerificationEmail(String email, String token, String fullName) {
        String subject = "Quiz Manager - Code de vérification d'email";
        
        String content = "Cher/Chère " + fullName + ",\n\n" +
                        "Bienvenue sur Quiz Manager !\n\n" +
                        "Votre code de vérification d'email est :\n\n" +
                        "**" + token + "**\n\n" +
                        "Pour activer votre compte :\n" +
                        "1. Ouvrez l'application Quizzy\n" +
                        "2. Allez dans l'écran 'Vérification d'email'\n" +
                        "3. Entrez le code ci-dessus\n" +
                        "4. Cliquez sur 'Vérifier'\n\n" +
                        "Ce code expirera dans 24 heures.\n\n" +
                        "Si vous n'avez pas créé de compte avec Quiz Manager, " +
                        "veuillez ignorer cet email.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe Quiz Manager";
        
        sendEmail(email, subject, content);
    }
    
    public void sendPasswordResetEmail(String email, String token, String fullName) {
        String subject = "Quiz Manager - Code de réinitialisation de mot de passe";
        
        String content = "Bonjour " + fullName + ",\n\n" +
                        "Vous avez demandé à réinitialiser votre mot de passe.\n\n" +
                        "Votre code de réinitialisation est :\n\n" +
                        "**" + token + "**\n\n" +
                        "Pour réinitialiser votre mot de passe :\n" +
                        "1. Ouvrez l'application Quizzy\n" +
                        "2. Allez dans l'écran 'Réinitialisation mot de passe'\n" +
                        "3. Entrez le code ci-dessus\n" +
                        "4. Entrez votre nouveau mot de passe\n\n" +
                        "Ce code expirera dans 1 heure.\n\n" +
                        "Si vous n'avez pas fait cette demande, " +
                        "veuillez ignorer cet email.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe Quiz Manager";
        
        sendEmail(email, subject, content);
    }
    
    public void sendWelcomeEmail(String email, String fullName, String role) {
        String subject = "Bienvenue sur Quiz Manager !";
        
        String content = "Cher/Chère " + fullName + ",\n\n" +
                        "Félicitations pour votre inscription sur Quiz Manager !\n\n" +
                        "Votre compte a été créé avec le rôle : " + role + "\n\n" +
                        "Pour commencer à utiliser l'application :\n" +
                        "1. Vérifiez votre email avec le code envoyé séparément\n" +
                        "2. Connectez-vous à l'application\n" +
                        "3. Explorez les fonctionnalités disponibles\n\n" +
                        "Si vous avez des questions, n'hésitez pas à nous contacter.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe Quiz Manager";
        
        sendEmail(email, subject, content);
    }
    
   public void sendEmail(String to, String subject, String content) {
    try {
        System.out.println("📧 Attempting to send email to: " + to);
        System.out.println("Subject: " + subject);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, false);
        
        mailSender.send(message);
        log.info("Email sent successfully to: {}", to);
        
    } catch (MessagingException e) {
        log.error("Failed to send email to {}: {}", to, e.getMessage());
        System.err.println("⚠️ Email failed but continuing: " + e.getMessage());
    }
}
    public void sendQuizResultEmail(String email, String fullName, String quizTitle, 
                                int score, int totalPoints, double percentage, boolean passed) {
    String subject = "Quiz Manager - Résultats du quiz";
    
    String content = "Cher/Chère " + fullName + ",\n\n" +
                    "Voici les résultats de votre quiz : **" + quizTitle + "**\n\n" +
                    "📊 **RÉSULTATS**\n" +
                    "────────────────────\n" +
                    "• Score : " + score + "/" + totalPoints + " points\n" +
                    "• Pourcentage : " + String.format("%.1f", percentage) + "%\n" +
                    "• Statut : " + (passed ? "✅ RÉUSSI" : "❌ ÉCHOUÉ") + "\n\n" +
                    
                    "📈 **ANALYSE**\n" +
                    "────────────────────\n" +
                    (passed ? 
                        "Félicitations ! Vous avez réussi le quiz.\n" +
                        "Continuez à progresser ! 🎉\n" :
                        "Vous pouvez faire mieux !\n" +
                        "Revenez sur les questions ratées pour vous améliorer. 💪\n") + 
                    "\n\n" +
                    
                    "📚 **CONSEILS**\n" +
                    "────────────────────\n" +
                    "1. Revoyez les questions que vous avez ratées\n" +
                    "2. Essayez d'autres quiz sur le même sujet\n" +
                    "3. Prenez votre temps pour lire attentivement chaque question\n\n" +
                    
                    "🔄 **REPASSER LE QUIZ**\n" +
                    "────────────────────\n" +
                    "Vous pouvez repasser ce quiz à tout moment depuis l'application Quizzy.\n\n" +
                    
                    "Si vous avez des questions sur vos résultats, n'hésitez pas à nous contacter.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Quiz Manager";
    
    sendEmail(email, subject, content);
}
    public static class User {
        public String getFullName() {
            return this.getFullName();
        }
    }
}