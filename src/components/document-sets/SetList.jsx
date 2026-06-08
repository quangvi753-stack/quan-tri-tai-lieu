import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import SetDetail from './SetDetail';
import useTaxLookup from '../../hooks/useTaxLookup';

const EMPTY_CUSTOMER = {
  name: '', address: '', taxId: '', contactPerson: '', phone: '', email: ''
};

export default function SetList({ currentUser, onEditDocument, onNavigateWithPrefill, initialSelectedSet, onSelectSet }) {
  const { activeWorkspace } = useWorkspace();
  const [documentSets, setDocumentSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState(initialSelectedSet || null);

  // Trạng thái tạo bộ mới
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER);
  const [showCustomerFields, setShowCustomerFields] = useState(false);
  const [saving, setSaving] = useState(false);

  // Trạng thái chỉnh sửa bộ hiện tại
  const [editingSet, setEditingSet] = useState(null); // set object đang sửa
  const [editTitle, setEditTitle] = useState('');
  const [editCustomer, setEditCustomer] = useState(EMPTY_CUSTOMER);
  const [editSaving, setEditSaving] = useState(false);

  // Tax lookup hooks
  const { loading: newTaxLoading, error: newTaxError, lookupTax: lookupNewTax, clearError: clearNewTaxError } = useTaxLookup();
  const { loading: editTaxLoading, error: editTaxError, lookupTax: lookupEditTax, clearError: clearEditTaxError } = useTaxLookup();
  const [newTaxSuccess, setNewTaxSuccess] = useState(false);
  const [editTaxSuccess, setEditTaxSuccess] = useState(false);

  const fetchSets = () => {
    if (!activeWorkspace) return;
    setLoading(true);
    fetch(`/api/document-sets?companyId=${activeWorkspace.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setDocumentSets(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSets();
    setSelectedSet(null);
    if (onSelectSet) onSelectSet(null);
  }, [activeWorkspace]);

  /* ===== TẠO MỚI ===== */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/document-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeWorkspace.id,
          title: newTitle,
          customerInfo: newCustomer.name ? newCustomer : null,
          tags: newCustomer.name ? [newCustomer.name] : ['Mới tạo'],
          metadata: {}
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        setNewCustomer(EMPTY_CUSTOMER);
        setShowCustomerFields(false);
        setIsCreating(false);
        fetchSets();
      }
    } catch (err) {
      console.error('Lỗi khi tạo bộ', err);
    } finally {
      setSaving(false);
    }
  };

  /* ===== XÓA ===== */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ chứng từ này?\n(Các chứng từ bên trong sẽ không bị xóa)')) return;
    await fetch(`/api/document-sets/${id}`, { method: 'DELETE' });
    fetchSets();
  };

  /* ===== CHỈNH SỬA BỘ ===== */
  const openEdit = (set, e) => {
    e.stopPropagation();
    setEditingSet(set);
    setEditTitle(set.title || '');
    setEditCustomer(set.customerInfo || EMPTY_CUSTOMER);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/document-sets/${editingSet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          customerInfo: editCustomer.name ? editCustomer : null,
          tags: editCustomer.name ? [editCustomer.name] : editingSet.tags
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingSet(null);
        fetchSets();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bộ', err);
    } finally {
      setEditSaving(false);
    }
  };

  if (selectedSet) {
    return (
      <SetDetail 
        currentUser={currentUser}
        set={selectedSet}
        onBack={() => {
          setSelectedSet(null);
          if (onSelectSet) onSelectSet(null);
        }}
        onEditDocument={onEditDocument}
        onNavigateWithPrefill={onNavigateWithPrefill}
      />
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Bộ chứng từ</h2>
            <p className="text-slate-500 text-sm mt-1">Workspace: {activeWorkspace?.name}</p>
          </div>
          {currentUser?.role !== 'viewer' && (
            <button
              onClick={() => { setIsCreating(true); setShowCustomerFields(false); }}
              className="flex items-center gap-2 bg-[#0e7490] hover:bg-[#164e63] text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo Bộ Chứng Từ Mới
            </button>
          )}
        </div>

        {/* Form tạo mới */}
        {isCreating && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0e7490]">create_new_folder</span>
              Tạo Bộ Chứng Từ Mới
            </h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {/* Tên bộ */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Bộ chứng từ *</label>
                <input
                  type="text"
                  placeholder="VD: Bộ chứng từ BM Windows T5/2026"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] outline-none transition-all"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Toggle thông tin đối tác */}
              <button
                type="button"
                onClick={() => setShowCustomerFields(v => !v)}
                className="flex items-center gap-2 text-sm text-[#0e7490] font-medium hover:text-[#164e63] transition-colors w-fit"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showCustomerFields ? 'expand_less' : 'expand_more'}
                </span>
                {showCustomerFields ? 'Ẩn thông tin đơn vị đối tác' : '+ Thêm thông tin đơn vị đối tác (khuyên dùng)'}
              </button>

              {showCustomerFields && (
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tên đơn vị / Công ty đối tác *</label>
                    <input type="text" placeholder="VD: CÔNG TY CỔ PHẦN BM WINDOWS" value={newCustomer.name}
                      onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Địa chỉ</label>
                    <input type="text" placeholder="Địa chỉ trụ sở..." value={newCustomer.address}
                      onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Mã số thuế</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Nhập MST rồi nhấn Tra cứu..."
                          value={newCustomer.taxId}
                          onChange={e => {
                            setNewCustomer(p => ({...p, taxId: e.target.value}));
                            setNewTaxSuccess(false);
                            clearNewTaxError();
                          }}
                          onKeyDown={async e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const result = await lookupNewTax(newCustomer.taxId);
                              if (result) {
                                setNewCustomer(p => ({
                                  ...p,
                                  name: p.name || result.name,
                                  address: p.address || result.address
                                }));
                                setNewTaxSuccess(true);
                                setTimeout(() => setNewTaxSuccess(false), 4000);
                              }
                            }
                          }}
                          className={`w-full p-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 transition-all ${
                            newTaxSuccess ? 'border-emerald-400 ring-1 ring-emerald-300' :
                            newTaxError ? 'border-red-300 ring-1 ring-red-200' :
                            'border-blue-200 focus:ring-blue-400/30 focus:border-blue-400'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={newTaxLoading || !newCustomer.taxId || newCustomer.taxId.trim().length < 8}
                        onClick={async () => {
                          const result = await lookupNewTax(newCustomer.taxId);
                          if (result) {
                            setNewCustomer(p => ({
                              ...p,
                              name: p.name || result.name,
                              address: p.address || result.address
                            }));
                            setNewTaxSuccess(true);
                            setTimeout(() => setNewTaxSuccess(false), 4000);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 whitespace-nowrap"
                      >
                        {newTaxLoading
                          ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                          : newTaxSuccess
                            ? <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                            : <span className="material-symbols-outlined text-[14px]">search</span>
                        }
                        {newTaxLoading ? 'Đang tìm...' : newTaxSuccess ? 'Đã tìm!' : 'Tra cứu'}
                      </button>
                    </div>
                    {newTaxError && (
                      <div className="mt-1 text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {newTaxError}
                      </div>
                    )}
                    {newTaxSuccess && (
                      <div className="mt-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Đã điền tên công ty và địa chỉ tự động!
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Người liên hệ</label>
                    <input type="text" placeholder="Nguyễn Văn A" value={newCustomer.contactPerson}
                      onChange={e => setNewCustomer(p => ({...p, contactPerson: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Điện thoại</label>
                    <input type="text" placeholder="0912..." value={newCustomer.phone}
                      onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Email</label>
                    <input type="email" placeholder="email@company.com" value={newCustomer.email}
                      onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  {saving ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">done</span>}
                  Tạo Bộ chứng từ
                </button>
                <button type="button" onClick={() => { setIsCreating(false); setNewTitle(''); setNewCustomer(EMPTY_CUSTOMER); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách bộ chứng từ */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Đang tải dữ liệu...</div>
        ) : documentSets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4 block">folder_open</span>
            <h3 className="text-lg font-bold text-slate-700">Chưa có Bộ chứng từ nào</h3>
            <p className="text-slate-500 text-sm mt-1">Hãy tạo một bộ chứng từ mới để bắt đầu lưu trữ.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documentSets.map(set => (
              <div
                key={set.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#0e7490]/30 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedSet(set);
                  if (onSelectSet) onSelectSet(set);
                }}
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Icon bộ */}
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <span className="material-symbols-outlined text-amber-500 text-[26px]">folder_open</span>
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-slate-800 text-base truncate">{set.title}</h3>
                    </div>

                    {/* Thông tin đối tác */}
                    {set.customerInfo?.name && (
                      <div className="flex items-center gap-1.5 mt-1 mb-2">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">business</span>
                        <span className="text-sm text-slate-600 font-medium">{set.customerInfo.name}</span>
                        {set.customerInfo.phone && (
                          <span className="text-xs text-slate-400">• {set.customerInfo.phone}</span>
                        )}
                        {set.customerInfo.taxId && (
                          <span className="text-xs text-slate-400">• MST: {set.customerInfo.taxId}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        {new Date(set.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      {set.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {set.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thao tác */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {currentUser?.role !== 'viewer' && (
                      <>
                        <button
                          onClick={e => openEdit(set, e)}
                          className="p-2 text-slate-400 hover:text-[#0e7490] hover:bg-slate-50 rounded-lg transition-all"
                          title="Chỉnh sửa thông tin bộ"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={e => handleDelete(set.id, e)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa bộ"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedSet(set); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e7490] text-white text-xs font-bold rounded-lg hover:bg-[#164e63] transition-colors"
                    >
                      Mở
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL CHỈNH SỬA BỘ ===== */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-w-[90vw] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0e7490]">edit_note</span>
                Chỉnh sửa Bộ chứng từ
              </h3>
              <button onClick={() => setEditingSet(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">
              {/* Tên bộ */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Bộ chứng từ *</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] outline-none transition-all font-medium"
                />
              </div>

              {/* Thông tin đối tác */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">business</span>
                  Thông tin đơn vị đối tác
                </div>
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tên đơn vị / Công ty</label>
                    <input type="text" placeholder="VD: CÔNG TY CỔ PHẦN BM WINDOWS" value={editCustomer.name}
                      onChange={e => setEditCustomer(p => ({...p, name: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Địa chỉ</label>
                    <input type="text" placeholder="Địa chỉ trụ sở..." value={editCustomer.address}
                      onChange={e => setEditCustomer(p => ({...p, address: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Mã số thuế</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Nhập MST rồi nhấn Tra cứu..."
                          value={editCustomer.taxId}
                          onChange={e => {
                            setEditCustomer(p => ({...p, taxId: e.target.value}));
                            setEditTaxSuccess(false);
                            clearEditTaxError();
                          }}
                          onKeyDown={async e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const result = await lookupEditTax(editCustomer.taxId);
                              if (result) {
                                setEditCustomer(p => ({
                                  ...p,
                                  name: result.name || p.name,
                                  address: result.address || p.address
                                }));
                                setEditTaxSuccess(true);
                                setTimeout(() => setEditTaxSuccess(false), 4000);
                              }
                            }
                          }}
                          className={`w-full p-2.5 bg-white border rounded-lg text-sm outline-none focus:ring-2 transition-all ${
                            editTaxSuccess ? 'border-emerald-400 ring-1 ring-emerald-300' :
                            editTaxError ? 'border-red-300 ring-1 ring-red-200' :
                            'border-blue-200 focus:ring-blue-400/30 focus:border-blue-400'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={editTaxLoading || !editCustomer.taxId || editCustomer.taxId.trim().length < 8}
                        onClick={async () => {
                          const result = await lookupEditTax(editCustomer.taxId);
                          if (result) {
                            setEditCustomer(p => ({
                              ...p,
                              name: result.name || p.name,
                              address: result.address || p.address
                            }));
                            setEditTaxSuccess(true);
                            setTimeout(() => setEditTaxSuccess(false), 4000);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 whitespace-nowrap"
                      >
                        {editTaxLoading
                          ? <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                          : editTaxSuccess
                            ? <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                            : <span className="material-symbols-outlined text-[14px]">search</span>
                        }
                        {editTaxLoading ? 'Đang tìm...' : editTaxSuccess ? 'Đã tìm!' : 'Tra cứu'}
                      </button>
                    </div>
                    {editTaxError && (
                      <div className="mt-1 text-xs text-red-500 bg-red-50 px-2.5 py-1.5 rounded-md border border-red-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {editTaxError}
                      </div>
                    )}
                    {editTaxSuccess && (
                      <div className="mt-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Đã điền tên công ty và địa chỉ tự động!
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Người liên hệ</label>
                    <input type="text" placeholder="Nguyễn Văn A" value={editCustomer.contactPerson}
                      onChange={e => setEditCustomer(p => ({...p, contactPerson: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Điện thoại</label>
                    <input type="text" placeholder="0912..." value={editCustomer.phone}
                      onChange={e => setEditCustomer(p => ({...p, phone: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Email</label>
                    <input type="email" placeholder="email@company.com" value={editCustomer.email}
                      onChange={e => setEditCustomer(p => ({...p, email: e.target.value}))}
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditingSet(null)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#0e7490] rounded-xl hover:bg-[#164e63] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {editSaving
                  ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  : <span className="material-symbols-outlined text-[16px]">save</span>
                }
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
