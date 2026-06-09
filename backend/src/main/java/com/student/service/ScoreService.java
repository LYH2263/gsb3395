package com.student.service;

import java.util.Map;

public interface ScoreService {
    Map<String, Object> getAcademicWarningList(Integer classId, String term);
}
