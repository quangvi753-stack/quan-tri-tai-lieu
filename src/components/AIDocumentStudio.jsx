import React, { useState, useRef } from 'react';
import Editor from 'react-simple-wysiwyg';
import * as mammoth from 'mammoth';
import { exportHTMLToWord } from '../utils/exportToWord';

export default function AIDocumentStudio({ onSaveToSet, defaultSetId, onClose }) {
  const [contextText, setContextText] = useState('');
  const [fileName, setFileName] = useState('');
  const [prompt, setPrompt] = useState('Hãy viết lại nội dung này thành một văn bản hoàn chỉnh, trình bày chuyên nghiệp.');
  const [editorHtml, setEditorHtml] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    if (file.type === 'text/plain') {
      const text = await file.text();
      setContextText(text);
      return;
    }

    if (file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          setContextText(result.value);
        } catch (error) {
          console.error("Lỗi khi đọc file Word:", error);
          alert("Không thể đọc được file Word này. Vui lòng thử copy-paste nội dung.");
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    alert("Hệ thống hiện tại chỉ hỗ trợ trích xuất chữ từ file .docx hoặc .txt");
  };

  const handleGenerateAI = async (customPrompt = null) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) {
      alert("Vui lòng nhập yêu cầu cho AI.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, context: contextText })
      });
      
      const data = await res.json();
      if (data.success) {
        setEditorHtml(data.data);
      } else {
        alert("Lỗi từ AI: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);
      alert("Không thể kết nối tới AI. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToSet = () => {
    if (!editorHtml.trim() || editorHtml === '<p><br></p>') {
      alert("Nội dung soạn thảo đang trống!");
      return;
    }
    if (onSaveToSet) {
      onSaveToSet('custom_doc', { html: editorHtml }, defaultSetId);
    }
  };

  const quickActions = [
    { label: "Trình bày chuyên nghiệp", icon: "edit_document", prompt: "Hãy viết lại và trình bày nội dung này thành một văn bản thật chuyên nghiệp, chia bố cục rõ ràng." },
    { label: "Tóm tắt ý chính", icon: "summarize", prompt: "Hãy tóm tắt ngắn gọn những ý chính của văn bản này dưới dạng gạch đầu dòng." },
    { label: "Dịch sang Tiếng Anh", icon: "translate", prompt: "Hãy dịch toàn bộ nội dung này sang Tiếng Anh chuyên ngành." },
    { label: "Sửa lỗi chính tả & văn phong", icon: "spellcheck", prompt: "Hãy kiểm tra và sửa toàn bộ lỗi chính tả, ngữ pháp, đồng thời cải thiện văn phong cho mượt mà." },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-100 relative font-display">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-xl shadow-sm flex items-center gap-1 text-sm font-bold transition-all hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại
        </button>
      )}

      {/* Cột Trái: Trợ lý AI */}
      <div className="w-[420px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.03)] z-10">
        
        {/* Header Left */}
        <div className="pt-8 pb-5 px-6 border-b border-slate-100 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl -ml-10 -mb-10"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2 drop-shadow-sm">
              <span className="material-symbols-outlined text-indigo-200 text-[26px]">auto_awesome_mosaic</span>
              AI Studio Workspace
            </h2>
            <p className="text-indigo-100 text-sm mt-1.5 opacity-90 font-light">Tự động hóa soạn thảo và chuẩn hóa văn bản</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 p-6">
          
          {/* Nguồn dữ liệu */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[18px] text-indigo-500">data_object</span>
              1. Dữ liệu đầu vào
            </label>
            <input type="file" accept=".docx,.txt" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            
            {!contextText ? (
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-full p-6 border-2 border-dashed border-indigo-200 bg-white rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px] text-indigo-400">cloud_upload</span>
                </div>
                <span className="text-sm font-semibold text-slate-600 mb-1">Tải lên tài liệu (.docx, .txt)</span>
                <span className="text-xs text-slate-400 text-center">Hoặc dán trực tiếp nội dung vào khung bên dưới</span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center mb-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 min-w-0">
                  <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{fileName || "Văn bản đã dán"}</p>
                    <p className="text-[10px] text-emerald-600/80 mt-0.5">Đã sẵn sàng xử lý</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setContextText(''); setFileName(''); }} 
                  className="size-8 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm border border-slate-100 transition-all"
                  title="Xóa dữ liệu"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            )}

            <textarea 
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Dán chữ thô vào đây nếu không tải file..."
              className="w-full mt-3 p-3 text-sm bg-white border border-slate-200 rounded-xl h-[120px] resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-700 shadow-inner placeholder-slate-300 custom-scrollbar"
            />
          </div>

          {/* Các chức năng thông minh */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-[18px] text-amber-500">lightbulb</span>
              2. Chức năng thông minh
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateAI(action.prompt)}
                  disabled={loading}
                  className="flex flex-col gap-1 items-start p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left shadow-sm disabled:opacity-50 group"
                >
                  <span className={`material-symbols-outlined text-[20px] ${loading ? 'text-slate-400' : 'text-indigo-500 group-hover:scale-110 transition-transform'}`}>
                    {action.icon}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt tùy chỉnh */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-purple-500">edit_note</span>
                3. Hoặc yêu cầu tùy chỉnh
              </div>
            </label>
            <div className="relative">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Thêm một đoạn giới thiệu công ty ở đầu..."
                className="w-full p-3 pr-12 text-sm bg-white border border-slate-200 rounded-xl h-[90px] resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800 font-medium shadow-sm custom-scrollbar"
              />
              <button 
                onClick={() => handleGenerateAI()}
                disabled={loading || !prompt.trim()}
                className="absolute bottom-3 right-3 size-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
                title="Gửi yêu cầu"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
            
            {loading && (
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center gap-3 text-indigo-700">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span className="text-sm font-semibold">AI đang xử lý yêu cầu...</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Cột Phải: Editor */}
      <div className="flex-1 flex flex-col bg-slate-100/50 overflow-hidden relative">
        <div className="h-[72px] border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Bản Thảo Khởi Tạo
            </span>
            <span className="text-xs text-slate-500 font-medium">Chỉnh sửa và lưu lại tài liệu của bạn</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportHTMLToWord('ai-editor-content', 'TaiLieuAI')}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[#2bb4e1] text-[20px]">download</span>
              Tải Word
            </button>
            <button
              onClick={handleSaveToSet}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              Lưu Hệ Thống
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-200/50 flex justify-center custom-scrollbar-dark relative">
          <div id="ai-editor-content" className="w-[210mm] min-h-[297mm] bg-white shadow-2xl relative rounded-sm group">
            {/* Thanh công cụ ảo (decor) */}
            <div className="absolute -top-10 left-0 right-0 h-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-800 text-white text-[10px] px-3 py-1 rounded-full shadow-lg">Khổ giấy A4 (210x297mm)</div>
            </div>
            
            <div className="prose-editor w-full h-full">
              <Editor 
                value={editorHtml} 
                onChange={(e) => setEditorHtml(e.target.value)} 
                containerProps={{ 
                  style: { 
                    minHeight: '297mm', 
                    border: 'none', 
                    padding: '40px 60px', 
                    backgroundColor: 'white',
                    fontFamily: 'Times New Roman, serif'
                  } 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
