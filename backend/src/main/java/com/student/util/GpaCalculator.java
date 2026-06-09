package com.student.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

public class GpaCalculator {

    public static final BigDecimal WARNING_GPA_THRESHOLD = new BigDecimal("2.0");
    public static final BigDecimal PASS_SCORE_THRESHOLD = new BigDecimal("60");

    public static BigDecimal scoreToGpaPoint(BigDecimal score) {
        if (score == null) {
            return null;
        }
        if (score.compareTo(new BigDecimal("90")) >= 0) {
            return new BigDecimal("4.0");
        } else if (score.compareTo(new BigDecimal("80")) >= 0) {
            return new BigDecimal("3.0");
        } else if (score.compareTo(new BigDecimal("70")) >= 0) {
            return new BigDecimal("2.0");
        } else if (score.compareTo(new BigDecimal("60")) >= 0) {
            return new BigDecimal("1.0");
        } else {
            return new BigDecimal("0.0");
        }
    }

    public static BigDecimal calculateGpa(List<CourseScore> courseScores) {
        if (courseScores == null || courseScores.isEmpty()) {
            return null;
        }

        BigDecimal totalWeightedPoints = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        boolean hasValidScore = false;

        for (CourseScore cs : courseScores) {
            if (cs.getScore() == null || cs.isRetake()) {
                continue;
            }
            hasValidScore = true;
            BigDecimal point = scoreToGpaPoint(cs.getScore());
            BigDecimal credit = cs.getCredit() != null ? cs.getCredit() : BigDecimal.ZERO;
            totalWeightedPoints = totalWeightedPoints.add(point.multiply(credit));
            totalCredits = totalCredits.add(credit);
        }

        if (!hasValidScore || totalCredits.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        return totalWeightedPoints.divide(totalCredits, 2, RoundingMode.HALF_UP);
    }

    public static boolean isWarning(BigDecimal gpa, List<CourseScore> courseScores) {
        if (gpa != null && gpa.compareTo(WARNING_GPA_THRESHOLD) < 0) {
            return true;
        }
        if (courseScores != null) {
            for (CourseScore cs : courseScores) {
                if (cs.isRetake() || cs.getScore() == null) {
                    continue;
                }
                if (cs.getScore().compareTo(PASS_SCORE_THRESHOLD) < 0) {
                    return true;
                }
            }
        }
        return false;
    }

    public static List<StudentWarningResult> rankStudents(List<StudentAcademicData> studentsData) {
        List<StudentWarningResult> results = new ArrayList<>();

        for (StudentAcademicData data : studentsData) {
            BigDecimal gpa = calculateGpa(data.getCourseScores());
            boolean isWarning = isWarning(gpa, data.getCourseScores());

            StudentWarningResult result = new StudentWarningResult();
            result.setStudentId(data.getStudentId());
            result.setStudentNo(data.getStudentNo());
            result.setStudentName(data.getStudentName());
            result.setCourseScores(data.getCourseScores());
            result.setGpa(gpa);
            result.setWarning(isWarning);
            results.add(result);
        }

        List<StudentWarningResult> validStudents = new ArrayList<>();
        for (StudentWarningResult r : results) {
            if (r.getGpa() != null) {
                validStudents.add(r);
            }
        }

        validStudents.sort((a, b) -> b.getGpa().compareTo(a.getGpa()));

        int rank = 0;
        BigDecimal lastGpa = null;
        int count = 0;
        for (StudentWarningResult r : validStudents) {
            count++;
            if (lastGpa == null || r.getGpa().compareTo(lastGpa) != 0) {
                rank = count;
                lastGpa = r.getGpa();
            }
            r.setRank(rank);
        }

        for (StudentWarningResult r : results) {
            if (r.getGpa() == null) {
                r.setRank(null);
            }
        }

        Collections.sort(results, new Comparator<StudentWarningResult>() {
            @Override
            public int compare(StudentWarningResult a, StudentWarningResult b) {
                if (a.getRank() == null && b.getRank() == null) return 0;
                if (a.getRank() == null) return 1;
                if (b.getRank() == null) return -1;
                return a.getRank().compareTo(b.getRank());
            }
        });

        return results;
    }

    public static List<Integer> getGpaDistribution(List<StudentWarningResult> results) {
        List<Integer> dist = new ArrayList<>(List.of(0, 0, 0, 0, 0));
        for (StudentWarningResult r : results) {
            if (r.getGpa() == null) continue;
            BigDecimal gpa = r.getGpa();
            int idx;
            if (gpa.compareTo(new BigDecimal("3.5")) >= 0) idx = 0;
            else if (gpa.compareTo(new BigDecimal("3.0")) >= 0) idx = 1;
            else if (gpa.compareTo(new BigDecimal("2.0")) >= 0) idx = 2;
            else if (gpa.compareTo(new BigDecimal("1.0")) >= 0) idx = 3;
            else idx = 4;
            dist.set(idx, dist.get(idx) + 1);
        }
        return dist;
    }

    public static class CourseScore {
        private Integer courseId;
        private String courseName;
        private BigDecimal credit;
        private BigDecimal score;
        private Date examTime;
        private String term;
        private boolean isRetake;

        public CourseScore() {}

        public CourseScore(Integer courseId, String courseName, BigDecimal credit, BigDecimal score, Date examTime, String term, boolean isRetake) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.credit = credit;
            this.score = score;
            this.examTime = examTime;
            this.term = term;
            this.isRetake = isRetake;
        }

        public Integer getCourseId() { return courseId; }
        public void setCourseId(Integer courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public BigDecimal getCredit() { return credit; }
        public void setCredit(BigDecimal credit) { this.credit = credit; }
        public BigDecimal getScore() { return score; }
        public void setScore(BigDecimal score) { this.score = score; }
        public Date getExamTime() { return examTime; }
        public void setExamTime(Date examTime) { this.examTime = examTime; }
        public String getTerm() { return term; }
        public void setTerm(String term) { this.term = term; }
        public boolean isRetake() { return isRetake; }
        public void setRetake(boolean retake) { isRetake = retake; }
    }

    public static class StudentAcademicData {
        private Integer studentId;
        private String studentNo;
        private String studentName;
        private List<CourseScore> courseScores;

        public StudentAcademicData() {}

        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        public String getStudentNo() { return studentNo; }
        public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public List<CourseScore> getCourseScores() { return courseScores; }
        public void setCourseScores(List<CourseScore> courseScores) { this.courseScores = courseScores; }
    }

    public static class StudentWarningResult {
        private Integer rank;
        private Integer studentId;
        private String studentNo;
        private String studentName;
        private BigDecimal gpa;
        private boolean isWarning;
        private List<CourseScore> courseScores;

        public StudentWarningResult() {}

        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }
        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        public String getStudentNo() { return studentNo; }
        public void setStudentNo(String studentNo) { this.studentNo = studentNo; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public BigDecimal getGpa() { return gpa; }
        public void setGpa(BigDecimal gpa) { this.gpa = gpa; }
        public boolean isWarning() { return isWarning; }
        public void setWarning(boolean warning) { isWarning = warning; }
        public List<CourseScore> getCourseScores() { return courseScores; }
        public void setCourseScores(List<CourseScore> courseScores) { this.courseScores = courseScores; }
    }
}
