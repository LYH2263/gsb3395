import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Filter,
  TrendingDown,
  Trophy,
  Users
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
import { clsx } from 'clsx';
import { classApi, warningApi } from '../api';

// Toast 组件（与 StudentList 风格一致）
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

const DIST_COLORS = ['#f43f5e', '#f59e0b', '#0ea5e9', '#10b981'];

export default function AcademicWarning() {
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState(''); // '' = 全部学期
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // 加载班级列表
  useEffect(() => {
    classApi
      .getAll()
      .then((res) => {
        setClasses(res.data || []);
        if (res.data && res.data.length > 0) {
          setClassId(String(res.data[0].id));
        }
      })
      .catch(() => showToast('班级加载失败', 'error'));
  }, [showToast]);

  // 切班 -> 重置学期 + 拉学期下拉
  useEffect(() => {
    if (!classId) return;
    setTerm('');
    warningApi
      .getTerms(classId)
      .then((res) => setTerms(res.data || []))
      .catch(() => setTerms([]));
  }, [classId]);

  // 拉榜单
  const fetchWarning = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await warningApi.getClassWarning(classId, term);
      setData(data);
    } catch (err) {
      showToast('数据加载失败', 'error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [classId, term, showToast]);

  useEffect(() => {
    fetchWarning();
  }, [fetchWarning]);

  const rows = data?.rows || [];
  const distribution = data?.distribution || [];
  const warningCount = data?.warningCount || 0;
  const total = data?.total || 0;
  const ranked = useMemo(() => rows.filter((r) => r.gpa != null).length, [rows]);

  // 收集本班所有课程列名（按 courseId 排序，含被舍弃的也合并）
  const courseColumns = useMemo(() => {
    const map = new Map();
    rows.forEach((r) =>
      (r.details || []).forEach((d) => {
        if (!map.has(d.courseId)) {
          map.set(d.courseId, {
            courseId: d.courseId,
            courseCode: d.courseCode,
            courseName: d.courseName,
            credit: d.credit
          });
        }
      })
    );
    return Array.from(map.values()).sort((a, b) => a.courseId - b.courseId);
  }, [rows]);

  const currentClassName =
    classes.find((c) => String(c.id) === String(classId))?.className || '';

  return (
    <div className="space-y-8 pb-12">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            学业预警
          </h1>
          <p className="text-slate-500 mt-2">
            按累计加权 GPA 排名并标注预警学生，可下钻到指定学期
          </p>
        </div>
      </header>

      {/* 顶部筛选 */}
      <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none min-w-[220px]"
          >
            {classes.length === 0 && <option value="">暂无班级</option>}
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setTerm('')}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              term === ''
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            全部学期
          </button>
          {terms.map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                term === t
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 统计概览卡 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
              <Users className="text-white w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-6">班级人数</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{total}</h3>
          <p className="text-xs text-slate-400 mt-1">{currentClassName}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
              <Trophy className="text-white w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-6">参与排名</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{ranked}</h3>
          <p className="text-xs text-slate-400 mt-1">至少有一门有效成绩</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-start justify-between">
            <div className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
              <TrendingDown className="text-white w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-6">预警人数</p>
          <h3 className="text-3xl font-bold text-rose-600 mt-1">{warningCount}</h3>
          <p className="text-xs text-slate-400 mt-1">GPA &lt; 2.0 或任一门 &lt; 60</p>
        </div>
      </div>

      {/* GPA 分布图 */}
      <div className="glass-card p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-slate-800 mb-8 border-l-4 border-blue-500 pl-4">
          GPA 分布
        </h3>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 榜单 */}
      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider w-20">
                  名次
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  学生
                </th>
                {courseColumns.map((c) => (
                  <th
                    key={c.courseId}
                    className="px-4 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center"
                  >
                    <div className="font-bold text-slate-700 normal-case">{c.courseName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {c.courseCode} · {c.credit} 学分
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
                  累计 GPA
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={courseColumns.length + 4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-slate-400 mt-4 font-medium">加载数据中...</p>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={courseColumns.length + 4}
                    className="px-8 py-20 text-center text-slate-400 font-medium"
                  >
                    暂无学生数据
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  // 把同一门课的多条明细按 courseId 归组
                  const detailMap = new Map();
                  (r.details || []).forEach((d) => {
                    if (!detailMap.has(d.courseId)) detailMap.set(d.courseId, []);
                    detailMap.get(d.courseId).push(d);
                  });
                  return (
                    <tr
                      key={r.studentId}
                      className={clsx(
                        'hover:bg-slate-50/50 transition-colors',
                        r.warning && 'bg-rose-50/40'
                      )}
                    >
                      <td className="px-6 py-5">
                        {r.rank == null ? (
                          <span className="text-slate-300 font-mono">—</span>
                        ) : r.rank <= 3 ? (
                          <span
                            className={clsx(
                              'inline-flex items-center justify-center w-9 h-9 rounded-xl font-bold text-white shadow-md',
                              r.rank === 1 && 'bg-amber-500 shadow-amber-200',
                              r.rank === 2 && 'bg-slate-400 shadow-slate-200',
                              r.rank === 3 && 'bg-orange-400 shadow-orange-200'
                            )}
                          >
                            {r.rank}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">#{r.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100 shadow-sm">
                            {r.studentName?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{r.studentName}</div>
                            <div className="text-xs text-slate-400 font-mono">
                              #{r.studentNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      {courseColumns.map((col) => {
                        const list = detailMap.get(col.courseId) || [];
                        if (list.length === 0) {
                          return (
                            <td
                              key={col.courseId}
                              className="px-4 py-5 text-center text-slate-300 font-mono"
                            >
                              —
                            </td>
                          );
                        }
                        return (
                          <td key={col.courseId} className="px-4 py-5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {list.map((d, i) => {
                                const display =
                                  d.score == null ? '—' : Number(d.score).toFixed(1);
                                const fail = d.score != null && Number(d.score) < 60;
                                return (
                                  <span
                                    key={i}
                                    className={clsx(
                                      'font-mono font-semibold tabular-nums',
                                      d.superseded
                                        ? 'text-slate-300 line-through text-xs'
                                        : fail
                                        ? 'text-rose-600'
                                        : 'text-slate-700'
                                    )}
                                    title={d.superseded ? '重修已被舍弃' : ''}
                                  >
                                    {display}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-5 text-center">
                        {r.gpa == null ? (
                          <span className="text-slate-300 font-mono text-lg">—</span>
                        ) : (
                          <span
                            className={clsx(
                              'font-bold text-lg tabular-nums',
                              r.warning ? 'text-rose-600' : 'text-slate-800'
                            )}
                          >
                            {Number(r.gpa).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {r.warning ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            预警
                          </span>
                        ) : r.gpa == null ? (
                          <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                            无成绩
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            正常
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
