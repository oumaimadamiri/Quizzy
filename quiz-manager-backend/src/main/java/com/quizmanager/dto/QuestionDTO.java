package com.quizmanager.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private String text;
    private String category;
    private Integer points;
    private String type;
    private String explanation;
    private List<OptionDTO> options = new ArrayList<>();
}