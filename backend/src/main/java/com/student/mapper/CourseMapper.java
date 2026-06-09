package com.student.mapper;

import com.student.entity.Course;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface CourseMapper {
    List<Course> findAll();

    Course findById(@Param("id") Integer id);
}
