import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  Users, 
  GraduationCap, 
  TrendingDown,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { warningApi, classApi } from '../api';
import { clsx } from 'clsx';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
  };

  return (
    <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right-10 flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100">
      {icons[type]}
      <span className="font-medium text-slate-700">{message}</span>
    </div>
  );
}

export default function AcademicWarning() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [warningData, setWarningData] = useState(null);
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    classApi.getAll().then(res => {
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0].id);
      }
    });

    warningApi.getTerms().then(res => {
      setTerms(res.data);
    });
  }, []);

  const fetchWarningData = useCallback(async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const termParam = selectedTerm === 'all' ? undefined : selectedTerm;
      const [warningRes, distRes] = await Promise.all([
        warningApi.getClassWarning(selectedClass, termParam),
        warningApi.getGpaDistribution(selectedClass, termParam)
      ]);
      setWarningData(warningRes.data);
      setDistributionData(distRes.data);
    } catch (err) {
      console.error(err);
      showToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm]);

  useEffect(() => {
    if (selectedClass) {
      fetchWarningData();
    }
  }, [selectedClass, selectedTerm, fetchWarningData]);

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-300';
    const num = Number(score);
    if (num >= 90) return 'text-emerald-600 font-bold';
    if (num >= 80) return 'text-blue-600 font-semibold';
    if (num >= 70) return 'text-amber-600';
    if (num >= 60) return 'text-orange-600';
    return 'text-rose-600 font-bold';
  };

  const getGpaColor = (gpa) => {
    if (gpa === null || gpa === undefined) return 'text-slate-400';
    const num = Number(gpa);
    if (num >= 3.5) return 'text-emerald-600';
    if (num >= 3.0) return 'text-blue-600';
    if (num >= 2.5) return 'text-amber-600';
    if (num >= 2.0) return 'text-orange-500';
    return 'text-rose-600';
  };

  const getBarColor = (range) => {
    if (range === '无成绩') return '#94a3b8';
    if (range.startsWith('3.5') || range.startsWith('3.0')) return '#10b981';
    if (range.startsWith('2.5')) return '#f59e0b';
    if (range.startsWith('2.0')) return '#f97316';
    return '#ef4444';
  };

  const courses = warningData?.courses || [];
  const students = warningData?.students || [];

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">学业预警</h1>
            <p className="text-slate-500 mt-1">班级成绩排名与学业风险监控</p>
          </div>
        </div>
      </header>

      <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="relative min-w-[240px]">
          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>

        <div className="relative min-w-[200px]">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">全部学期</option>
            {terms.map((term, i) => (
              <option key={i} value={term}>{term}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {warningData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-slate-500 text-sm font-medium">学生总数</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{students.length}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-rose-100 rounded-2xl">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-slate-500 text-sm font-medium">预警人数</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">{warningData.warningCount || 0}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-start justify-between">
              <div className="p-4 bg-amber-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-slate-500 text-sm font-medium">预警比例</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">
                {students.length > 0 ? ((warningData.warningCount || 0) / students.length * 100).toFixed(1) : 0}%
              </h3>
            </div>
          </div>
        </div>
      )}

      {warningData && (
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-8 border-l-4 border-rose-500 pl-4">GPA 分布</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 border-l-4 border-blue-500 pl-4">成绩排名榜单</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">名次</th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">学生</th>
                {courses.map(course => (
                  <th key={course.id} className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {course.courseName}
                    <span className="text-xs font-normal text-slate-400 ml-1">({course.credit}学分)</span>
                  </th>
                ))}
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">累计GPA</th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">预警状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={courses.length + 4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-slate-400 mt-4 font-medium">加载数据中...</p>
                  </td>
                </tr>
              ) : students.length > 0 ? students.map((student, idx) => (
                <tr 
                  key={student.studentId} 
                  className={clsx(
                    "hover:bg-slate-50/50 transition-colors",
                    student.warning && "bg-rose-50/30"
                  )}
                >
                  <td className="px-6 py-6">
                    <span className={clsx(
                      "inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm",
                      student.rank === 1 && "bg-amber-100 text-amber-700",
                      student.rank === 2 && "bg-slate-100 text-slate-600",
                      student.rank === 3 && "bg-orange-100 text-orange-700",
                      !student.rank && "bg-slate-50 text-slate-400",
                      student.rank > 3 && "bg-slate-50 text-slate-600"
                    )}>
                      {student.rank || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                        student.warning 
                          ? "bg-rose-100 text-rose-600 border border-rose-200" 
                          : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border border-blue-100"
                      )}>
                        {student.studentName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{student.studentName}</div>
                        <div className="text-xs text-slate-400 font-medium">#{student.studentNo}</div>
                      </div>
                    </div>
                  </td>
                  {courses.map(course => {
                    const scores = student.allScores?.filter(s => s.courseId === course.id) || [];
                    const latestScore = scores.find(s => !s.courseName?.includes('重修')) || scores[0];
                    
                    return (
                      <td key={course.id} className="px-6 py-6">
                        {scores.length > 0 ? (
                          <div className="space-y-1">
                            {scores.map((score, i) => (
                              <div 
                                key={score.id || i}
                                className={clsx(
                                  "text-sm",
                                  score.courseName?.includes('重修') ? "text-slate-400 line-through" : getScoreColor(score.score)
                                )}
                              >
                                {score.score !== null && score.score !== undefined 
                                  ? Number(score.score).toFixed(1) 
                                  : '—'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-6">
                    <span className={clsx(
                      "text-xl font-bold",
                      getGpaColor(student.gpa)
                    )}>
                      {student.gpa !== null && student.gpa !== undefined 
                        ? Number(student.gpa).toFixed(2) 
                        : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {student.warning ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        预警
                      </span>
                    ) : student.gpa ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        正常
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        无成绩
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={courses.length + 4} className="px-8 py-20 text-center text-slate-400 font-medium">
                    暂无学生数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          预警规则说明
        </h4>
        <ul className="space-y-2 text-sm text-slate-500 pl-6 list-disc">
          <li>累计加权 GPA 低于 2.0 触发预警</li>
          <li>任意一门最新成绩低于 60 分触发预警</li>
          <li>成绩为 null 不计算、不计学分、不触发预警</li>
          <li>重修课程仅取考试时间最晚的一条成绩计入 GPA</li>
          <li>GPA 采用 4.0 制：90+→4.0，80+→3.0，70+→2.0，60+→1.0，&lt;60→0</li>
        </ul>
      </div>
    </div>
  );
}
