package com.student.mapper;

import com.student.entity.Score;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface ScoreMapper {
    List<Score> findScoresByClassAndTerm(@Param("classId") Integer classId, @Param("term") String term);
    List<String> findDistinctTerms();
}
