package com.quizmanager.service;

import com.quizmanager.dto.QuizAttemptDTO;
import com.quizmanager.dto.SubmitQuizRequest;
import com.quizmanager.model.*;
import com.quizmanager.repository.QuizAttemptRepository;
import com.quizmanager.repository.QuizRepository;
import com.quizmanager.repository.UserAnswerRepository;
import com.quizmanager.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {
    
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ModelMapper modelMapper;
    
    @Transactional
    public QuizAttemptDTO submitQuiz(Long quizId, SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + quizId));
        
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));
        
        Map<String, Object> scoringResult = calculateScore(quiz, request.getAnswers());
        
        int score = (int) scoringResult.get("score");
        int totalPoints = (int) scoringResult.get("totalPoints");
        double percentage = (double) scoringResult.get("percentage");
        boolean passed = percentage >= quiz.getPassingScore();
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answerDetails = (List<Map<String, Object>>) scoringResult.get("answerDetails");
        
        QuizAttempt attempt = QuizAttempt.builder()
            .quiz(quiz)
            .user(user)
            .userName(request.getUserName() != null ? request.getUserName() : user.getFullName())
            .score(score)
            .totalPoints(totalPoints)
            .percentage(percentage)
            .passed(passed)
            .timeTaken(request.getTimeTaken())
            .build();
        
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        
        for (Map<String, Object> answerDetail : answerDetails) {
            Long questionId = (Long) answerDetail.get("questionId");
            Long selectedOptionId = (Long) answerDetail.get("selectedOptionId");
            boolean isCorrect = (boolean) answerDetail.get("isCorrect");
            int pointsEarned = (int) answerDetail.get("pointsEarned");
            
            Question question = quiz.getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question non trouvée avec l'ID: " + questionId));
            
            UserAnswer userAnswer = UserAnswer.builder()
                .attempt(savedAttempt)
                .question(question)
                .selectedOptionId(selectedOptionId)
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .build();
            
            savedAttempt.addUserAnswer(userAnswer);
            userAnswerRepository.save(userAnswer);
        }
        
        sendQuizResultsEmail(user, quiz, score, totalPoints, percentage, passed);
        
        return convertToDTO(savedAttempt);
    }
    
    private void sendQuizResultsEmail(User user, Quiz quiz, int score, int totalPoints, double percentage, boolean passed) {
        try {
            emailService.sendQuizResultEmail(
                user.getEmail(),
                user.getFullName(),
                quiz.getTitle(),
                score,
                totalPoints,
                percentage,
                passed
            );
        } catch (Exception e) {
            System.err.println("Failed to send quiz results email: " + e.getMessage());
        }
    }
 
    public List<QuizAttemptDTO> getQuizAttemptsByProfessor(Long professorId) {

        List<Quiz> professorQuizzes = quizRepository.findByCreatedBy(professorId);
        
        List<QuizAttempt> allAttempts = new ArrayList<>();
        for (Quiz quiz : professorQuizzes) {
            allAttempts.addAll(quiz.getAttempts());
        }
        
        return allAttempts.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuizAttemptDTO> getQuizAttemptsByProfessorAndQuiz(Long professorId, Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz non trouvé"));
        
        if (quiz.getCreatedBy() == null || !quiz.getCreatedBy().getId().equals(professorId)) {
            throw new RuntimeException("Ce quiz n'appartient pas à ce professeur");
        }
        
        return quizAttemptRepository.findByQuizId(quizId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuizAttemptDTO> getQuizAttemptsByQuizAndStudent(Long quizId, Long studentId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, studentId);
        return attempts.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Map<String, Object> getStudentsResultsByProfessor(Long professorId) {
        Map<String, Object> results = new HashMap<>();
        
        List<Quiz> quizzes = quizRepository.findByCreatedBy(professorId);
        results.put("totalQuizzes", quizzes.size());
        
        List<QuizAttempt> allAttempts = new ArrayList<>();
        for (Quiz quiz : quizzes) {
            allAttempts.addAll(quiz.getAttempts());
        }
        
        Map<Long, List<QuizAttempt>> attemptsByStudent = allAttempts.stream()
            .collect(Collectors.groupingBy(attempt -> attempt.getUser().getId()));
        
        List<Map<String, Object>> studentsData = new ArrayList<>();
        for (Map.Entry<Long, List<QuizAttempt>> entry : attemptsByStudent.entrySet()) {
            Long studentId = entry.getKey();
            List<QuizAttempt> studentAttempts = entry.getValue();
            
            User student = studentAttempts.get(0).getUser();
            
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("studentId", studentId);
            studentData.put("studentName", student.getFullName());
            studentData.put("studentEmail", student.getEmail());
            studentData.put("totalAttempts", studentAttempts.size());
            
            long passedCount = studentAttempts.stream()
                .filter(QuizAttempt::getPassed)
                .count();
            studentData.put("passedAttempts", passedCount);
            
            double avgScore = studentAttempts.stream()
                .mapToInt(QuizAttempt::getScore)
                .average()
                .orElse(0.0);
            studentData.put("averageScore", avgScore);
            
            double avgPercentage = studentAttempts.stream()
                .mapToDouble(QuizAttempt::getPercentage)
                .average()
                .orElse(0.0);
            studentData.put("averagePercentage", avgPercentage);
            
            studentsData.add(studentData);
        }
        
        results.put("students", studentsData);
        results.put("totalStudents", studentsData.size());
        results.put("totalAttempts", allAttempts.size());
        
        return results;
    }
   

    private Map<String, Object> calculateScore(Quiz quiz, Map<Long, Long> userAnswers) {
        int totalScore = 0;
        int totalPoints = 0;
        List<Map<String, Object>> answerDetails = new ArrayList<>();
        
        for (Question question : quiz.getQuestions()) {
            totalPoints += question.getPoints();
            
            Map<String, Object> detail = new HashMap<>();
            detail.put("questionId", question.getId());
            detail.put("questionText", question.getText());
            detail.put("questionPoints", question.getPoints());
            
            Long selectedOptionId = userAnswers.get(question.getId());
            detail.put("selectedOptionId", selectedOptionId);
            
            boolean isCorrect = false;
            int pointsEarned = 0;
            
            if (selectedOptionId != null) {
                isCorrect = question.isCorrectAnswer(selectedOptionId);
                if (isCorrect) {
                    pointsEarned = question.getPoints();
                    totalScore += pointsEarned;
                }
            }
            
            detail.put("isCorrect", isCorrect);
            detail.put("pointsEarned", pointsEarned);
            
            answerDetails.add(detail);
        }
        
        double percentage = totalPoints > 0 ? (double) totalScore / totalPoints * 100 : 0.0;
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", totalScore);
        result.put("totalPoints", totalPoints);
        result.put("percentage", percentage);
        result.put("answerDetails", answerDetails);
        
        return result;
    }
    
    public List<QuizAttemptDTO> getUserAttempts(Long userId) {
        return quizAttemptRepository.findByUserId(userId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public QuizAttemptDTO getAttemptById(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Tentative non trouvée avec l'ID: " + attemptId));
        return convertToDTO(attempt);
    }
    
    public List<QuizAttemptDTO> getQuizAttempts(Long quizId) {
        return quizAttemptRepository.findByQuizId(quizId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuizAttemptDTO> getQuizLeaderboard(Long quizId) {
        List<QuizAttemptDTO> attempts = getQuizAttempts(quizId);
        
        return attempts.stream()
            .sorted((a1, a2) -> Integer.compare(a2.getScore(), a1.getScore()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    public Map<String, Object> getUserStatistics(Long userId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", userId);
        stats.put("totalAttempts", attempts.size());
        
        if (!attempts.isEmpty()) {
            long passedCount = attempts.stream()
                .filter(QuizAttempt::getPassed)
                .count();
            stats.put("passedCount", passedCount);
            stats.put("failedCount", attempts.size() - passedCount);
            stats.put("passRate", (double) passedCount / attempts.size() * 100);
            
            double avgScore = attempts.stream()
                .mapToInt(QuizAttempt::getScore)
                .average()
                .orElse(0.0);
            stats.put("averageScore", avgScore);
            
            double avgPercentage = attempts.stream()
                .mapToDouble(QuizAttempt::getPercentage)
                .average()
                .orElse(0.0);
            stats.put("averagePercentage", avgPercentage);
            
            int totalScore = attempts.stream()
                .mapToInt(QuizAttempt::getScore)
                .sum();
            stats.put("totalScore", totalScore);
            
            Optional<QuizAttempt> bestAttempt = attempts.stream()
                .max(Comparator.comparing(QuizAttempt::getScore));
            bestAttempt.ifPresent(attempt -> {
                stats.put("bestScore", attempt.getScore());
                stats.put("bestQuizId", attempt.getQuiz().getId());
                stats.put("bestQuizTitle", attempt.getQuiz().getTitle());
            });
            
            Optional<QuizAttempt> recentAttempt = attempts.stream()
                .max(Comparator.comparing(QuizAttempt::getCompletedAt));
            recentAttempt.ifPresent(attempt -> {
                stats.put("lastAttemptDate", attempt.getCompletedAt());
                stats.put("lastQuizId", attempt.getQuiz().getId());
                stats.put("lastScore", attempt.getScore());
            });
            
            int totalTime = attempts.stream()
                .filter(a -> a.getTimeTaken() != null)
                .mapToInt(QuizAttempt::getTimeTaken)
                .sum();
            stats.put("totalTimeSpent", totalTime);
        }
        
        return stats;
    }
    
    private QuizAttemptDTO convertToDTO(QuizAttempt attempt) {
        QuizAttemptDTO dto = modelMapper.map(attempt, QuizAttemptDTO.class);
        dto.setQuizId(attempt.getQuiz().getId());
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setUserId(attempt.getUser().getId());
        dto.setUserName(attempt.getUser().getFullName());
        
        List<QuizAttemptDTO.UserAnswerDTO> userAnswerDTOs = attempt.getUserAnswers().stream()
            .map(this::convertUserAnswerToDTO)
            .collect(Collectors.toList());
        
        dto.setUserAnswers(userAnswerDTOs);
        return dto;
    }
    
    private QuizAttemptDTO.UserAnswerDTO convertUserAnswerToDTO(UserAnswer userAnswer) {
        QuizAttemptDTO.UserAnswerDTO dto = new QuizAttemptDTO.UserAnswerDTO();
        dto.setId(userAnswer.getId());
        dto.setQuestionId(userAnswer.getQuestion().getId());
        dto.setQuestionText(userAnswer.getQuestion().getText()); 
        dto.setSelectedOptionId(userAnswer.getSelectedOptionId());
        dto.setIsCorrect(userAnswer.getIsCorrect());
        dto.setPointsEarned(userAnswer.getPointsEarned());
        return dto;
    }
}