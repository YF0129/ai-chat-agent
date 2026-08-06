'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function ChatPage() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chat`,
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleClearHistory = async () => {
    if (!confirm('确定清空所有对话历史？')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, { method: 'DELETE' });
    if (res.ok) window.location.reload();
  };

  const getMessageContent = (message: any) => {
    if (message.parts) {
      const fullText = message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
      const toolCalls = message.parts
        .filter((part: any) => part.type === 'tool-call')
        .map((part: any) => `🔧 调用工具: ${part.toolName}`)
        .join(' ');
      const toolResults = message.parts
        .filter((part: any) => part.type === 'tool-result')
        .map(() => `✅ 工具返回结果`)
        .join(' ');

      return (
        <div>
          <div className="prose prose-sm max-w-none break-words dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {fullText}
            </ReactMarkdown>
          </div>
          {toolCalls && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{toolCalls}</div>}
          {toolResults && <div className="text-slate-400 dark:text-slate-500 text-xs mt-1">{toolResults}</div>}
        </div>
      );
    }
    return (
      <div className="prose prose-sm max-w-none break-words dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {message.content || ''}
        </ReactMarkdown>
      </div>
    );
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 && (
        <div className="absolute top-3 right-5 z-10">
          <button
            onClick={handleClearHistory}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors px-2.5 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            清空对话
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-20 animate-fade-in">
              <div className="relative mb-8">
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-5 w-28 h-28 rounded-full border border-indigo-300/25 dark:border-indigo-500/15 animate-spin" style={{ animationDuration: '8s' }} />
                <div className="absolute -inset-8 w-32 h-32 rounded-full border border-indigo-200/15 dark:border-indigo-400/10 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                <div className="absolute -inset-5 w-28 h-28 animate-spin" style={{ animationDuration: '6s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 shadow-sm shadow-indigo-400" />
                </div>
                <div className="absolute -inset-7 w-32 h-32 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
                  <div className="absolute bottom-2 right-5 w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500 shadow-sm shadow-violet-400" />
                </div>
                <div className="absolute -inset-4 w-28 h-28 animate-spin" style={{ animationDuration: '7s' }}>
                  <div className="absolute top-4 right-1 w-1.5 h-1.5 rounded-full bg-indigo-300/60 dark:bg-indigo-400/40" />
                </div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-300/30 dark:shadow-indigo-500/20 z-10">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              </div>

              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">欢迎使用 Knowledge AI</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md leading-relaxed mb-8">
                试试说：帮我调研手工皂市场前景，生成报告并发到邮箱
              </p>

              <div className="flex flex-wrap gap-2.5 justify-center">
                {['帮我调研新能源汽车市场', '总结知识库中的要点', '写一份竞品分析报告'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-sm text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-full px-4 py-2 hover:border-indigo-300/50 dark:hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 hover:shadow-sm transition-all active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {message.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium shrink-0 mr-3 mt-0.5 shadow-sm">AI</div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200/40 dark:shadow-indigo-500/20'
                    : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 shadow-sm'
                }`}
              >
                {getMessageContent(message)}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-medium shrink-0 ml-3 mt-0.5">U</div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5 shadow-sm">AI</div>
              <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-sm text-slate-400 dark:text-slate-500 ml-1.5">AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-2">
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
          <div
            className="flex items-center gap-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 px-2 py-1.5 shadow-md shadow-slate-200/30 dark:shadow-black/20"
            style={{
              background: 'var(--glass-input)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入调研主题或问题..."
              className="flex-1 bg-transparent border-none px-3 py-2.5 focus:outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl px-4 py-2.5 font-medium shadow-sm shadow-indigo-200/40 dark:shadow-indigo-500/20 hover:shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
