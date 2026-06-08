package com.student.service;

import com.student.entity.Student;
import java.util.Map;

public interface StudentService {
    Map<String, Object> getStudentList(int page, int limit, String name, Integer classId);
    Student getStudentById(Integer id);
    Map<String, Object> addStudent(Student student);
    Map<String, Object> updateStudent(Student student);
    boolean deleteStudent(Integer id);
    
    // Statistics
    Map<String, Object> getStatistics();
}
