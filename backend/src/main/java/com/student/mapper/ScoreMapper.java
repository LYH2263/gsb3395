package com.student.mapper;

import com.student.entity.Score;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ScoreMapper {
    List<Score> findByStudentIdsAndTerm(@Param("studentIds") List<Integer> studentIds,
                                         @Param("term") String term);

    List<String> findAllTerms();
}
