'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
// import { TextStreamChatTransport } from 'ai';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat', // 默认就是 /api/chat 
    }),
    // 可选：自定义错误处理
    onError: (error) => {console.error('Chat error111:', error);
      if(error instanceof Error && (error as any).response) {
        (error as any).response.text().then(console.error);
      }
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  //多条信息后 发送新的自动滚到底部，
  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const onSubmit = (e: React.FormEvent)=> {
    // console.log('表单提交',e);
    e.preventDefault();
    if(!input?.trim()) return;
    sendMessage(
      {content: input}
    );
    setInput(''); //需要手动清空
  }

  const getMessageContent = (message: any) => {
    if (message.parts) {
      // 将所有 parts 合并成一个字符串（按顺序拼接文本）
      const fullText = message.parts
       .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
      // 如果还有工具调用等信息，可以单独显示在富文本之外
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
          <div className="prose prose-sm maz-w-none break-words dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {fullText}
            </ReactMarkdown>
          </div>
          {toolCalls && <div className="text-xs text-gray-500 mt-1">{toolCalls}</div>}
          {toolResults && <div className="text-gray-500 text-xs mt-1">{toolResults}</div>}
        </div>
      );
    }
    // 兼容没有 parts 的情况
    return (
      <div className="prose prose-sm max-w-none break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {message.content || ''}
        </ReactMarkdown>
      </div>);
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="flex flex-col w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">🤖 AI 智能助手</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            支持【制作手工香皂】知识库问答 · 联网搜索【xx网页的内容并总结】 · 天气查询 · 【调研并生成】报告生成
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-4">
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

        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={onSubmit} className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息... (支持 Markdown 渲染)"
              className="flex-1 rounded-full border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </form>
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
    </div>
  );
}