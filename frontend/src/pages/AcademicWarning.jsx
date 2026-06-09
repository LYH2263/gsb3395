import React, { useEffect, useState, useCallback } from 'react';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Users,
  Award,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { classApi, warningApi } from '../api';
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
  const [selectedTerm, setSelectedTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    classApi.getAll().then(res => {
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0].id.toString());
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params = { classId: selectedClass };
      if (selectedTerm) {
        params.term = selectedTerm;
      }
      const { data } = await warningApi.getRanking(params);
      if (data.success) {
        setData(data);
        setTerms(data.terms || []);
      } else {
        setToast({ message: data.message || '加载失败', type: 'error' });
      }
    } catch (err) {
      setToast({ message: '网络请求异常', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setSelectedTerm('');
  }, [selectedClass]);

  const chartData = [
    { name: '3.5-4.0', value: data?.distribution?.[0] || 0, color: '#10b981' },
    { name: '3.0-3.5', value: data?.distribution?.[1] || 0, color: '#3b82f6' },
    { name: '2.0-3.0', value: data?.distribution?.[2] || 0, color: '#6366f1' },
    { name: '1.0-2.0', value: data?.distribution?.[3] || 0, color: '#f59e0b' },
    { name: '<1.0', value: data?.distribution?.[4] || 0, color: '#ef4444' },
  ];

  const getRankBadge = (rank) => {
    if (!rank) return null;
    if (rank === 1) return <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold flex items-center justify-center shadow-lg shadow-amber-200">🥇</div>;
    if (rank === 2) return <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 text-white font-bold flex items-center justify-center shadow-lg shadow-slate-200">🥈</div>;
    if (rank === 3) return <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold flex items-center justify-center shadow-lg shadow-orange-200">🥉</div>;
    return <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center">{rank}</div>;
  };

  const getScoreColor = (score, isRetake, isCounted) => {
    if (!isCounted || isRetake || score === null || score === undefined) return 'text-slate-300';
    if (score < 60) return 'text-rose-600 font-bold';
    if (score < 70) return 'text-amber-600 font-semibold';
    if (score < 80) return 'text-blue-600 font-medium';
    return 'text-emerald-600 font-semibold';
  };

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            学业预警
          </h1>
          <p className="text-slate-500 mt-2">按累计加权GPA排名，自动识别学业风险学生</p>
        </div>
      </header>

      <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none min-w-[200px] font-medium"
          >
            <option value="">请选择班级</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
        </div>

        <div className="relative">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none min-w-[160px] font-medium"
          >
            <option value="">全部学期</option>
            {terms.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl p-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
          <p className="text-slate-400 mt-4 font-medium">加载数据中...</p>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">班级总人数</p>
                <p className="text-3xl font-extrabold text-slate-800">{data.stats?.totalStudents || 0}</p>
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Award className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">有效GPA人数</p>
                <p className="text-3xl font-extrabold text-slate-800">{data.stats?.validGpaCount || 0}</p>
              </div>
            </div>
            <div className="glass-card rounded-3xl p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">预警学生数</p>
                <p className="text-3xl font-extrabold text-rose-600">{data.stats?.warningCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                GPA 分布
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4">GPA 计算规则</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="font-semibold text-slate-700 mb-2">绩点换算（4.0制）</p>
                  <div className="space-y-1 text-slate-500">
                    <p>90分及以上 → 4.0</p>
                    <p>80-89分 → 3.0</p>
                    <p>70-79分 → 2.0</p>
                    <p>60-69分 → 1.0</p>
                    <p>60分以下 → 0.0</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="font-semibold text-slate-700 mb-2">预警触发条件</p>
                  <div className="space-y-1 text-slate-500">
                    <p>• 累计加权GPA {'<'} 2.0</p>
                    <p>• 任一门最新成绩 {'<'} 60分</p>
                    <p>• 重修标记：同生同课取最新</p>
                    <p>• 成绩null不计入、不预警</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center w-20">名次</th>
                    <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">学生</th>
                    {data.courses?.map(course => (
                      <th key={course.id} className="px-4 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
                        <div>{course.courseName}</div>
                        <div className="text-xs font-normal text-slate-400">({course.credit}学分)</div>
                      </th>
                    ))}
                    <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">累计GPA</th>
                    <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">预警状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.ranking?.map((student) => (
                    <tr key={student.studentId} className={clsx(
                      "transition-colors",
                      student.warning ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-slate-50/50"
                    )}>
                      <td className="px-6 py-5 text-center">
                        {getRankBadge(student.rank)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-11 h-11 rounded-2xl flex items-center justify-center font-bold border shadow-sm",
                            student.warning 
                              ? "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 border-rose-200" 
                              : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border-blue-100"
                          )}>
                            {student.studentName?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{student.studentName}</div>
                            <div className="text-sm text-slate-400 font-medium">#{student.studentNo}</div>
                          </div>
                        </div>
                      </td>
                      {data.courses?.map(course => {
                        const courseEntries = student.courseScores?.filter(cs => cs.courseId === course.id) || [];
                        const counted = courseEntries.find(cs => !cs.isRetake);
                        return (
                          <td key={course.id} className="px-4 py-5 text-center">
                            <div className="space-y-1">
                              {counted && (
                                <div className={clsx("text-base", getScoreColor(counted.score, false, true))}>
                                  {counted.score !== null ? Number(counted.score).toFixed(1) : '—'}
                                </div>
                              )}
                              {courseEntries.filter(cs => cs.isRetake).map((retake, idx) => (
                                <div key={idx} className="text-xs text-slate-300 line-through" title={`重修于 ${retake.examTime || ''}`}>
                                  {retake.score !== null ? Number(retake.score).toFixed(1) : ''}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-5 text-center">
                        <span className={clsx(
                          "text-xl font-extrabold",
                          student.gpa === null ? "text-slate-300" :
                          student.gpa < 2.0 ? "text-rose-600" :
                          student.gpa < 3.0 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {student.gpa !== null ? Number(student.gpa).toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {student.warning ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            预警
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
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
        </>
      ) : (
        <div className="glass-card rounded-3xl p-20 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">请先选择班级查看数据</p>
        </div>
      )}
    </div>
  );
}
