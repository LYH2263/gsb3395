package com.student.service.impl;

import com.student.entity.Score;
import com.student.entity.Student;
import com.student.mapper.ScoreMapper;
import com.student.mapper.StudentMapper;
import com.student.service.ScoreService;
import com.student.util.GpaCalculator;
import com.student.util.GpaCalculator.ScoreCredit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScoreServiceImpl implements ScoreService {

    @Autowired
    private ScoreMapper scoreMapper;

    @Autowired
    private StudentMapper studentMapper;

    @Override
    public Map<String, Object> getAcademicWarningList(Integer classId, String term) {
        List<Score> rawScores = scoreMapper.findScoresByClassAndTerm(classId, term);
        List<String> terms = scoreMapper.findDistinctTerms();
        List<Student> students = studentMapper.findByClassId(classId);

        Map<Integer, List<Score>> scoresByStudent = rawScores.stream()
                .collect(Collectors.groupingBy(Score::getStudentId, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> resultList = new ArrayList<>();

        for (Student student : students) {
            List<Score> studentScores = scoresByStudent.getOrDefault(student.getId(), Collections.emptyList());

            Map<Integer, List<Score>> scoresByCourse = studentScores.stream()
                    .collect(Collectors.groupingBy(Score::getCourseId, LinkedHashMap::new, Collectors.toList()));

            List<Map<String, Object>> scoreDetails = new ArrayList<>();
            List<ScoreCredit> activeScoreCredits = new ArrayList<>();
            List<BigDecimal> latestScores = new ArrayList<>();

            for (Map.Entry<Integer, List<Score>> csEntry : scoresByCourse.entrySet()) {
                List<Score> courseScoreList = csEntry.getValue();
                Score latest = courseScoreList.get(0);

                for (int i = 0; i < courseScoreList.size(); i++) {
                    Score s = courseScoreList.get(i);
                    boolean isRetake = i > 0;

                    Map<String, Object> detail = new LinkedHashMap<>();
                    detail.put("courseId", s.getCourseId());
                    detail.put("courseName", s.getCourseName());
                    detail.put("credit", s.getCredit());
                    detail.put("score", s.getScore());
                    detail.put("term", s.getTerm());
                    detail.put("examTime", s.getExamTime());
                    detail.put("gradePoint", s.getScore() != null ? GpaCalculator.scoreToGradePoint(s.getScore()) : null);
                    detail.put("isRetake", isRetake);
                    scoreDetails.add(detail);
                }

                if (latest.getScore() != null) {
                    activeScoreCredits.add(new ScoreCredit(latest.getScore(), latest.getCredit()));
                    latestScores.add(latest.getScore());
                }
            }

            BigDecimal gpa = GpaCalculator.calculateGpa(activeScoreCredits);
            boolean isWarning = GpaCalculator.isWarning(gpa, latestScores);

            Map<String, Object> studentData = new LinkedHashMap<>();
            studentData.put("studentId", student.getId());
            studentData.put("studentNo", student.getStudentNo());
            studentData.put("studentName", student.getName());
            studentData.put("className", student.getClassName());
            studentData.put("gpa", gpa);
            studentData.put("gpaDisplay", gpa != null ? gpa.toPlainString() : "\u2014");
            studentData.put("isWarning", isWarning);
            studentData.put("scores", scoreDetails);
            resultList.add(studentData);
        }

        resultList.sort((a, b) -> GpaCalculator.compareGpa(
                (BigDecimal) a.get("gpa"), (BigDecimal) b.get("gpa")));

        int denseRank = 0;
        BigDecimal lastGpa = null;
        for (Map<String, Object> studentData : resultList) {
            BigDecimal currentGpa = (BigDecimal) studentData.get("gpa");
            if (currentGpa == null) {
                studentData.put("rank", "\u2014");
            } else {
                if (lastGpa == null || currentGpa.compareTo(lastGpa) != 0) {
                    denseRank++;
                }
                studentData.put("rank", denseRank);
                lastGpa = currentGpa;
            }
        }

        List<Map<String, Object>> gpaDistribution = calculateGpaDistribution(resultList);

        Map<String, Object> result = new HashMap<>();
        result.put("list", resultList);
        result.put("terms", terms);
        result.put("gpaDistribution", gpaDistribution);
        return result;
    }

    private List<Map<String, Object>> calculateGpaDistribution(List<Map<String, Object>> students) {
        String[] rangeLabels = {"0~1.0", "1.0~2.0", "2.0~3.0", "3.0~4.0"};
        double[] rangeBounds = {0, 1.0, 2.0, 3.0, 4.0};
        List<Map<String, Object>> distribution = new ArrayList<>();
        for (int i = 0; i < rangeLabels.length; i++) {
            final double lo = rangeBounds[i];
            final double hi = rangeBounds[i + 1];
            final boolean isLast = i == rangeLabels.length - 1;
            long count = students.stream()
                    .filter(s -> s.get("gpa") != null)
                    .filter(s -> {
                        double gpa = ((BigDecimal) s.get("gpa")).doubleValue();
                        return isLast ? (gpa >= lo && gpa <= hi) : (gpa >= lo && gpa < hi);
                    })
                    .count();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("range", rangeLabels[i]);
            item.put("count", (int) count);
            distribution.add(item);
        }
        return distribution;
    }
}
