package com.student.service;

import com.student.dto.WarningRow;

import java.util.List;
import java.util.Map;

public interface WarningService {

    /**
     * 计算指定班级的学业预警榜单。
     *
     * @param classId 班级 ID（必填）
     * @param term    学期；为 null 或空字符串表示「全部学期」（累计 GPA）
     */
    Map<String, Object> getClassWarning(Integer classId, String term);

    /**
     * 获取某班级在 scores 表里出现过的学期列表。
     */
    List<String> getTermsByClass(Integer classId);
}
