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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [reports, setReports] = useState<{filename: string, size: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<{filename: string, size: number}[]>([]);

  const loadKnowledgeFiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge`);
      const data = await res.json();
      setKnowledgeFiles(data.files || []);
    } catch (e) {
      console.error('加载知识库列表失败', e);
    }
  };
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chat`,
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: () => {
      loadReports(); // 当对话完成时，刷新报告列表
    }
  });

  useEffect(() => {
    loadReports();
    loadKnowledgeFiles();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载报告列表
  const loadReports = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error('加载报告列表失败', e);
    }
  };

  useEffect(() => {
    loadReports();
  }, [messages]);

  // 上传 PDF
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadMsg('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload_file`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadMsg(`✅ ${data.message}`);
      loadKnowledgeFiles(); // 上传成功后刷新知识库文件列表
    } catch (err) {
      setUploadMsg('❌ 上传失败，请重试');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;
    sendMessage({ text: input });
    setInput('');
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
          {toolCalls && <div className="text-xs text-gray-500 mt-1">{toolCalls}</div>}
          {toolResults && <div className="text-gray-500 text-xs mt-1">{toolResults}</div>}
        </div>
      );
    }
    return (
      <div className="prose prose-sm max-w-none break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {message.content || ''}
        </ReactMarkdown>
      </div>
    );
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      
      {/* ========== 左侧边栏 ========== */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">工具箱</h2>
        </div>
        
        {/* 上传 PDF */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📁 上传知识库</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full text-sm border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            {uploading ? '⏳ 上传中...' : '📄 选择文件'}
          </button>
          {uploadMsg && (
            <p className={`text-xs mt-2 ${uploadMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {uploadMsg}
            </p>
          )}
        </div>

        {/* 知识库文件列表 */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📚 知识库文件</h3>
          {knowledgeFiles.length === 0 ? (
            <p className="text-xs text-gray-400">暂无文件</p>
          ) : (
            <ul className="space-y-1">
              {knowledgeFiles.map((f) => (
                <li key={f.filename} className="flex items-center justify-between group">
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/knowledge/${f.filename}`}
                    download
                    className="text-xs text-blue-500 hover:text-blue-700 truncate flex-1"
                  >
                    📄 {f.filename}
                  </a>
                  <button
                    onClick={async () => {
                      if (!confirm(`确定删除 ${f.filename}？`)) return;
                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/knowledge/${f.filename}`,
                          { method: 'DELETE' }
                        );
                        if (res.ok) {
                          loadKnowledgeFiles();
                        }
                      } catch (err) {
                        console.error('删除失败', err);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 报告列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 已生成报告</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-gray-400">暂无报告</p>
          ) : (
            <ul className="space-y-1">
              {reports.map((r) => (
                <li key={r.filename}>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/reports/${r.filename}`}
                    download
                    className="text-xs text-blue-500 hover:text-blue-700 truncate block"
                  >
                    📄 {r.filename}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            支持格式：.md 报告下载
          </p>
          <button
            onClick={async () => {
              if (!confirm('确定清空所有对话历史？清空后请手动刷新页面开始新对话。')) return;
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, { method: 'DELETE' });
              alert('已清空，请刷新页面开始新对话');
            }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            🗑 清空对话
          </button>
        </div>
      </div>

      {/* ========== 右侧主区域 ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 顶部切换按钮 + Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">🤖 Multi-Agent 智能调研助手</h1>
            <p className="text-xs text-gray-500">知识库检索 · 联网搜索 · 数据分析 · 报告生成 · 邮件发送</p>
          </div>
        </header>

        {/* 聊天消息区 */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-4xl mb-4">🤖</p>
                <p className="text-lg font-medium">欢迎使用 Multi-Agent 智能调研助手</p>
                <p className="text-sm mt-2">
                  试试说：帮我调研手工皂市场前景，生成报告并发到邮箱
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {getMessageContent(message)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-sm text-gray-500 ml-1">AI 正在思考...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 底部输入框 */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入调研主题或问题，支持知识库问答、报告生成、邮件发送..."
              className="flex-1 rounded-full border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              发送
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}