import React, { useEffect, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { studentApi } from '../api';

const COLORS = ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await studentApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center animate-pulse text-slate-400">正在分析数据...</div>;

  const cards = [
    { title: '总学生数', value: stats?.total || 0, icon: Users, color: 'bg-blue-500', trend: '实时' },
    { title: '活跃课程', value: stats?.activeCourses || 0, icon: BookOpen, color: 'bg-emerald-500', trend: '实时' },
    { title: '平均分', value: stats?.averageScore || '0.0', icon: TrendingUp, color: 'bg-orange-500', trend: '实时' },
    { title: '开班数量', value: stats?.activeClasses || 0, icon: GraduationCap, color: 'bg-rose-500', trend: '实时' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">控制面板</h1>
        <p className="text-slate-500 mt-2">欢迎回来，这是您的实时数据概览</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={`p-4 ${card.color} rounded-2xl shadow-lg shadow-current/20`}>
                <card.icon className="text-white w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{card.trend}</span>
            </div>
            <div className="mt-6">
              <p className="text-slate-500 text-sm font-medium">{card.title}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-8 border-l-4 border-blue-500 pl-4">班级人数分布</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.classData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-8 border-l-4 border-rose-500 pl-4">性别构成分析</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.genderData || []}
                  innerRadius={100}
                  outerRadius={130}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats?.genderData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {stats?.genderData?.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-slate-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
