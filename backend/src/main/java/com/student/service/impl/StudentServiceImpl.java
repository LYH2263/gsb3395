package com.student.service.impl;

import com.student.entity.Student;
import com.student.mapper.StudentMapper;
import com.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentMapper studentMapper;

    @Override
    public Map<String, Object> getStudentList(int page, int limit, String name, Integer classId) {
        int offset = (page - 1) * limit;
        List<Student> list = studentMapper.findByPage(offset, limit, name, classId);
        int total = studentMapper.count(name, classId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("limit", limit);
        return result;
    }

    @Override
    public Student getStudentById(Integer id) {
        return studentMapper.findById(id);
    }

    @Override
    public Map<String, Object> addStudent(Student student) {
        if (studentMapper.countByStudentNo(student.getStudentNo(), null) > 0) {
            return Map.of("success", false, "message", "学号已存在");
        }
        boolean success = studentMapper.insert(student) > 0;
        return Map.of("success", success, "message", success ? "添加成功" : "添加失败");
    }

    @Override
    public Map<String, Object> updateStudent(Student student) {
        if (studentMapper.countByStudentNo(student.getStudentNo(), student.getId()) > 0) {
            return Map.of("success", false, "message", "学号已存在");
        }
        boolean success = studentMapper.update(student) > 0;
        return Map.of("success", success, "message", success ? "修改成功" : "修改失败");
    }

    @Override
    public boolean deleteStudent(Integer id) {
        return studentMapper.delete(id) > 0;
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", studentMapper.countTotal());
        stats.put("genderData", studentMapper.countByGender());
        stats.put("classData", studentMapper.countByClass());
        stats.put("activeCourses", studentMapper.countActiveCourses());
        stats.put("averageScore", String.format("%.1f", studentMapper.getAverageScore()));
        stats.put("activeClasses", studentMapper.countActiveClasses());
        return stats;
    }
}
