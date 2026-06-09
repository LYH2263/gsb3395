package com.student.service.impl;

import com.student.dto.CourseScoreDetail;
import com.student.dto.WarningRow;
import com.student.entity.Score;
import com.student.entity.Student;
import com.student.mapper.ScoreMapper;
import com.student.mapper.StudentMapper;
import com.student.service.WarningService;
import com.student.util.GpaCalculator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WarningServiceImpl implements WarningService {

    @Autowired
    private StudentMapper studentMapper;

    @Autowired
    private ScoreMapper scoreMapper;

    @Override
    public Map<String, Object> getClassWarning(Integer classId, String term) {
        String normalizedTerm = (term == null || term.trim().isEmpty()) ? null : term.trim();

        List<Student> students = studentMapper.findByClassId(classId);
        List<Score> scores = scoreMapper.findClassScoreDetails(classId, normalizedTerm);

        // group scores by studentId -> courseId -> list
        Map<Integer, Map<Integer, List<Score>>> byStudentCourse = new HashMap<>();
        for (Score sc : scores) {
            if (sc.getStudentId() == null || sc.getCourseId() == null) continue;
            byStudentCourse
                    .computeIfAbsent(sc.getStudentId(), k -> new LinkedHashMap<>())
                    .computeIfAbsent(sc.getCourseId(), k -> new ArrayList<>())
                    .add(sc);
        }

        List<WarningRow> rows = new ArrayList<>();
        for (Student stu : students) {
            WarningRow row = new WarningRow();
            row.setStudentId(stu.getId());
            row.setStudentNo(stu.getStudentNo());
            row.setStudentName(stu.getName());

            Map<Integer, List<Score>> courseMap = byStudentCourse.getOrDefault(stu.getId(), new LinkedHashMap<>());
            List<CourseScoreDetail> details = new ArrayList<>();
            List<GpaCalculator.Entry> validEntries = new ArrayList<>();

            for (Map.Entry<Integer, List<Score>> e : courseMap.entrySet()) {
                List<Score> list = e.getValue();
                // 重修取最新：exam_time 最晚为 latest，其余为 superseded
                list.sort(Comparator.comparing(Score::getExamTime,
                        Comparator.nullsFirst(Comparator.naturalOrder())).reversed());
                Score latest = list.get(0);
                details.add(toDetail(latest, false));
                for (int i = 1; i < list.size(); i++) {
                    details.add(toDetail(list.get(i), true));
                }
                if (latest.getScore() != null) {
                    validEntries.add(new GpaCalculator.Entry(latest.getScore(), latest.getCredit()));
                }
            }

            BigDecimal gpa = GpaCalculator.weightedGpa(validEntries);
            row.setGpa(gpa);
            row.setWarning(GpaCalculator.isWarning(gpa, validEntries));
            row.setDetails(details);
            rows.add(row);
        }

        // 排名：仅对 GPA 非 null 的学生排序；保留 2 位后比较；并列不跳号
        List<WarningRow> ranked = new ArrayList<>(rows);
        ranked.sort((a, b) -> {
            if (a.getGpa() == null && b.getGpa() == null) return 0;
            if (a.getGpa() == null) return 1;
            if (b.getGpa() == null) return -1;
            return b.getGpa().compareTo(a.getGpa());
        });

        BigDecimal prevGpa = null;
        int currentRank = 0;
        for (WarningRow row : ranked) {
            if (row.getGpa() == null) {
                row.setRank(null);
                continue;
            }
            if (prevGpa == null || row.getGpa().compareTo(prevGpa) != 0) {
                currentRank++;
                prevGpa = row.getGpa();
            }
            row.setRank(currentRank);
        }

        // GPA 分布（用于柱状图）
        List<Map<String, Object>> distribution = buildDistribution(ranked);

        Map<String, Object> result = new HashMap<>();
        result.put("rows", ranked);
        result.put("distribution", distribution);
        result.put("total", ranked.size());
        result.put("warningCount", ranked.stream().filter(WarningRow::isWarning).count());
        return result;
    }

    @Override
    public List<String> getTermsByClass(Integer classId) {
        return scoreMapper.findTermsByClass(classId);
    }

    private CourseScoreDetail toDetail(Score sc, boolean superseded) {
        return new CourseScoreDetail(
                sc.getCourseId(),
                sc.getCourseCode(),
                sc.getCourseName(),
                sc.getCredit(),
                sc.getScore(),
                superseded
        );
    }

    /** 4 个区间：[0,2.0) [2.0,3.0) [3.0,3.5) [3.5,4.0]。null GPA 学生不参与统计。 */
    private List<Map<String, Object>> buildDistribution(List<WarningRow> rows) {
        String[] labels = {"<2.0", "2.0–3.0", "3.0–3.5", "3.5–4.0"};
        int[] counts = new int[4];
        for (WarningRow r : rows) {
            BigDecimal g = r.getGpa();
            if (g == null) continue;
            double v = g.doubleValue();
            if (v < 2.0) counts[0]++;
            else if (v < 3.0) counts[1]++;
            else if (v < 3.5) counts[2]++;
            else counts[3]++;
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", labels[i]);
            m.put("value", counts[i]);
            list.add(m);
        }
        return list;
    }
}
