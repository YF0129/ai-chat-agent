'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'ka_token';
const USER_KEY = 'ka_user';

export interface AuthUser {
  id: number;
  phone: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function logout() {
  clearToken();
  clearUser();
  window.location.href = '/login';
}

export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** 带认证头的 fetch：自动注入 token，401 时清登录态并跳登录页。不设 Content-Type（FormData 需浏览器自设 boundary） */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const t = getToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) logout();
  return res;
}

/** 带认证头的下载：普通 <a href> 带不了 Authorization，改用 fetch + Blob 触发下载 */
export async function downloadFile(path: string, filename: string) {
  const res = await apiFetch(path);
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
