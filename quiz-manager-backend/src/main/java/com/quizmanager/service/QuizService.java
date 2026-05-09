package com.quizmanager.service;

import com.quizmanager.dto.CreateQuizRequest;
import com.quizmanager.dto.QuizAttemptDTO;
import com.quizmanager.dto.staticQuizDTO; 
import com.quizmanager.dto.SubmitQuizRequest;
import com.quizmanager.dto.QuestionDTO; 
import com.quizmanager.dto.OptionDTO; 
import com.quizmanager.model.*;
import com.quizmanager.repository.QuizRepository;
import com.quizmanager.repository.QuestionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {
    
     private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptService quizAttemptService;
    private final ModelMapper modelMapper;
    private final UserService userService;
    
@Transactional
    public staticQuizDTO createQuiz(CreateQuizRequest request, Long createdById) {
        User creator = userService.getUserById(createdById);
        
        Quiz quiz = Quiz.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .timeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 30)
            .passingScore(request.getPassingScore() != null ? request.getPassingScore() : 70)
            .published(request.getIsPublished() != null ? request.getIsPublished() : false)
            .randomized(request.getIsRandomized() != null ? request.getIsRandomized() : false)
            .maxQuestions(request.getMaxQuestions() != null ? request.getMaxQuestions() : 10)
            .createdBy(creator) 
            .accessCode(request.getAccessCode())
            .build();
        
        if (request.getQuestions() != null) {
            for (CreateQuizRequest.QuestionRequest questionReq : request.getQuestions()) {
                Question question = Question.builder()
                    .text(questionReq.getText())
                    .category(questionReq.getCategory())
                    .points(questionReq.getPoints() != null ? questionReq.getPoints() : 1)
                    .type(Question.QuestionType.valueOf(questionReq.getType()))
                    .explanation(questionReq.getExplanation())
                    .build();
                
                if (questionReq.getOptions() != null) {
                    for (CreateQuizRequest.QuestionRequest.OptionRequest optionReq : questionReq.getOptions()) {
                        Option option = Option.builder()
                            .text(optionReq.getText())
                            .correct(optionReq.getIsCorrect() != null ? optionReq.getIsCorrect() : false)
                            .order(optionReq.getOrder())
                            .build();
                        question.addOption(option);
                    }
                }
                
                quiz.addQuestion(question);
            }
        }
        
        Quiz savedQuiz = quizRepository.save(quiz);
        
        for (Question question : savedQuiz.getQuestions()) {
            Option correctOption = question.getCorrectOption();
            if (correctOption != null) {
                question.setCorrectOptionId(correctOption.getId());
            }
        }
        
        return convertToDTO(savedQuiz);
    }
    
     public User getUserById(Long id) {

        return userService.getUserById(id);
    }
            public List<staticQuizDTO> getQuizzesByCurrentUser() {
        User currentUser = userService.getCurrentUserEntity(); 
        List<Quiz> quizzes = quizRepository.findByCreatedBy(currentUser.getId());
        return quizzes.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

     public List<staticQuizDTO> getQuizzesByProfessor(Long professorId) {
        List<Quiz> quizzes = quizRepository.findByCreatedBy(professorId);
        return quizzes.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    @Transactional
    public staticQuizDTO updateQuiz(Long id, CreateQuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + id));
        
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setTimeLimit(request.getTimeLimit() != null ? request.getTimeLimit() : 30);
        quiz.setPassingScore(request.getPassingScore() != null ? request.getPassingScore() : 70);
        quiz.setPublished(request.getIsPublished() != null ? request.getIsPublished() : false);
        quiz.setRandomized(request.getIsRandomized() != null ? request.getIsRandomized() : false);
        quiz.setMaxQuestions(request.getMaxQuestions() != null ? request.getMaxQuestions() : 10);
        
        quiz.getQuestions().clear();
        
        if (request.getQuestions() != null) {
            for (CreateQuizRequest.QuestionRequest questionReq : request.getQuestions()) {
                Question question = Question.builder()
                    .text(questionReq.getText())
                    .category(questionReq.getCategory())
                    .points(questionReq.getPoints() != null ? questionReq.getPoints() : 1)
                    .type(Question.QuestionType.valueOf(questionReq.getType()))
                    .explanation(questionReq.getExplanation())
                    .build();
                
                if (questionReq.getOptions() != null) {
                    for (CreateQuizRequest.QuestionRequest.OptionRequest optionReq : questionReq.getOptions()) {
                        Option option = Option.builder()
                            .text(optionReq.getText())
                            .correct(optionReq.getIsCorrect() != null ? optionReq.getIsCorrect() : false)
                            .order(optionReq.getOrder())
                            .build();
                        question.addOption(option);
                    }
                }
                
                quiz.addQuestion(question);
            }
        }
        
        Quiz updatedQuiz = quizRepository.save(quiz);
        
        for (Question question : updatedQuiz.getQuestions()) {
            Option correctOption = question.getCorrectOption();
            if (correctOption != null) {
                question.setCorrectOptionId(correctOption.getId());
            }
        }
        
        return convertToDTO(updatedQuiz);
    }
    
   @Transactional
public void deleteQuiz(Long id, Long currentUserId) {
    Quiz quiz = quizRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + id));
    
    User currentUser = userService.getUserById(currentUserId);
    
    if (!currentUser.getRole().equals(User.Role.ADMIN) && 
        !quiz.getCreatedBy().getId().equals(currentUserId)) {
        throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce quiz");
    }
    
    quizRepository.delete(quiz);
}
    
    public staticQuizDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + id));
        return convertToDTO(quiz);
    }
    
    public List<staticQuizDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
   public List<staticQuizDTO> getPublishedQuizzes() {
        return quizRepository.findByPublishedTrue().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<staticQuizDTO> getQuizzesByCategory(String category) {
        return quizRepository.findByCategory(category).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    
    public List<staticQuizDTO> searchQuizzes(String title, String category, Boolean published) {
        List<Quiz> allQuizzes = quizRepository.findAll();
        
        return allQuizzes.stream()
            .filter(quiz -> {
                boolean matches = true;
                if (title != null && !title.isEmpty()) {
                    matches = matches && quiz.getTitle().toLowerCase().contains(title.toLowerCase());
                }
                if (category != null && !category.isEmpty()) {
                    matches = matches && quiz.getCategory().equalsIgnoreCase(category);
                }
                if (published != null) {
                    matches = matches && quiz.getPublished().equals(published);
                }
                return matches;
            })
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    
    @Transactional
    public staticQuizDTO generateRandomQuiz(String category, int numberOfQuestions, Long userId) {
        List<Question> allQuestions = questionRepository.findByCategory(category);
        
        if (allQuestions.isEmpty()) {
            throw new RuntimeException("Aucune question trouvée dans la catégorie: " + category);
        }
        
        Collections.shuffle(allQuestions);
        List<Question> selectedQuestions = allQuestions.stream()
            .limit(Math.min(numberOfQuestions, allQuestions.size()))
            .collect(Collectors.toList());
        
        Quiz randomQuiz = Quiz.builder()
            .title("Quiz Aléatoire - " + category)
            .description("Quiz généré automatiquement à partir de la catégorie " + category)
            .category(category)
            .timeLimit(30)
            .passingScore(70)
            .published(false)
            .randomized(true)
            .maxQuestions(numberOfQuestions)
            .build();
        
        for (Question question : selectedQuestions) {
            Question newQuestion = Question.builder()
                .text(question.getText())
                .category(question.getCategory())
                .points(question.getPoints())
                .type(question.getType())
                .explanation(question.getExplanation())
                .build();
            
            for (Option originalOption : question.getOptions()) {
                Option newOption = Option.builder()
                    .text(originalOption.getText())
                    .correct(originalOption.getCorrect())
                    .order(originalOption.getOrder())
                    .build();
                newQuestion.addOption(newOption);
            }
            
            randomQuiz.addQuestion(newQuestion);
        }
        
        Quiz savedQuiz = quizRepository.save(randomQuiz);
        
        for (Question question : savedQuiz.getQuestions()) {
            Option correctOption = question.getCorrectOption();
            if (correctOption != null) {
                question.setCorrectOptionId(correctOption.getId());
            }
        }
        
        return convertToDTO(savedQuiz);
    }
    public boolean verifyQuizAccessCode(Long quizId, String accessCode) {
    Quiz quiz = quizRepository.findById(quizId)
        .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + quizId));
    
    if (quiz.getAccessCode() == null || quiz.getAccessCode().isEmpty()) {
        return true;
    }
    
    return quiz.getAccessCode().equals(accessCode);
}
    
public staticQuizDTO getQuizForTaking(Long id, boolean randomize, String accessCode) {
    Quiz quiz = quizRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + id));

    if (quiz.getAccessCode() != null && !quiz.getAccessCode().isEmpty()) {
        if (accessCode == null || accessCode.isEmpty()) {
            throw new RuntimeException("Code d'accès requis");
        }
        if (!accessCode.equals(quiz.getAccessCode())) {
            throw new RuntimeException("Code d'accès incorrect");
        }
    }

    if (!quiz.getPublished()) {
        throw new RuntimeException("Quiz non publié");
    }

    if (quiz.getQuestions().isEmpty()) {
        throw new RuntimeException("Le quiz ne contient aucune question");
    }

    Quiz quizForTaking = new Quiz();
    quizForTaking.setId(quiz.getId());
    quizForTaking.setTitle(quiz.getTitle());
    quizForTaking.setDescription(quiz.getDescription());
    quizForTaking.setCategory(quiz.getCategory());
    quizForTaking.setTimeLimit(quiz.getTimeLimit());
    quizForTaking.setPassingScore(quiz.getPassingScore());
    quizForTaking.setPublished(quiz.getPublished());
    quizForTaking.setRandomized(quiz.getRandomized());
    quizForTaking.setMaxQuestions(quiz.getMaxQuestions());
    quizForTaking.setAccessCode(quiz.getAccessCode());

    List<Question> questions = new ArrayList<>(quiz.getQuestions());

    if (randomize) {
        Collections.shuffle(questions);
        for (Question question : questions) {
            List<Option> options = new ArrayList<>(question.getOptions());
            Collections.shuffle(options);
            question.setOptions(options);
        }
    }

    quizForTaking.setQuestions(questions);

    staticQuizDTO quizDTO = convertToDTO(quizForTaking);

    for (QuestionDTO questionDTO : quizDTO.getQuestions()) {
        for (OptionDTO optionDTO : questionDTO.getOptions()) {
            optionDTO.setIsCorrect(null);
        }
        questionDTO.setExplanation(null);
    }

    return quizDTO;
}
    
    
    @Transactional
    public QuizAttemptDTO submitQuiz(Long quizId, SubmitQuizRequest request) {
        return quizAttemptService.submitQuiz(quizId, request);
    }
    
    
    public Map<String, Object> getQuizStatistics(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new RuntimeException("Quiz non trouvé avec l'ID: " + quizId));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("quizId", quizId);
        stats.put("quizTitle", quiz.getTitle());
        stats.put("totalQuestions", quiz.getQuestions().size());
        stats.put("totalPoints", quiz.getTotalPoints());
        
        List<QuizAttempt> attempts = quiz.getAttempts();
        stats.put("totalAttempts", attempts.size());
        
        if (!attempts.isEmpty()) {
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
            
            long passedCount = attempts.stream()
                .filter(QuizAttempt::getPassed)
                .count();
            stats.put("passedCount", passedCount);
            stats.put("passRate", (double) passedCount / attempts.size() * 100);
            
            Optional<QuizAttempt> bestAttempt = attempts.stream()
                .max(Comparator.comparing(QuizAttempt::getScore));
            bestAttempt.ifPresent(attempt -> {
                stats.put("bestScore", attempt.getScore());
                stats.put("bestPercentage", attempt.getPercentage());
            });
            
            Optional<QuizAttempt> worstAttempt = attempts.stream()
                .min(Comparator.comparing(QuizAttempt::getScore));
            worstAttempt.ifPresent(attempt -> {
                stats.put("worstScore", attempt.getScore());
                stats.put("worstPercentage", attempt.getPercentage());
            });
            
            double avgTime = attempts.stream()
                .filter(a -> a.getTimeTaken() != null)
                .mapToInt(QuizAttempt::getTimeTaken)
                .average()
                .orElse(0.0);
            stats.put("averageTimeTaken", avgTime);
        }
        
        return stats;
    }
    
    
 private staticQuizDTO convertToDTO(Quiz quiz) {
    staticQuizDTO dto = modelMapper.map(quiz, staticQuizDTO.class);
    dto.setQuestionCount(quiz.getQuestions().size());
    dto.setTotalPoints(quiz.getTotalPoints());
    
    dto.setIsPublished(quiz.getPublished());
    dto.setIsRandomized(quiz.getRandomized());
    
    List<QuestionDTO> questionDTOs = new ArrayList<>();
    
    for (Question question : quiz.getQuestions()) {
        QuestionDTO questionDTO = new QuestionDTO();
        questionDTO.setId(question.getId());
        questionDTO.setText(question.getText());
        questionDTO.setCategory(question.getCategory());
        questionDTO.setPoints(question.getPoints());
        questionDTO.setType(question.getType().name());
        questionDTO.setExplanation(question.getExplanation());
        
        List<OptionDTO> optionDTOs = new ArrayList<>();
        for (Option option : question.getOptions()) {
            OptionDTO optionDTO = new OptionDTO();
            optionDTO.setId(option.getId());
            optionDTO.setText(option.getText());
            optionDTO.setIsCorrect(option.getIsCorrect()); 
            optionDTO.setOrder(option.getOrder());
            optionDTOs.add(optionDTO);
        }
        
        questionDTO.setOptions(optionDTOs);
        questionDTOs.add(questionDTO);
    }
    
    dto.setQuestions(questionDTOs);
    
    return dto;
}
}