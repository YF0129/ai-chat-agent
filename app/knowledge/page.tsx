'use client';

import { useState, useRef, useEffect } from 'react';

interface KnowledgeFile { filename: string; size: number; }

const ACCEPT = '.pdf,.docx,.xlsx,.xls,.csv,.txt,.md';
const TYPE_ICONS: Record<string, string> = {
  pdf: '📕', docx: '📘', doc: '📘', xlsx: '📊', xls: '📊',
  csv: '📑', txt: '📄', md: '📝',
};

function getFileIcon(f: string) { const ext = f.split('.').pop()?.toLowerCase() || ''; return TYPE_ICONS[ext] || '📎'; }
function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) { console.error('加载失败', e); }
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg('');
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload_file`, { method: 'POST', body: fd });
      const data = await res.json();
      setUploadMsg(`✅ ${data.message}`);
      loadFiles();
    } catch { setUploadMsg('❌ 上传失败，请重试'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定删除 ${filename}？`)) return;
    setDeleting(filename);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/${filename}`, { method: 'DELETE' });
      if (res.ok) { loadFiles(); window.location.reload(); }
    } catch (e) { console.error('删除失败', e); }
    finally { setDeleting(null); }
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-400 dark:text-slate-500">支持 PDF / Word / Excel / CSV / TXT / Markdown</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm font-medium bg-indigo-500 text-white rounded-xl px-4 py-2.5 hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200/40 dark:shadow-indigo-500/20 active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            {uploading ? '上传中...' : '上传文件'}
          </button>
          <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleUpload} className="hidden" />
        </div>

        {uploadMsg && (
          <div className={`mb-4 text-sm px-4 py-3 rounded-xl ${
            uploadMsg.startsWith('✅') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
          }`}>{uploadMsg}</div>
        )}

        {files.length === 0 && !uploading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-4xl mb-4 shadow-sm">📂</div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-1">知识库为空</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">点击右上角「上传文件」按钮添加文档</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {files.map((file) => (
              <div key={file.filename} className="group bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 hover:shadow-md hover:border-slate-300/60 dark:hover:border-slate-600/60 hover:bg-white/80 dark:hover:bg-slate-700/60 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{getFileIcon(file.filename)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={file.filename}>{file.filename}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100/70 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/knowledge/${file.filename}`} download className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">下载</a>
                  <button onClick={() => handleDelete(file.filename)} disabled={deleting === file.filename} className="text-xs text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                    {deleting === file.filename ? '删除中...' : '删除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
