package com.student.mapper;

import com.student.entity.Score;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ScoreMapper {

    /**
     * 查询指定班级（可选学期）所有学生的所有成绩明细，附带课程信息。
     */
    List<Score> findClassScoreDetails(@Param("classId") Integer classId,
                                      @Param("term") String term);

    /** 查询某班级在 scores 表里出现过的所有学期，按降序返回。 */
    List<String> findTermsByClass(@Param("classId") Integer classId);
}
