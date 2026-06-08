package com.student.entity;

import lombok.Data;
import java.util.Date;

@Data
public class User {
    private Integer id;
    private String username;
    private String password;
    private String role; // ADMIN, TEACHER, STUDENT
    private String realName;
    private Date createdAt;
}
