package com.quizmanager.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SubmitQuizRequest {
    private Long userId;
    private String userName;
    private Integer timeTaken;
    private Map<Long, Long> answers; 
}