import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function CustomerManager({ onCreateDocument }) {
  const { activeWorkspace } = useWorkspace();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trạng thái Form bên phải
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shortName: '', fullName: '', taxCode: '', address: '',
    representative: '', position: '', phone: '', email: '', bankAccount: ''
  });

  const fetchCustomers = () => {
    if (!activeWorkspace) return;
    setLoading(true);
    fetch(`/api/customers?companyId=${activeWorkspace.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomers(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải khách hàng', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
    setSelectedCustomer(null);
    setIsEditing(false);
  }, [activeWorkspace]);

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setFormData({
      shortName: '', fullName: '', taxCode: '', address: '',
      representative: '', position: '', phone: '', email: '', bankAccount: ''
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("Tên khách hàng không được để trống");
      return;
    }

    try {
      let res;
      if (selectedCustomer) {
        // Cập nhật
        res = await fetch(`/api/customers/${selectedCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Tạo mới
        res = await fetch(`/api/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, companyId: activeWorkspace.id })
        });
      }

      const data = await res.json();
      if (data.success) {
        fetchCustomers();
        setIsEditing(false);
        if (!selectedCustomer && data.data) {
          handleSelect(data.data);
        } else {
          handleSelect(formData); // Cập nhật lại view
        }
      }
    } catch (err) {
      console.error('Lỗi khi lưu khách hàng', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
    
    try {
      await fetch(`/api/customers/${selectedCustomer.id}`, { method: 'DELETE' });
      fetchCustomers();
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Lỗi khi xóa', err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.taxCode.includes(searchQuery)
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50">
      {/* Cột trái: Danh sách khách hàng */}
      <div className="w-1/3 min-w-[350px] border-r border-slate-200 bg-white flex flex-col h-full z-10 shadow-[4px_0_15px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0e7490]">group</span>
              Khách Hàng
            </h2>
            <button 
              onClick={handleAddNew}
              className="bg-[#0e7490] hover:bg-[#164e63] text-white p-2 rounded-lg transition-colors"
              title="Thêm khách hàng mới"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Tìm theo tên, mã số thuế..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0e7490]/20 focus:border-[#0e7490] outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Đang tải...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy khách hàng nào.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedCustomer?.id === customer.id ? 'border-[#0e7490] bg-cyan-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                >
                  <div className="font-bold text-slate-800 text-sm mb-1">{customer.shortName}</div>
                  <div className="text-xs text-slate-500 mb-2 truncate">{customer.fullName}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">badge</span> {customer.taxCode || '---'}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">phone</span> {customer.phone || '---'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải: Chi tiết khách hàng & Form */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-y-auto">
        {!selectedCustomer && !isEditing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[64px] mb-4 text-slate-200">contact_page</span>
            <p>Chọn một khách hàng để xem chi tiết hoặc thêm mới</p>
          </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">{isEditing && !selectedCustomer ? 'person_add' : 'person'}</span>
                  {isEditing && !selectedCustomer ? 'Thêm Khách Hàng Mới' : isEditing ? 'Chỉnh Sửa Khách Hàng' : 'Thông Tin Khách Hàng'}
                </h3>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span> Sửa
                      </button>
                      <button onClick={handleDelete} className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span> Xóa
                      </button>
                    </>
                  ) : (
                    <button onClick={() => {setIsEditing(false); if(!selectedCustomer) setSelectedCustomer(null); else setFormData(selectedCustomer);}} className="px-4 py-2 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <form id="customerForm" onSubmit={handleSave} className="grid grid-cols-2 gap-6">
                  {/* Tên gọi tắt */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên gọi tắt (Short Name)</label>
                    <input name="shortName" value={formData.shortName} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} placeholder="VD: QVN Hà Nội" />
                  </div>
                  {/* Mã số thuế */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mã số thuế</label>
                    <input name="taxCode" value={formData.taxCode} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Tên đầy đủ */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên pháp nhân đầy đủ</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-bold'}`} placeholder="VD: Công ty TNHH QVN Việt Nam" required />
                  </div>
                  {/* Địa chỉ */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Địa chỉ đăng ký kinh doanh</label>
                    <input name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Đại diện */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Người đại diện</label>
                    <input name="representative" value={formData.representative} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Chức vụ */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chức vụ</label>
                    <input name="position" value={formData.position} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Điện thoại */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Điện thoại</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Email */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} />
                  </div>
                  {/* Số tài khoản (Thủ công) */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số tài khoản ngân hàng</label>
                    <input name="bankAccount" value={formData.bankAccount} onChange={handleChange} disabled={!isEditing} className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isEditing ? 'border border-slate-300 focus:border-blue-500 bg-white' : 'bg-slate-50 text-slate-800 font-medium'}`} placeholder="Số TK - Tên Ngân Hàng" />
                  </div>
                </form>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <button type="submit" form="customerForm" className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">save</span> Lưu Thông Tin
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Thao tác tạo chứng từ nhanh (chỉ hiện khi đang xem chi tiết, không phải lúc edit) */}
            {!isEditing && selectedCustomer && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">bolt</span> Thao Tác Nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => onCreateDocument('quote', selectedCustomer)}
                    className="bg-white hover:bg-[#2bb4e1] hover:text-white group border border-slate-200 hover:border-[#2bb4e1] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm"
                  >
                    <div className="size-12 rounded-full bg-[#2bb4e1]/10 text-[#2bb4e1] group-hover:bg-white group-hover:text-[#2bb4e1] flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[28px]">request_quote</span>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-white transition-colors">Tạo Báo Giá</span>
                  </button>
                  
                  <button 
                    onClick={() => onCreateDocument('contract', selectedCustomer)}
                    className="bg-white hover:bg-[#8b5cf6] hover:text-white group border border-slate-200 hover:border-[#8b5cf6] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm"
                  >
                    <div className="size-12 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] group-hover:bg-white group-hover:text-[#8b5cf6] flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[28px]">history_edu</span>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-white transition-colors">Tạo Hợp Đồng</span>
                  </button>
                  
                  <button 
                    onClick={() => onCreateDocument('delivery', selectedCustomer)}
                    className="bg-white hover:bg-[#10b981] hover:text-white group border border-slate-200 hover:border-[#10b981] rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all shadow-sm"
                  >
                    <div className="size-12 rounded-full bg-[#10b981]/10 text-[#10b981] group-hover:bg-white group-hover:text-[#10b981] flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[28px]">local_shipping</span>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-white transition-colors">Tạo Xuất Kho</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
