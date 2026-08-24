'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/auth';
import { useAuth } from '@/components/auth-provider';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !password) {
      setError('请填写手机号和密码');
      return;
    }
    setLoading(true);
    try {
      // 用原生 fetch：登录失败是预期场景，避免 apiFetch 的 401 自动登出逻辑
      const res = await fetch(`${API_URL}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || '请求失败，请稍后重试');
        return;
      }
      login(data.token, data.user);
      window.location.href = '/';
    } catch {
      setError('网络错误，请检查后端服务是否可用');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200/40 dark:border-slate-700/50 p-8 shadow-xl shadow-indigo-200/20 dark:shadow-black/30"
        style={{
          background: 'var(--glass-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/40 dark:shadow-indigo-500/20 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Knowledge AI</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {mode === 'login' ? '登录你的账号' : '注册新账号'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">手机号</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入 11 位手机号"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-300/30 dark:shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? '请稍候…' : mode === 'login' ? '登 录' : '注 册'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          className="w-full text-center text-xs text-indigo-500 dark:text-indigo-400 mt-5 hover:underline"
        >
          {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </div>
    </div>
  );
}
