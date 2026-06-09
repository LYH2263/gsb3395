package com.student.controller;

import com.student.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/warning")
@CrossOrigin(origins = "*")
public class AcademicWarningController {

    @Autowired
    private ScoreService scoreService;

    @GetMapping("/list")
    public Map<String, Object> list(
            @RequestParam(required = false) Integer classId,
            @RequestParam(required = false) String term) {
        return scoreService.getAcademicWarningList(classId, term);
    }
}
