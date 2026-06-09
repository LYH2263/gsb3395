package com.student.util;

import com.student.entity.Score;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class StudentGpaResult {
    private Integer studentId;
    private String studentNo;
    private String studentName;
    private BigDecimal gpa;
    private Integer rank;
    private boolean warning;
    private List<Score> allScores;
    private List<Score> latestScores;
}
