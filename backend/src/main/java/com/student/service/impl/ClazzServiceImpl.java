package com.student.service.impl;

import com.student.entity.Clazz;
import com.student.mapper.ClazzMapper;
import com.student.service.ClazzService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClazzServiceImpl implements ClazzService {
    @Autowired
    private ClazzMapper clazzMapper;

    @Override
    public List<Clazz> getAllClasses() {
        return clazzMapper.findAll();
    }
}
