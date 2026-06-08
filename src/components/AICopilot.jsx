import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AICopilot({ contextData, contextType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Chào sếp! Sếp cần em hỗ trợ gì với tài liệu này? Em có thể đánh giá rủi ro, kiểm tra chính tả, hoặc gợi ý nội dung thêm.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu context
      let contextString = '';
      if (contextData) {
        contextString = `Đây là dữ liệu tài liệu hiện tại (Loại: ${contextType}):\n${JSON.stringify(contextData, null, 2)}`;
      }

      // Loại bỏ tin nhắn chào hỏi mặc định (vì Gemini yêu cầu history bắt đầu bằng 'user')
      const chatHistory = messages
        .filter((m, idx) => idx > 0) // Bỏ qua tin nhắn đầu tiên
        .map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMsg, 
          context: contextString,
          history: chatHistory
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.data }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi sếp, em đang bị lỗi kết nối: ' + data.message }]);
      }
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi sếp, mạng đang có vấn đề rồi ạ.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút Floating */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform group"
        >
          <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Trợ lý AI Copilot
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-800"></div>
          </div>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 flex-shrink-0 animate-slide-up">
          {/* Header */}
          <div className="h-14 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between px-4 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">auto_awesome</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm">AI Copilot</span>
                <span className="text-[10px] text-indigo-100 uppercase tracking-wider">{contextType ? `Đang xem: ${contextType}` : 'Trợ lý chung'}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div className="prose prose-sm prose-indigo max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span className="text-xs">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Hỏi AI về tài liệu này..."
                className="flex-1 max-h-[120px] bg-transparent outline-none resize-none text-sm p-1 min-h-[24px]"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2">
              AI có thể đọc nội dung bạn đang nhập ở form bên cạnh.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
