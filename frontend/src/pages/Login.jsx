import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login({ username, password });
      if (data.success) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      setError('网络连接失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-5xl h-[600px] flex rounded-3xl overflow-hidden shadow-2xl bg-white m-4">
        
        {/* Left Side: Branding/Image */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-12 text-white relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
              <LogIn className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EDU SMART</h1>
          </div>
          
          <div className="relative z-10 mb-8">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              开启智能化的 <br />
              <span className="text-blue-200">教务管理</span> 新体验
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              整合全方位数据，提供定制化角色视图，让管理更高效，让校园更智能。
            </p>
          </div>
          
          <div className="relative z-10 text-sm text-blue-200/80">
            &copy; 2026 EDU SMART Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center md:text-left mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">欢迎回来</h2>
              <p className="text-slate-500">请输入您的账号密码进行登录</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">用户名</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="请输入用户名"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">密码</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="请输入密码"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-shake">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200/50 text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即登录'}
              </button>
            </form>
            
         
          </div>
        </div>
      </div>
    </div>
  );
}
