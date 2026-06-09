import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  Loader2,
  Filter,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { warningApi, classApi } from '../api';

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
  const [selectedTerm, setSelectedTerm] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    classApi.getAll().then(res => {
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    setSelectedTerm('');
  }, [selectedClass]);

  const fetchData = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params = { classId: selectedClass };
      if (selectedTerm) params.term = selectedTerm;
      const { data: res } = await warningApi.getList(params);
      setData(res);
    } catch (err) {
      showToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const courses = useMemo(() => {
    if (!data?.list) return [];
    const courseMap = new Map();
    data.list.forEach(student => {
      student.scores.forEach(s => {
        if (!courseMap.has(s.courseId)) {
          courseMap.set(s.courseId, { id: s.courseId, name: s.courseName, credit: s.credit });
        }
      });
    });
    return Array.from(courseMap.values());
  }, [data]);

  const scoreLookup = useMemo(() => {
    if (!data?.list) return {};
    const lookup = {};
    data.list.forEach(student => {
      lookup[student.studentId] = {};
      student.scores.forEach(s => {
        if (!lookup[student.studentId][s.courseId]) {
          lookup[student.studentId][s.courseId] = [];
        }
        lookup[student.studentId][s.courseId].push(s);
      });
    });
    return lookup;
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.list) return { total: 0, warning: 0, avgGpa: '\u2014' };
    const total = data.list.length;
    const warning = data.list.filter(s => s.isWarning).length;
    const gpaValues = data.list.filter(s => s.gpa !== null && s.gpa !== undefined).map(s => s.gpa);
    const avgGpa = gpaValues.length > 0
      ? (gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length).toFixed(2)
      : '\u2014';
    return { total, warning, avgGpa };
  }, [data]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const colCount = 3 + courses.length + 2;

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">学业预警</h1>
        <p className="text-slate-500 mt-2">按班级查看学生 GPA 排名与预警状态，支持按学期下钻</p>
      </header>

      <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')}
            className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
          >
            <option value="">选择班级</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
        </div>
        <div className="relative">
          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
          >
            <option value="">全部学期</option>
            {data?.terms?.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
              <Users className="text-white w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 text-sm font-medium">班级人数</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
              <AlertTriangle className="text-white w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 text-sm font-medium">预警人数</p>
            <h3 className="text-3xl font-bold text-rose-600 mt-1">{stats.warning}</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 text-sm font-medium">平均 GPA</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.avgGpa}</h3>
          </div>
        </div>
      </div>

      {data?.gpaDistribution && (
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-8 border-l-4 border-amber-500 pl-4">GPA 分布</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.gpaDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={60} name="人数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">名次</th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">学生</th>
                {courses.map(course => (
                  <th key={course.id} className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">
                    <div>{course.name}</div>
                    <div className="text-xs font-normal text-slate-400">{course.credit}学分</div>
                  </th>
                ))}
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">累计加权GPA</th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">预警</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-slate-400 mt-4 font-medium">加载数据中...</p>
                  </td>
                </tr>
              ) : !data?.list?.length ? (
                <tr>
                  <td colSpan={colCount} className="px-8 py-20 text-center text-slate-400 font-medium">
                    {selectedClass ? '暂无数据' : '请选择班级'}
                  </td>
                </tr>
              ) : data.list.map(student => (
                <tr key={student.studentId} className={`hover:bg-slate-50/50 transition-colors ${student.isWarning ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-6 py-5 font-bold text-slate-800 text-center">{student.rank}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${student.isWarning ? 'bg-rose-100 text-rose-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600'}`}>
                        {student.studentName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{student.studentName}</div>
                        <div className="text-xs text-slate-400">{student.studentNo}</div>
                      </div>
                    </div>
                  </td>
                  {courses.map(course => {
                    const scores = scoreLookup[student.studentId]?.[course.id] || [];
                    const latestScore = scores.find(s => !s.isRetake);
                    const retakeScores = scores.filter(s => s.isRetake);
                    return (
                      <td key={course.id} className="px-6 py-5 text-center">
                        {latestScore ? (
                          <div>
                            <span className={`font-semibold ${latestScore.score !== null && latestScore.score !== undefined ? (latestScore.score < 60 ? 'text-rose-600' : 'text-slate-800') : 'text-slate-300'}`}>
                              {latestScore.score !== null && latestScore.score !== undefined ? latestScore.score : '\u2014'}
                            </span>
                            {retakeScores.length > 0 && (
                              <div className="mt-1">
                                {retakeScores.map((rs, i) => (
                                  <div key={i} className="text-xs text-slate-300 line-through">
                                    {rs.score !== null && rs.score !== undefined ? rs.score : '\u2014'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">{'\u2014'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-5 text-center">
                    <span className={`text-lg font-bold ${student.gpa !== null && student.gpa !== undefined ? (student.gpa < 2.0 ? 'text-rose-600' : 'text-slate-800') : 'text-slate-300'}`}>
                      {student.gpaDisplay}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {student.isWarning ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        预警
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        正常
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
