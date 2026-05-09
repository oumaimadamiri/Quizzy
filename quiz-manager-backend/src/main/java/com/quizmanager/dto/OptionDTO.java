package com.quizmanager.dto;

import lombok.Data;

@Data
public class OptionDTO {
    private Long id;
    private String text;
    private Boolean isCorrect;
    private Integer order;
}