export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-20">
        <div className="w-24 h-24 rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-5xl mb-6 shadow-sm">📊</div>
        <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">数据中心即将上线</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md leading-relaxed mb-10">
          这里将展示总文档数、对话统计、Token 用量、热门问题等数据可视化面板
        </p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
          {[{ label: '总文档数', value: '—' }, { label: '总对话数', value: '—' }, { label: 'Token 用量', value: '—' }].map((s) => (
            <div key={s.label} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm">
              <p className="text-2xl font-bold text-slate-300 dark:text-slate-600">{s.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
