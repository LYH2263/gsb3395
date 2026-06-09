package com.student.mapper;

import com.student.entity.Score;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface ScoreMapper {
    List<Score> findByClassId(@Param("classId") Integer classId, @Param("term") String term);
    List<String> findDistinctTermsByClassId(@Param("classId") Integer classId);
}
