package com.student.service;

import java.util.List;
import java.util.Map;

public interface WarningService {
    Map<String, Object> getClassWarningData(Integer classId, String term);
    List<String> getAllTerms();
    List<Map<String, Object>> getGpaDistribution(Integer classId, String term);
}
