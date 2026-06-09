package com.student.controller;

import com.student.service.WarningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/warning")
@CrossOrigin(origins = "*")
public class WarningController {

    @Autowired
    private WarningService warningService;

    @GetMapping("/ranking")
    public Map<String, Object> ranking(
            @RequestParam Integer classId,
            @RequestParam(required = false) String term) {
        return warningService.getWarningRanking(classId, term);
    }
}
