package com.student.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class GpaCalculator {

    private static final BigDecimal WARNING_GPA_THRESHOLD = new BigDecimal("2.0");
    private static final BigDecimal FAIL_SCORE = new BigDecimal("60");

    private GpaCalculator() {}

    public static double scoreToGradePoint(BigDecimal score) {
        if (score == null) {
            return -1;
        }
        double s = score.doubleValue();
        if (s >= 90) return 4.0;
        if (s >= 80) return 3.0;
        if (s >= 70) return 2.0;
        if (s >= 60) return 1.0;
        return 0.0;
    }

    public static BigDecimal calculateGpa(List<ScoreCredit> entries) {
        double totalWeighted = 0.0;
        int totalCredit = 0;
        for (ScoreCredit entry : entries) {
            if (entry.getScore() == null) continue;
            double gp = scoreToGradePoint(entry.getScore());
            totalWeighted += gp * entry.getCredit();
            totalCredit += entry.getCredit();
        }
        if (totalCredit == 0) return null;
        double gpa = totalWeighted / totalCredit;
        return BigDecimal.valueOf(gpa).setScale(2, RoundingMode.HALF_UP);
    }

    public static boolean isWarning(BigDecimal gpa, List<BigDecimal> latestScores) {
        if (gpa != null && gpa.compareTo(WARNING_GPA_THRESHOLD) < 0) return true;
        if (latestScores != null) {
            for (BigDecimal score : latestScores) {
                if (score != null && score.compareTo(FAIL_SCORE) < 0) return true;
            }
        }
        return false;
    }

    public static int compareGpa(BigDecimal gpa1, BigDecimal gpa2) {
        if (gpa1 == null && gpa2 == null) return 0;
        if (gpa1 == null) return 1;
        if (gpa2 == null) return -1;
        return gpa2.compareTo(gpa1);
    }

    public static class ScoreCredit {
        private final BigDecimal score;
        private final int credit;

        public ScoreCredit(BigDecimal score, int credit) {
            this.score = score;
            this.credit = credit;
        }

        public BigDecimal getScore() { return score; }
        public int getCredit() { return credit; }
    }
}
