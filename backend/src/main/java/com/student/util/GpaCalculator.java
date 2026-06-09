package com.student.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * GPA 计算工具类（4.0 制）。
 *
 * 规则：
 *   90+  -> 4.0
 *   80+  -> 3.0
 *   70+  -> 2.0
 *   60+  -> 1.0
 *   <60  -> 0.0
 *
 * 加权 GPA = Σ(绩点×学分) / Σ学分。
 * score 为 null 不参与计算，也不计入学分。
 *
 * 该工具类不依赖任何框架/数据库，便于独立单元测试。
 */
public final class GpaCalculator {

    private static final BigDecimal P_4 = new BigDecimal("4.0");
    private static final BigDecimal P_3 = new BigDecimal("3.0");
    private static final BigDecimal P_2 = new BigDecimal("2.0");
    private static final BigDecimal P_1 = new BigDecimal("1.0");
    private static final BigDecimal P_0 = BigDecimal.ZERO;

    private static final BigDecimal WARNING_THRESHOLD = new BigDecimal("2.00");
    private static final BigDecimal FAIL_THRESHOLD = new BigDecimal("60");

    private GpaCalculator() {}

    /**
     * 单门课成绩 -> 绩点。
     *
     * @param score 成绩；为 null 时返回 null（不参与计算）
     */
    public static BigDecimal gradePoint(BigDecimal score) {
        if (score == null) return null;
        if (score.compareTo(BigDecimal.valueOf(90)) >= 0) return P_4;
        if (score.compareTo(BigDecimal.valueOf(80)) >= 0) return P_3;
        if (score.compareTo(BigDecimal.valueOf(70)) >= 0) return P_2;
        if (score.compareTo(BigDecimal.valueOf(60)) >= 0) return P_1;
        return P_0;
    }

    /**
     * 累计加权 GPA。空（无任何有效成绩）时返回 null。
     * 结果保留 2 位小数（HALF_UP）。
     */
    public static BigDecimal weightedGpa(List<Entry> entries) {
        if (entries == null || entries.isEmpty()) return null;
        BigDecimal totalPoints = BigDecimal.ZERO;
        int totalCredits = 0;
        boolean hasValid = false;
        for (Entry e : entries) {
            if (e == null || e.getScore() == null) continue;
            int credit = e.getCredit() == null ? 0 : e.getCredit();
            if (credit <= 0) continue;
            BigDecimal gp = gradePoint(e.getScore());
            totalPoints = totalPoints.add(gp.multiply(BigDecimal.valueOf(credit)));
            totalCredits += credit;
            hasValid = true;
        }
        if (!hasValid || totalCredits == 0) return null;
        return totalPoints.divide(BigDecimal.valueOf(totalCredits), 2, RoundingMode.HALF_UP);
    }

    /**
     * 是否触发预警：累计 GPA < 2.00，或任一有效成绩 < 60。
     * GPA 为 null（全部成绩为 null）时不预警。
     */
    public static boolean isWarning(BigDecimal gpa, List<Entry> entries) {
        if (gpa != null && gpa.compareTo(WARNING_THRESHOLD) < 0) return true;
        if (entries != null) {
            for (Entry e : entries) {
                if (e == null || e.getScore() == null) continue;
                if (e.getScore().compareTo(FAIL_THRESHOLD) < 0) return true;
            }
        }
        return false;
    }

    /** 计算入参：成绩 + 学分。 */
    public static final class Entry {
        private final BigDecimal score;
        private final Integer credit;

        public Entry(BigDecimal score, Integer credit) {
            this.score = score;
            this.credit = credit;
        }

        public BigDecimal getScore() { return score; }
        public Integer getCredit() { return credit; }
    }
}
