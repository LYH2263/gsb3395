SET NAMES utf8mb4;
-- Create Database
CREATE DATABASE IF NOT EXISTS ssm_student_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssm_student_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL COMMENT '角色',
    real_name VARCHAR(50) COMMENT '真实姓名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE COMMENT '班级名称',
    description VARCHAR(200) COMMENT '备注说明'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_no VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') NOT NULL COMMENT '性别',
    birthday DATE COMMENT '出生日期',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    class_id INT COMMENT '班级ID',
    user_id INT COMMENT '关联用户ID',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE COMMENT '课程编号',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    teacher_id INT COMMENT '任课教师ID',
    credit INT DEFAULT 2 COMMENT '学分',
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grades Table
CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL COMMENT '学生ID',
    course_id INT NOT NULL COMMENT '课程ID',
    score DECIMAL(5, 2) COMMENT '成绩',
    term VARCHAR(20) COMMENT '学期',
    exam_time DATETIME COMMENT '考试时间',
    UNIQUE KEY (student_id, course_id, term),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data (Chinese)
INSERT INTO users (username, password, role, real_name) VALUES 
('admin', '123456', 'ADMIN', '超级管理员'),
('teacher_wang', '123456', 'TEACHER', '王老师'),
('teacher_li', '123456', 'TEACHER', '李老师'),
('student_zhang', '123456', 'STUDENT', '张同学'),
('student_li', '123456', 'STUDENT', '李同学');

INSERT INTO classes (class_name, description) VALUES 
('计算机科学2024-1班', '软件开发方向'),
('大数据2024-2班', '数据分析方向'),
('人工智能2024-1班', 'AI算法方向');

INSERT INTO students (student_no, name, gender, birthday, phone, email, class_id, user_id) VALUES 
('20240001', '张三', '男', '2005-05-15', '13812345678', 'zhangsan@example.com', 1, 4),
('20240002', '李四', '女', '2005-08-22', '13987654321', 'lisi@example.com', 1, 5),
('20240003', '王五', '男', '2005-12-01', '13700001111', 'wangwu@example.com', 2, NULL),
('20240004', '赵六', '女', '2006-02-14', '13622223333', 'zhaoliu@example.com', 3, NULL);

INSERT INTO courses (course_code, course_name, teacher_id, credit) VALUES 
('CS101', 'Java程序设计', 2, 4),
('CS102', '数据结构', 2, 4),
('CS201', '数据库原理', 3, 3),
('AI101', '机器学习导论', 3, 4);

INSERT INTO scores (student_id, course_id, score, term, exam_time) VALUES 
(1, 1, 85.5, '2024-秋季', '2025-01-10 09:00:00'),
(1, 2, 92.0, '2024-秋季', '2025-01-12 14:00:00'),
(2, 1, 78.0, '2024-秋季', '2025-01-10 09:00:00'),
(2, 3, 88.5, '2024-秋季', '2025-01-15 10:00:00'),
(3, 1, 95.0, '2024-秋季', '2025-01-10 09:00:00');
