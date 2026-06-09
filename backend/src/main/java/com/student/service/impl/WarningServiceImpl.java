package com.student.service.impl;

import com.student.entity.Course;
import com.student.entity.Score;
import com.student.entity.Student;
import com.student.mapper.CourseMapper;
import com.student.mapper.ScoreMapper;
import com.student.mapper.StudentMapper;
import com.student.service.WarningService;
import com.student.util.GpaCalculator;
import com.student.util.StudentGpaResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarningServiceImpl implements WarningService {

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private ScoreMapper scoreMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Override
    public Map<String, Object> getClassWarningData(Integer classId, String term) {
        Map<String, Object> result = new HashMap<>();

        List<Student> students = studentMapper.findByClassId(classId);
        if (students == null || students.isEmpty()) {
            result.put("students", new ArrayList<>());
            result.put("courses", new ArrayList<>());
            result.put("warningCount", 0);
            return result;
        }

        List<Integer> studentIds = students.stream()
                .map(Student::getId)
                .collect(Collectors.toList());

        List<Score> allScores = scoreMapper.findByStudentIdsAndTerm(studentIds, term);
        List<Course> allCourses = courseMapper.findAll();
        Map<Integer, Course> courseMap = allCourses.stream()
                .collect(Collectors.toMap(Course::getId, c -> c));

        Map<Integer, List<Score>> scoresByStudent = allScores.stream()
                .collect(Collectors.groupingBy(Score::getStudentId));

        List<StudentGpaResult> studentResults = new ArrayList<>();

        for (Student student : students) {
            List<Score> studentScores = scoresByStudent.getOrDefault(student.getId(), new ArrayList<>());
            List<Score> latestScores = GpaCalculator.filterLatestScores(studentScores);
            Set<Integer> retakeIds = GpaCalculator.getRetakeScoreIds(studentScores);

            for (Score score : studentScores) {
                if (retakeIds.contains(score.getId())) {
                    score.setCourseName(score.getCourseName() + "（重修）");
                }
            }

            BigDecimal gpa = GpaCalculator.calculateGpa(latestScores, courseMap);
            boolean warning = GpaCalculator.isWarning(gpa, latestScores);

            StudentGpaResult studentGpa = new StudentGpaResult();
            studentGpa.setStudentId(student.getId());
            studentGpa.setStudentNo(student.getStudentNo());
            studentGpa.setStudentName(student.getName());
            studentGpa.setGpa(gpa);
            studentGpa.setWarning(warning);
            studentGpa.setAllScores(studentScores);
            studentGpa.setLatestScores(latestScores);

            studentResults.add(studentGpa);
        }

        List<StudentGpaResult> rankedStudents = GpaCalculator.calculateRanking(studentResults);

        long warningCount = rankedStudents.stream()
                .filter(StudentGpaResult::isWarning)
                .count();

        result.put("students", rankedStudents);
        result.put("courses", allCourses);
        result.put("warningCount", warningCount);

        return result;
    }

    @Override
    public List<String> getAllTerms() {
        return scoreMapper.findAllTerms();
    }

    @Override
    public List<Map<String, Object>> getGpaDistribution(Integer classId, String term) {
        Map<String, Object> data = getClassWarningData(classId, term);
        List<StudentGpaResult> students = (List<StudentGpaResult>) data.get("students");

        List<Map<String, Object>> distribution = new ArrayList<>();
        String[] ranges = {"3.5-4.0", "3.0-3.5", "2.5-3.0", "2.0-2.5", "1.5-2.0", "1.0-1.5", "0-1.0", "无成绩"};
        int[] counts = new int[ranges.length];

        for (StudentGpaResult student : students) {
            BigDecimal gpa = student.getGpa();
            if (gpa == null) {
                counts[7]++;
            } else if (gpa.compareTo(new BigDecimal("3.5")) >= 0) {
                counts[0]++;
            } else if (gpa.compareTo(new BigDecimal("3.0")) >= 0) {
                counts[1]++;
            } else if (gpa.compareTo(new BigDecimal("2.5")) >= 0) {
                counts[2]++;
            } else if (gpa.compareTo(new BigDecimal("2.0")) >= 0) {
                counts[3]++;
            } else if (gpa.compareTo(new BigDecimal("1.5")) >= 0) {
                counts[4]++;
            } else if (gpa.compareTo(new BigDecimal("1.0")) >= 0) {
                counts[5]++;
            } else {
                counts[6]++;
            }
        }

        for (int i = 0; i < ranges.length; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("range", ranges[i]);
            item.put("count", counts[i]);
            distribution.add(item);
        }

        return distribution;
    }
}
