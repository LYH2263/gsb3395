package com.student.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 学业预警榜单中某门课的成绩明细。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseScoreDetail {
    private Integer courseId;
    private String courseCode;
    private String courseName;
    private Integer credit;
    /** 该门课最新一次成绩；null 表示尚无有效成绩 */
    private BigDecimal score;
    /** 是否为重修被舍弃的旧记录（前端置灰用） */
    private boolean superseded;
}
