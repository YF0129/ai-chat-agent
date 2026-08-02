'use client';
import { useState } from 'react';

const DIFY_URL = 'https://udify.app/chatbot/nQe64OJxutyISRdH';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 浮动按钮 — 仿 Dify 原生样式 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: '#1C64F2' }}
        title="AI 助手"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-96 h-[40rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden flex flex-col">
          <iframe
            src={DIFY_URL}
            style={{ width: '100%', height: '100%', minHeight: '700px' }}
            frameBorder="0"
            allow="microphone"
          />
        </div>
      )}
    </>
  );
}
