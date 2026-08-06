export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-20">
        <div className="w-24 h-24 rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-5xl mb-6 shadow-sm">⚙️</div>
        <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">系统设置即将上线</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md leading-relaxed">
          这里将支持用户信息编辑、API Key 管理、用量配额展示、系统通知等功能
        </p>
      </div>
    </div>
  );
}
