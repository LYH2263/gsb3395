package com.student.controller;

import com.student.entity.Clazz;
import com.student.service.ClazzService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClazzController {
    @Autowired
    private ClazzService clazzService;

    @GetMapping("/all")
    public List<Clazz> all() {
        return clazzService.getAllClasses();
    }
}
