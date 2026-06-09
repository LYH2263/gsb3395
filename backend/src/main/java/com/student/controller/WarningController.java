package com.student.controller;

import com.student.service.WarningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warnings")
@CrossOrigin(origins = "*")
public class WarningController {

    @Autowired
    private WarningService warningService;

    @GetMapping("/class/{classId}")
    public Map<String, Object> getClassWarning(
            @PathVariable Integer classId,
            @RequestParam(required = false) String term) {
        return warningService.getClassWarningData(classId, term);
    }

    @GetMapping("/terms")
    public List<String> getTerms() {
        return warningService.getAllTerms();
    }

    @GetMapping("/distribution/{classId}")
    public List<Map<String, Object>> getGpaDistribution(
            @PathVariable Integer classId,
            @RequestParam(required = false) String term) {
        return warningService.getGpaDistribution(classId, term);
    }
}
