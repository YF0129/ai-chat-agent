'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';

const pageTitles: Record<string, string> = {
  '/': 'AI 对话',
  '/knowledge': '知识库管理',
  '/dashboard': '数据中心',
  '/reports': '报告中心',
  '/settings': '系统设置',
};

export default function TopBar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  if (pathname === '/login') return null;
  const title = pageTitles[pathname] || 'Knowledge AI';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 h-12 flex items-center justify-between px-5 border-b border-slate-200/30 dark:border-slate-700/30"
      style={{
        background: 'var(--glass-topbar)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200/40 dark:shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">Knowledge AI</span>
      </Link>

      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300 dark:bg-emerald-500 dark:shadow-emerald-500/30" />
          在线
        </span>
        {user && (
          <span className="hidden md:flex items-center text-xs text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200/40 dark:border-slate-700/50">
            {user.phone}
          </span>
        )}
        <button
          onClick={toggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? '切换亮色模式' : '切换暗黑模式'}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button
          onClick={logout}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="退出登录"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
