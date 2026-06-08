package com.student.service;

import com.student.entity.User;

public interface UserService {
    User login(String username, String password);
    User findByUsername(String username);
    boolean register(User user);
}
