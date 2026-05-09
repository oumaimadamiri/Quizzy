package com.quizmanager.service;

import com.quizmanager.dto.QuestionDTO;
import com.quizmanager.exception.ResourceNotFoundException;
import com.quizmanager.model.Question;
import com.quizmanager.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final ModelMapper modelMapper;
    
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        return convertToDTO(question);
    }
    
    public List<QuestionDTO> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuestionDTO> getQuestionsByCategory(String category) {
        return questionRepository.findByCategory(category).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QuestionDTO> getRandomQuestionsByCategory(String category, int limit) {
        return questionRepository.findRandomQuestionsByCategory(category, limit).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Long countQuestionsByQuizId(Long quizId) {
        return questionRepository.countByQuizId(quizId);
    }
    
    private QuestionDTO convertToDTO(Question question) {
        return modelMapper.map(question, QuestionDTO.class);
    }
}