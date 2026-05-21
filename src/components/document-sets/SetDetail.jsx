import React, { useState, useEffect } from 'react';
import QuotePreview from '../QuotePreview';
import ContractPreview from '../ContractPreview';
import DeliveryReceiptPreview from '../DeliveryReceiptPreview';
import PaymentRequestPreview from '../PaymentRequestPreview';
import AdvanceRequestPreview from '../AdvanceRequestPreview';
import AIDocumentStudio from '../AIDocumentStudio';
import { exportHTMLToWord } from '../../utils/exportToWord';

export default function SetDetail({ set, onBack }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isAiMode, setIsAiMode] = useState(false);

  const fetchDocuments = () => {
    setLoading(true);
    fetch(`/api/saved-documents?setId=${set.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocuments(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải chứng từ', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (set) {
      fetchDocuments();
    }
  }, [set]);

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chứng từ này khỏi bộ?")) return;
    try {
      await fetch(`/api/saved-documents/${docId}`, { method: 'DELETE' });
      fetchDocuments();
      if (viewingDoc && viewingDoc.id === docId) setViewingDoc(null);
    } catch (error) {
      console.error("Lỗi xóa chứng từ", error);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      quote: { label: 'Báo giá', color: 'bg-blue-100 text-blue-700' },
      contract: { label: 'Hợp đồng', color: 'bg-purple-100 text-purple-700' },
      delivery: { label: 'Xuất kho', color: 'bg-emerald-100 text-emerald-700' },
      payment: { label: 'Thanh toán', color: 'bg-pink-100 text-pink-700' },
      advance: { label: 'Tạm ứng', color: 'bg-amber-100 text-amber-700' },
      custom_doc: { label: 'Văn bản AI', color: 'bg-indigo-100 text-indigo-700' }
    };
    return map[type] || { label: 'Khác', color: 'bg-slate-100 text-slate-700' };
  };

  const handleDownloadWord = (doc) => {
    const containerId = `preview-container-${doc.id}`;
    const fileName = `${getTypeLabel(doc.type).label.replace(/ /g, '')}_${doc.documentName.replace(/ /g, '_')}`;
    exportHTMLToWord(containerId, fileName);
  };

  const renderPreview = (doc) => {
    switch (doc.type) {
      case 'quote': return <QuotePreview data={doc.data} />;
      case 'contract': return <ContractPreview data={doc.data} />;
      case 'delivery': return <DeliveryReceiptPreview data={doc.data} />;
      case 'payment': return <PaymentRequestPreview data={doc.data} />;
      case 'advance': return <AdvanceRequestPreview data={doc.data} />;
      case 'custom_doc': 
        return (
          <div className="bg-white p-10 shadow-lg min-h-[297mm] w-[210mm] font-serif text-[14pt]">
            <div dangerouslySetInnerHTML={{ __html: doc.data.html }} />
          </div>
        );
      default: return <div>Không hỗ trợ xem trước loại chứng từ này.</div>;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      {/* Cột trái: Danh sách chứng từ trong Bộ */}
      <div className="w-1/3 min-w-[350px] border-r border-slate-200 bg-white flex flex-col h-full z-10 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-slate-100 flex-shrink-0">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-medium mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại danh sách Bộ
          </button>
          
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-500">folder_open</span>
            {set.title}
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Tạo ngày: {new Date(set.createdAt).toLocaleDateString('vi-VN')}
          </p>

          <button 
            onClick={() => { setViewingDoc(null); setIsAiMode(true); }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition-all hover:shadow-lg text-sm font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Soạn tài liệu với AI
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Đang tải chứng từ...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Bộ chứng từ này đang trống.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {documents.map(doc => {
                const typeInfo = getTypeLabel(doc.type);
                return (
                  <div
                    key={doc.id}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group ${viewingDoc?.id === doc.id && !isAiMode ? 'border-[#0ea5e9] bg-cyan-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                    onClick={() => { setIsAiMode(false); setViewingDoc(doc); }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Xóa chứng từ khỏi bộ"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                    <div className="font-bold text-slate-800 text-sm mb-1 truncate" title={doc.documentName}>
                      {doc.documentName}
                    </div>
                    <div className="text-xs text-slate-400">
                      Lưu lúc: {new Date(doc.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Xem trước Chứng từ (Preview) hoặc AI Studio */}
      <div className="flex-1 bg-slate-800 flex flex-col h-full overflow-hidden relative">
        {isAiMode ? (
          <AIDocumentStudio 
            defaultSetId={set.id} 
            onClose={() => setIsAiMode(false)} 
            onSaveToSet={async (type, data, setId) => {
              // Lưu vào database với setId tương ứng
              try {
                const payload = {
                  companyId: set.companyId,
                  setId: setId || set.id,
                  type,
                  data,
                  documentName: "Tài liệu AI tự tạo",
                  createdAt: new Date().toISOString()
                };
                const res = await fetch('/api/saved-documents', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                  alert("Đã lưu tài liệu thành công vào bộ chứng từ!");
                  setIsAiMode(false);
                  fetchDocuments(); // Tải lại danh sách
                } else {
                  alert("Lỗi khi lưu: " + result.message);
                }
              } catch (error) {
                console.error(error);
                alert("Lỗi mạng khi lưu tài liệu");
              }
            }} 
          />
        ) : !viewingDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <span className="material-symbols-outlined text-[64px] mb-4 text-slate-200">document_scanner</span>
            <p>Chọn một chứng từ bên trái để xem trước, tải xuống, hoặc tạo tài liệu bằng AI</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex justify-center items-start p-6 lg:p-8 custom-scrollbar-dark relative">
            <div className="absolute top-4 right-4 flex gap-3 text-slate-400 z-10">
              <button 
                className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-4 py-2 rounded-lg flex items-center gap-2 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                title="Tải xuống Word"
                onClick={() => handleDownloadWord(viewingDoc)}
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span className="text-sm font-bold uppercase">Tải File Word</span>
              </button>
            </div>
            
            {/* Vùng Render View Ẩn ID để tải Word */}
            <div id={`preview-container-${viewingDoc.id}`} className="w-full max-w-4xl">
              {renderPreview(viewingDoc)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
