package com.student.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Student {
    private Integer id;
    private String studentNo;
    private String name;
    private String gender;
    private Date birthday;
    private String phone;
    private String email;
    private Integer classId;
    private Integer userId;
    
    // Extra fields for meaningful info
    private String className;
    private String username; 
}
