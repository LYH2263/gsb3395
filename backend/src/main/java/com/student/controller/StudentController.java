package com.student.controller;

import com.student.entity.Student;
import com.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/list")
    public Map<String, Object> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer classId) {
        return studentService.getStudentList(page, limit, name, classId);
    }

    @GetMapping("/{id}")
    public Student get(@PathVariable Integer id) {
        return studentService.getStudentById(id);
    }

    @PostMapping("/add")
    public Map<String, Object> add(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    @PostMapping("/update")
    public Map<String, Object> update(@RequestBody Student student) {
        return studentService.updateStudent(student);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Integer id) {
        boolean success = studentService.deleteStudent(id);
        return Map.of("success", success, "message", success ? "删除成功" : "删除失败");
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return studentService.getStatistics();
    }
}
