package com.student.mapper;

import com.student.entity.User;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface UserMapper {
    User findByUsername(@Param("username") String username);
    User findById(@Param("id") Integer id);
    List<User> findAll();
    int insert(User user);
    int update(User user);
    int delete(@Param("id") Integer id);
}
