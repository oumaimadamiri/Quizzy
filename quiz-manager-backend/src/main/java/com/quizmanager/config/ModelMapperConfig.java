package com.quizmanager.config;

import com.quizmanager.dto.AuthResponse;
import com.quizmanager.dto.OptionDTO;
import com.quizmanager.dto.QuizDTO;
import com.quizmanager.dto.UserDTO;
import com.quizmanager.model.Option;
import com.quizmanager.model.Quiz;
import com.quizmanager.model.User;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
            .setMatchingStrategy(MatchingStrategies.STRICT)
            .setFieldMatchingEnabled(true)
            .setSkipNullEnabled(true)
            .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
            .setAmbiguityIgnored(true);
        
        modelMapper.createTypeMap(Quiz.class, QuizDTO.class)
            .addMapping(Quiz::getPublished, QuizDTO::setIsPublished)
            .addMapping(Quiz::getRandomized, QuizDTO::setIsRandomized);
        
        modelMapper.createTypeMap(Option.class, OptionDTO.class)
            .addMapping(Option::getCorrect, OptionDTO::setIsCorrect);
        
        modelMapper.createTypeMap(QuizDTO.class, Quiz.class)
            .addMapping(QuizDTO::getIsPublished, Quiz::setPublished)
            .addMapping(QuizDTO::getIsRandomized, Quiz::setRandomized);
        
        modelMapper.createTypeMap(OptionDTO.class, Option.class)
            .addMapping(OptionDTO::getIsCorrect, Option::setCorrect);
        
        modelMapper.createTypeMap(User.class, UserDTO.class)
            .addMapping(User::getRole, UserDTO::setRole);
        
        modelMapper.createTypeMap(User.class, AuthResponse.UserDTO.class)
            .addMapping(User::getRole, AuthResponse.UserDTO::setRole);
        
        return modelMapper;
    }
}