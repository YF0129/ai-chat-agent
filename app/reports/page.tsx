'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { apiFetch, downloadFile } from '@/lib/auth';

interface Report { filename: string; size: number; }
function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(f: string) { const m = f.match(/(\d{4}-\d{2}-\d{2})/); return m ? m[1] : '—'; }

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) { console.error('加载失败', e); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadReports(); }, []);

  const handlePreview = async (filename: string) => {
    if (previewFilename === filename) { setPreview(null); setPreviewFilename(null); return; }
    try {
      const res = await apiFetch(`/reports/${encodeURIComponent(filename)}`);
      setPreview(await res.text());
      setPreviewFilename(filename);
    } catch (e) { console.error('加载失败', e); }
  };

  return (
    <div className="h-full flex animate-fade-in">
      <div className="w-72 xl:w-80 border-r border-slate-200/40 dark:border-slate-700/40 overflow-y-auto p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">{reports.length} 份报告</p>
          <button onClick={loadReports} disabled={loading} className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
        {loading ? (
          <div className="text-center text-slate-400 text-sm py-12">加载中...</div>
        ) : reports.length === 0 ? (
          <div className="text-center mt-16">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">暂无报告</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">在 AI 对话中请求生成报告</p>
          </div>
        ) : (
          <div className="space-y-1">
            {reports.map((r) => (
              <div key={r.filename} onClick={() => handlePreview(r.filename)}
                className={`group rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                  previewFilename === r.filename
                    ? 'bg-white/80 dark:bg-slate-700/60 border border-indigo-200/50 dark:border-indigo-500/30 shadow-sm'
                    : 'hover:bg-white/50 dark:hover:bg-slate-700/40 border border-transparent'
                }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.filename}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatSize(r.size)} · {formatDate(r.filename)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handlePreview(r.filename); }} className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                    {previewFilename === r.filename ? '收起' : '预览'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); downloadFile(`/reports/${encodeURIComponent(r.filename)}`, r.filename); }} className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500">下载</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {preview ? (
          <div className="max-w-3xl animate-fade-in">
            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-8">
              <div className="prose prose-sm max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {preview}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">选择一份报告以预览</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">点击左侧报告列表查看内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
