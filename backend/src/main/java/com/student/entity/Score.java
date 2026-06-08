package com.student.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class Score {
    private Integer id;
    private Integer studentId;
    private Integer courseId;
    private BigDecimal score;
    private String term;
    private Date examTime;
    
    // Extra fields
    private String studentName;
    private String courseName;
}
