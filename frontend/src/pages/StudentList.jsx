import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { studentApi, classApi } from '../api';
import { clsx } from 'clsx';
import useAuthStore from '../store/useAuthStore';

// Modal Component
function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="glass-card w-full max-w-2xl rounded-3xl p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  );
}

// Toast Component
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

export default function StudentList() {
  const [list, setList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [toast, setToast] = useState(null);
  
  const { user } = useAuthStore();
  const isStudent = user?.role === 'STUDENT';

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await studentApi.getList({
        page,
        limit,
        name: debouncedSearch,
        classId: filterClass || undefined
      });
      setList(data.list);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterClass]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    classApi.getAll().then(res => setClasses(res.data));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchName);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchName]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterClass]);

  const handleEdit = (student) => {
    setEditingStudent({ ...student });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStudent({ studentNo: '', name: '', gender: '男', birthday: '', phone: '', email: '', classId: '' });
    setIsModalOpen(true);
  };

  const requestDelete = (id) => {
    setStudentToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsConfirmModalOpen(false);
    try {
      const { data } = await studentApi.delete(studentToDelete);
      if (data.success) {
        showToast('删除成功', 'success');
        fetchList();
      } else {
        showToast('删除失败', 'error');
      }
    } catch (err) {
      showToast('操作异常', 'error');
    } finally {
      setStudentToDelete(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const apiCall = editingStudent.id ? studentApi.update : studentApi.add;
      const { data } = await apiCall(editingStudent);
      if (data.success) {
        showToast(editingStudent.id ? '修改成功' : '添加成功', 'success');
        setIsModalOpen(false);
        fetchList();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('操作失败', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12">
       {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">学生管理</h1>
          <p className="text-slate-500 mt-2">管理校内学生档案及基本信息</p>
        </div>
        {!isStudent && (
          <button 
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 font-semibold w-fit"
          >
            <Plus className="w-5 h-5" />
            添加学生
          </button>
        )}
      </header>

      <div className="glass-card p-6 rounded-3xl flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="搜索姓名或学号..." 
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
          >
            <option value="">所有班级</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">学生信息</th>
                <th className="px-8 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">班级</th>
                <th className="px-8 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">性别</th>
                <th className="px-8 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">电话</th>
                <th className="px-8 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-slate-400 mt-4 font-medium">加载数据中...</p>
                  </td>
                </tr>
              ) : list.length > 0 ? list.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100 shadow-sm">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-sm text-slate-400 font-medium">#{student.studentNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                      {student.className}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      student.gender === '男' ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {student.gender}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-slate-500">{student.phone}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setDetailStudent(student); setIsDetailModalOpen(true); }} className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                      {!isStudent && (
                        <>
                          <button onClick={() => handleEdit(student)} className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => requestDelete(student.id)} className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium">暂无学生数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <p className="text-sm font-medium text-slate-500">
            显示第 {((page-1)*limit)+1} 到 {Math.min(page*limit, total)} 条，共 {total} 条记录
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(Math.ceil(total / limit))].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i + 1)}
                className={clsx(
                  "w-10 h-10 rounded-xl font-bold transition-all",
                  page === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "hover:bg-white text-slate-500"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Modal 
        title={editingStudent?.id ? "编辑学生信息" : "添加新学生"} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">学号</label>
            <input 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={editingStudent?.studentNo || ''} 
              onChange={e => setEditingStudent({...editingStudent, studentNo: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">姓名</label>
            <input 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={editingStudent?.name || ''} 
              onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">性别</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={editingStudent?.gender || '男'} 
              onChange={e => setEditingStudent({...editingStudent, gender: e.target.value})}
            >
              <option>男</option>
              <option>女</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">班级</label>
            <select 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={editingStudent?.classId || ''} 
              onChange={e => setEditingStudent({...editingStudent, classId: e.target.value})}
            >
              <option value="">请选择班级</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">电话</label>
            <input 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={editingStudent?.phone || ''} 
              onChange={e => setEditingStudent({...editingStudent, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">邮箱</label>
            <input 
              type="email"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={editingStudent?.email || ''} 
              onChange={e => setEditingStudent({...editingStudent, email: e.target.value})}
            />
          </div>
          <div className="col-span-2 pt-4 flex justify-end gap-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">取消</button>
             <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">确认保存</button>
          </div>
        </form>
      </Modal>

      <Modal title="学生档案详情" isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
         <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-3xl">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-500 shadow-sm border-4 border-white">
              {detailStudent?.name[0]}
            </div>
            <div>
               <h2 className="text-3xl font-bold text-slate-800">{detailStudent?.name}</h2>
               <p className="text-slate-500 font-medium">学号：{detailStudent?.studentNo}</p>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-y-6 gap-x-12 px-6">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">性别</p>
               <p className="text-lg font-semibold text-slate-700">{detailStudent?.gender}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">班级</p>
               <p className="text-lg font-semibold text-slate-700">{detailStudent?.className}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">电话</p>
               <p className="text-lg font-semibold text-slate-700">{detailStudent?.phone || '未填写'}</p>
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">出生日期</p>
               <p className="text-lg font-semibold text-slate-700">{detailStudent?.birthday || '未填写'}</p>
            </div>
            <div className="col-span-2">
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">电子邮箱</p>
               <p className="text-lg font-semibold text-slate-700">{detailStudent?.email || '未填写'}</p>
            </div>
         </div>
         <div className="mt-10 flex justify-end">
            <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-3 font-bold text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all">关闭</button>
         </div>
      </Modal>

      <Modal title="确认删除" isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="">
          <div className="flex items-center gap-4 text-rose-600 mb-6 bg-rose-50 p-5 rounded-2xl border border-rose-100">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <p className="font-medium text-rose-800 leading-relaxed">您确定要删除该学生档案吗？<br/><span className="text-sm opacity-80">此操作无法撤销，所有关联的成绩和记录将被永久擦除。</span></p>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-100 border border-transparent rounded-xl transition-all">取消操作</button>
            <button onClick={confirmDelete} className="px-8 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-300 transition-all active:scale-95">确认永久删除</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
