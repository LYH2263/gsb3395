package com.student.controller;

import com.student.service.WarningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warning")
@CrossOrigin(origins = "*")
public class WarningController {

    @Autowired
    private WarningService warningService;

    /**
     * 班级学业预警榜单。
     *
     * @param classId 班级 ID
     * @param term    可选；为空表示「全部学期」
     */
    @GetMapping("/class/{classId}")
    public Map<String, Object> classWarning(@PathVariable Integer classId,
                                            @RequestParam(required = false) String term) {
        return warningService.getClassWarning(classId, term);
    }

    /** 班级出现过的学期下拉。 */
    @GetMapping("/class/{classId}/terms")
    public List<String> terms(@PathVariable Integer classId) {
        return warningService.getTermsByClass(classId);
    }
}
