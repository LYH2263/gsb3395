package com.student.service;

import java.util.Map;

public interface WarningService {
    Map<String, Object> getWarningRanking(Integer classId, String term);
}
