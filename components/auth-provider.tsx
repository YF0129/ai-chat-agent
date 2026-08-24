'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getToken, getUser, setToken, setUser, clearToken, clearUser, apiFetch, type AuthUser } from '@/lib/auth';

interface AuthValue {
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({ user: null, login: () => {}, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUserState(getUser());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (pathname === '/login') return; // 登录页不做重定向
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    // 校验 token 有效性；失效时 apiFetch 内部会登出并跳回登录页
    apiFetch('/auth/me').catch(() => {});
  }, [mounted, pathname]);

  // 防闪烁：未挂载时不渲染；无 token 且非登录页时不渲染（等重定向）
  if (!mounted) return null;
  if (pathname !== '/login' && !getToken()) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login: (token, u) => {
          setToken(token);
          setUser(u);
          setUserState(u);
        },
        logout: () => {
          clearToken();
          clearUser();
          setUserState(null);
          window.location.href = '/login';
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
