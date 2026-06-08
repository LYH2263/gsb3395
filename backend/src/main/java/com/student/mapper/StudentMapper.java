package com.student.mapper;

import com.student.entity.Student;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface StudentMapper {
    Student findById(@Param("id") Integer id);
    List<Student> findByPage(@Param("offset") int offset, @Param("limit") int limit, 
                           @Param("name") String name, @Param("classId") Integer classId);
    int count(@Param("name") String name, @Param("classId") Integer classId);
    int countByStudentNo(@Param("studentNo") String studentNo, @Param("excludeId") Integer excludeId);
    int insert(Student student);
    int update(Student student);
    int delete(@Param("id") Integer id);
    
    // For Statistics
    int countTotal();
    List<java.util.Map<String, Object>> countByGender();
    List<java.util.Map<String, Object>> countByClass();
    int countActiveCourses();
    Double getAverageScore();
    int countActiveClasses();
}
