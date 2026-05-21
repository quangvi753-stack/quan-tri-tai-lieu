import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import SetDetail from './SetDetail';

export default function SetList() {
  const { activeWorkspace } = useWorkspace();
  const [documentSets, setDocumentSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);

  // Fetch document sets
  const fetchSets = () => {
    if (!activeWorkspace) return;
    setLoading(true);
    fetch(`/api/document-sets?companyId=${activeWorkspace.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocumentSets(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải bộ chứng từ', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSets();
    setSelectedSet(null);
  }, [activeWorkspace]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/document-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeWorkspace.id,
          title: newTitle,
          tags: ['Mới tạo'],
          metadata: {
            customerName: '',
            contractNo: ''
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        setIsCreating(false);
        fetchSets(); // Reload list
      }
    } catch (err) {
      console.error('Lỗi khi tạo bộ chứng từ', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ chứng từ này?')) return;
    try {
      await fetch(`/api/document-sets/${id}`, { method: 'DELETE' });
      fetchSets();
    } catch (err) {
      console.error('Lỗi khi xóa', err);
    }
  };

  if (selectedSet) {
    return <SetDetail set={selectedSet} onBack={() => setSelectedSet(null)} />;
  }

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Bộ chứng từ</h2>
            <p className="text-slate-500 text-sm mt-1">Workspace: {activeWorkspace?.name}</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[#0e7490] hover:bg-[#164e63] text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo Bộ Chứng Từ Mới
          </button>
        </div>

        {/* Form tạo mới */}
        {isCreating && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">Tạo Bộ Chứng Từ Mới</h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Tên bộ chứng từ (Ví dụ: Bộ chứng từ Giao hàng T4/2026...)" 
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0e7490] outline-none"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
              <button type="submit" className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Lưu
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Hủy
              </button>
            </form>
          </div>
        )}

        {/* Danh sách */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải dữ liệu...</div>
        ) : documentSets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4 block">folder_open</span>
            <h3 className="text-lg font-bold text-slate-700">Chưa có Bộ chứng từ nào</h3>
            <p className="text-slate-500 text-sm mt-1">Hãy tạo một bộ chứng từ mới để bắt đầu lưu trữ.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                  <th className="p-4">Tên Bộ Chứng Từ</th>
                  <th className="p-4">Ngày Tạo</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {documentSets.map(set => (
                  <tr key={set.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-500">folder</span>
                        {set.title}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(set.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {set.tags?.map((tag, i) => (
                          <span key={i} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-medium">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedSet(set)} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4">Xem chi tiết</button>
                      <button onClick={() => handleDelete(set.id)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined text-[20px] align-middle">delete</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
