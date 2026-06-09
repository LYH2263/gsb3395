package com.student.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 学业预警榜单一行。
 */
@Data
public class WarningRow {
    private Integer studentId;
    private String studentNo;
    private String studentName;

    /** 名次：未参与排名（GPA 为 null）时为 null */
    private Integer rank;

    /** 累计加权 GPA；为 null 时前端显示「—」 */
    private BigDecimal gpa;

    /** 是否预警 */
    private boolean warning;

    /** 各门课成绩明细，含被重修舍弃的旧记录（superseded=true） */
    private List<CourseScoreDetail> details;
}
