package com.student.entity;

import lombok.Data;

@Data
public class Course {
    private Integer id;
    private String courseCode;
    private String courseName;
    private Integer teacherId;
    private Integer credit;
    
    // Extra fields
    private String teacherName;
}
