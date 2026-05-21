import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function SaveToSetModal({ isOpen, onClose, documentType, documentData, onSaved }) {
  const { activeWorkspace } = useWorkspace();
  const [documentSets, setDocumentSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedSetId, setSelectedSetId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [documentName, setDocumentName] = useState('');

  // Mapping loại chứng từ sang tên tiếng Việt
  const typeNameMap = {
    quote: 'Báo giá',
    contract: 'Hợp đồng',
    delivery: 'Phiếu xuất kho',
    payment: 'Đề nghị thanh toán',
    advance: 'Đề nghị tạm ứng'
  };

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      setLoading(true);
      fetch(`/api/document-sets?companyId=${activeWorkspace.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDocumentSets(data.data);
            if (data.data.length > 0) {
              setSelectedSetId(data.data[0].id);
            } else {
              setIsCreatingNew(true); // Tự động chuyển sang tạo mới nếu chưa có bộ nào
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi khi tải bộ chứng từ", err);
          setLoading(false);
        });
        
      // Đặt tên mặc định cho chứng từ (ví dụ: Báo giá - Vinamilk)
      let defaultName = typeNameMap[documentType] || 'Chứng từ';
      if (documentData) {
        if (documentType === 'quote' || documentType === 'delivery') {
          defaultName += ` - ${documentData.customerName || 'Chưa có tên'}`;
        } else if (documentType === 'contract') {
          defaultName += ` - ${documentData.partyB || 'Chưa có tên'}`;
        }
      }
      setDocumentName(defaultName);
    }
  }, [isOpen, activeWorkspace, documentType, documentData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!documentName.trim()) {
      alert("Vui lòng nhập tên cho chứng từ này!");
      return;
    }

    setSaving(true);
    try {
      let targetSetId = selectedSetId;

      // Nếu đang ở chế độ tạo bộ mới
      if (isCreatingNew) {
        if (!newSetTitle.trim()) {
          alert("Vui lòng nhập tên Bộ chứng từ mới!");
          setSaving(false);
          return;
        }

        const setRes = await fetch(`/api/document-sets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: activeWorkspace.id,
            title: newSetTitle,
            tags: []
          })
        });
        const setData = await setRes.json();
        if (!setData.success) throw new Error("Không thể tạo bộ chứng từ");
        targetSetId = setData.data.id;
      }

      // Đã có targetSetId, tiến hành lưu chứng từ
      const docRes = await fetch(`/api/saved-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setId: targetSetId,
          companyId: activeWorkspace.id,
          type: documentType,
          documentName: documentName,
          data: documentData
        })
      });

      const docData = await docRes.json();
      if (docData.success) {
        alert("Lưu chứng từ thành công!");
        if (onSaved) onSaved();
        handleClose();
      } else {
        alert("Có lỗi xảy ra: " + docData.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu", error);
      alert("Đã xảy ra lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setIsCreatingNew(false);
    setNewSetTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[500px] max-w-[90vw] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0ea5e9]">save</span>
            Lưu vào Bộ Chứng Từ
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Tên chứng từ */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên chứng từ lưu trữ</label>
            <input 
              type="text" 
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] outline-none transition-all font-medium text-slate-800"
              placeholder="Nhập tên để dễ tìm kiếm sau này..."
            />
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Chọn bộ chứng từ */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Vị trí lưu (Bộ Chứng Từ)</label>
              <button 
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1"
              >
                {isCreatingNew ? 'Chọn bộ có sẵn' : '+ Tạo bộ mới'}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <input 
                  type="text" 
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                  className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] outline-none transition-all"
                  placeholder="Nhập tên Bộ chứng từ mới (VD: Dự án Vinamilk T4/2026)"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                {loading ? (
                  <div className="p-3 text-sm text-slate-400 text-center">Đang tải danh sách...</div>
                ) : documentSets.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm text-slate-500">
                    Chưa có bộ chứng từ nào. Vui lòng tạo bộ mới!
                  </div>
                ) : (
                  <select
                    value={selectedSetId}
                    onChange={(e) => setSelectedSetId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9] outline-none transition-all text-slate-700"
                  >
                    {documentSets.map(set => (
                      <option key={set.id} value={set.id}>{set.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || (!isCreatingNew && documentSets.length === 0 && !loading)}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#0ea5e9] rounded-xl hover:bg-[#0284c7] transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">done</span>
                Xác nhận Lưu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
