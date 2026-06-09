package com.student.service.impl;

import com.student.entity.Course;
import com.student.entity.Score;
import com.student.entity.Student;
import com.student.mapper.CourseMapper;
import com.student.mapper.ScoreMapper;
import com.student.mapper.StudentMapper;
import com.student.service.WarningService;
import com.student.util.GpaCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class WarningServiceImpl implements WarningService {

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private ScoreMapper scoreMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Override
    public Map<String, Object> getWarningRanking(Integer classId, String term) {
        Map<String, Object> result = new HashMap<>();

        if (classId == null) {
            result.put("success", false);
            result.put("message", "请选择班级");
            return result;
        }

        List<Student> students = studentMapper.findByClassId(classId);
        List<Score> scores = scoreMapper.findByClassId(classId, term);
        List<Course> allCourses = courseMapper.findAll();
        List<String> terms = scoreMapper.findDistinctTermsByClassId(classId);

        Map<Integer, Course> courseMap = new HashMap<>();
        for (Course c : allCourses) {
            courseMap.put(c.getId(), c);
        }

        Map<Integer, List<Score>> scoresByStudent = new HashMap<>();
        Set<Integer> involvedCourseIds = new HashSet<>();
        for (Score s : scores) {
            scoresByStudent.computeIfAbsent(s.getStudentId(), k -> new ArrayList<>()).add(s);
            involvedCourseIds.add(s.getCourseId());
        }

        List<Course> usedCourses = new ArrayList<>();
        for (Integer cid : involvedCourseIds) {
            Course c = courseMap.get(cid);
            if (c != null) usedCourses.add(c);
        }
        usedCourses.sort(Comparator.comparing(Course::getId));

        List<GpaCalculator.StudentAcademicData> academicDataList = new ArrayList<>();

        for (Student student : students) {
            GpaCalculator.StudentAcademicData data = new GpaCalculator.StudentAcademicData();
            data.setStudentId(student.getId());
            data.setStudentNo(student.getStudentNo());
            data.setStudentName(student.getName());

            List<GpaCalculator.CourseScore> courseScores = new ArrayList<>();
            List<Score> studentScores = scoresByStudent.getOrDefault(student.getId(), new ArrayList<>());

            Map<Integer, List<Score>> scoresByCourse = new HashMap<>();
            for (Score s : studentScores) {
                scoresByCourse.computeIfAbsent(s.getCourseId(), k -> new ArrayList<>()).add(s);
            }

            for (Course course : usedCourses) {
                List<Score> courseScoreList = scoresByCourse.getOrDefault(course.getId(), new ArrayList<>());
                if (courseScoreList.isEmpty()) {
                    GpaCalculator.CourseScore cs = new GpaCalculator.CourseScore();
                    cs.setCourseId(course.getId());
                    cs.setCourseName(course.getCourseName());
                    cs.setCredit(BigDecimal.valueOf(course.getCredit()));
                    cs.setScore(null);
                    cs.setRetake(false);
                    courseScores.add(cs);
                } else {
                    courseScoreList.sort((a, b) -> {
                        if (a.getExamTime() == null && b.getExamTime() == null) return 0;
                        if (a.getExamTime() == null) return 1;
                        if (b.getExamTime() == null) return -1;
                        return b.getExamTime().compareTo(a.getExamTime());
                    });

                    boolean first = true;
                    for (Score s : courseScoreList) {
                        GpaCalculator.CourseScore cs = new GpaCalculator.CourseScore();
                        cs.setCourseId(course.getId());
                        cs.setCourseName(course.getCourseName());
                        cs.setCredit(BigDecimal.valueOf(course.getCredit()));
                        cs.setScore(s.getScore());
                        cs.setExamTime(s.getExamTime());
                        cs.setTerm(s.getTerm());
                        cs.setRetake(!first);
                        courseScores.add(cs);
                        first = false;
                    }
                }
            }

            data.setCourseScores(courseScores);
            academicDataList.add(data);
        }

        List<GpaCalculator.StudentWarningResult> ranking = GpaCalculator.rankStudents(academicDataList);
        List<Integer> distribution = GpaCalculator.getGpaDistribution(ranking);

        int warningCount = 0;
        for (GpaCalculator.StudentWarningResult r : ranking) {
            if (r.isWarning()) warningCount++;
        }

        result.put("success", true);
        result.put("ranking", ranking);
        result.put("courses", usedCourses);
        result.put("terms", terms);
        result.put("distribution", distribution);
        result.put("stats", Map.of(
                "totalStudents", students.size(),
                "warningCount", warningCount,
                "validGpaCount", (int) ranking.stream().filter(r -> r.getGpa() != null).count()
        ));
        return result;
    }
}
