package com.student.util;

import com.student.entity.Course;
import com.student.entity.Score;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

public class GpaCalculator {

    public static final BigDecimal GPA_4_0 = new BigDecimal("4.0");
    public static final BigDecimal GPA_3_0 = new BigDecimal("3.0");
    public static final BigDecimal GPA_2_0 = new BigDecimal("2.0");
    public static final BigDecimal GPA_1_0 = new BigDecimal("1.0");
    public static final BigDecimal GPA_0_0 = new BigDecimal("0.0");

    public static BigDecimal scoreToGpa(BigDecimal score) {
        if (score == null) {
            return null;
        }
        int scoreInt = score.intValue();
        if (scoreInt >= 90) {
            return GPA_4_0;
        } else if (scoreInt >= 80) {
            return GPA_3_0;
        } else if (scoreInt >= 70) {
            return GPA_2_0;
        } else if (scoreInt >= 60) {
            return GPA_1_0;
        } else {
            return GPA_0_0;
        }
    }

    public static List<Score> filterLatestScores(List<Score> scores) {
        if (scores == null || scores.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Integer, List<Score>> scoresByCourse = scores.stream()
                .collect(Collectors.groupingBy(Score::getCourseId));

        List<Score> result = new ArrayList<>();

        for (Map.Entry<Integer, List<Score>> entry : scoresByCourse.entrySet()) {
            List<Score> courseScores = entry.getValue();
            if (courseScores.size() == 1) {
                result.addAll(courseScores);
            } else {
                Score latest = courseScores.stream()
                        .max(Comparator.comparing(Score::getExamTime, Comparator.nullsLast(Comparator.naturalOrder())))
                        .orElse(null);
                if (latest != null) {
                    result.add(latest);
                }
            }
        }

        return result;
    }

    public static Set<Integer> getRetakeScoreIds(List<Score> allScores) {
        if (allScores == null || allScores.isEmpty()) {
            return new HashSet<>();
        }

        Map<Integer, List<Score>> scoresByCourse = allScores.stream()
                .collect(Collectors.groupingBy(Score::getCourseId));

        Set<Integer> retakeIds = new HashSet<>();

        for (Map.Entry<Integer, List<Score>> entry : scoresByCourse.entrySet()) {
            List<Score> courseScores = entry.getValue();
            if (courseScores.size() > 1) {
                Score latest = courseScores.stream()
                        .max(Comparator.comparing(Score::getExamTime, Comparator.nullsLast(Comparator.naturalOrder())))
                        .orElse(null);
                for (Score s : courseScores) {
                    if (latest == null || !s.getId().equals(latest.getId())) {
                        retakeIds.add(s.getId());
                    }
                }
            }
        }

        return retakeIds;
    }

    public static BigDecimal calculateGpa(List<Score> latestScores, Map<Integer, Course> courseMap) {
        if (latestScores == null || latestScores.isEmpty() || courseMap == null) {
            return null;
        }

        BigDecimal totalWeightedGpa = BigDecimal.ZERO;
        int totalCredits = 0;
        boolean hasValidScore = false;

        for (Score score : latestScores) {
            if (score.getScore() == null) {
                continue;
            }
            Course course = courseMap.get(score.getCourseId());
            if (course == null || course.getCredit() == null) {
                continue;
            }

            BigDecimal gpa = scoreToGpa(score.getScore());
            if (gpa != null) {
                totalWeightedGpa = totalWeightedGpa.add(gpa.multiply(new BigDecimal(course.getCredit())));
                totalCredits += course.getCredit();
                hasValidScore = true;
            }
        }

        if (!hasValidScore || totalCredits == 0) {
            return null;
        }

        return totalWeightedGpa.divide(new BigDecimal(totalCredits), 2, RoundingMode.HALF_UP);
    }

    public static boolean isWarning(BigDecimal gpa, List<Score> latestScores) {
        if (gpa != null && gpa.compareTo(new BigDecimal("2.0")) < 0) {
            return true;
        }

        if (latestScores != null) {
            for (Score score : latestScores) {
                if (score.getScore() != null && score.getScore().compareTo(new BigDecimal("60")) < 0) {
                    return true;
                }
            }
        }

        return false;
    }

    public static List<StudentGpaResult> calculateRanking(List<StudentGpaResult> students) {
        if (students == null || students.isEmpty()) {
            return new ArrayList<>();
        }

        List<StudentGpaResult> withGpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .sorted((a, b) -> b.getGpa().compareTo(a.getGpa()))
                .collect(Collectors.toList());

        List<StudentGpaResult> withoutGpa = students.stream()
                .filter(s -> s.getGpa() == null)
                .collect(Collectors.toList());

        int rank = 0;
        BigDecimal prevGpa = null;
        for (int i = 0; i < withGpa.size(); i++) {
            StudentGpaResult student = withGpa.get(i);
            BigDecimal currentGpa = student.getGpa();
            if (prevGpa == null || currentGpa.compareTo(prevGpa) != 0) {
                rank = i + 1;
            }
            student.setRank(rank);
            prevGpa = currentGpa;
        }

        List<StudentGpaResult> result = new ArrayList<>();
        result.addAll(withGpa);
        result.addAll(withoutGpa);

        return result;
    }
}
