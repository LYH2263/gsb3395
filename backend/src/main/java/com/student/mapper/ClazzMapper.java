package com.student.mapper;

import com.student.entity.Clazz;
import java.util.List;

public interface ClazzMapper {
    List<Clazz> findAll();
    Clazz findById(Integer id);
}
