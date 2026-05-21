import React from 'react';

const PaymentRequestForm = ({ data, onUpdate, onUpdateItem, onAddItem, onRemoveItem }) => {
    // Tính tổng
    const total = data.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="hover:text-[#db2777] cursor-pointer transition-colors">Thanh toán</span>
                    <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
                    <span className="text-slate-800">Tạo đề nghị thanh toán</span>
                </div>
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Đề Nghị Thanh Toán</h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-md">Điền thông tin chi tiết dưới đây để tạo giấy đề nghị thanh toán.</p>
                </div>
            </div>

            {/* Thông tin chung */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Đơn vị (Công ty)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-semibold text-slate-800"
                            value={data.companyName} onChange={(e) => onUpdate('companyName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Bộ phận (Đơn vị)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.department} onChange={(e) => onUpdate('department', e.target.value)} placeholder="VD: Phòng Kế Toán / Kho"
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Kính gửi</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.sendTo} onChange={(e) => onUpdate('sendTo', e.target.value)} placeholder="Ban Giám Đốc, Phòng Kế Toán..."
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Ngày lập</label>
                        <input
                            type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.date} onChange={(e) => onUpdate('date', e.target.value)}
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Người đề nghị thanh toán</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.requesterName} onChange={(e) => onUpdate('requesterName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Kèm theo chứng từ gốc (số lượng)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.attachedDocs} onChange={(e) => onUpdate('attachedDocs', e.target.value)} placeholder="VD: 02 (chứng từ gốc)"
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Nội dung thanh toán tổng quát</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none resize-none h-16"
                            value={data.reason} onChange={(e) => onUpdate('reason', e.target.value)} placeholder="VD: Thanh toán tiền mua vật tư văn phòng phẩm tháng 3/2026..."
                        />
                    </div>
                </div>
            </div>

            {/* Chi tiết thanh toán */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fdf2f8]">
                    <h3 className="text-lg font-bold text-slate-800">Chi tiết khoản thanh toán</h3>
                    <button
                        className="flex items-center gap-1.5 text-sm font-bold text-[#db2777] hover:text-[#be185d] transition-colors bg-white px-3 py-1.5 rounded-full border border-pink-200"
                        onClick={onAddItem}
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Thêm dòng
                    </button>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-3 px-2 text-[12px] font-black text-slate-500 uppercase w-12 text-center">STT</th>
                                <th className="py-3 px-2 text-[12px] font-black text-slate-500 uppercase">Nội dung chi tiết</th>
                                <th className="py-3 px-2 text-[12px] font-black text-slate-500 uppercase w-48 text-right">Số tiền (VNĐ)</th>
                                <th className="py-3 px-2 text-[12px] font-black text-slate-500 uppercase w-48">Ghi chú</th>
                                <th className="py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-2 text-sm text-slate-500 text-center font-medium">{index + 1}</td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="text" className="w-full text-sm text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#db2777] rounded px-2 py-1.5 outline-none transition-all"
                                            value={item.description} onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)} placeholder="Nội dung..."
                                        />
                                    </td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="text" className="w-full text-sm text-right font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#db2777] rounded px-2 py-1.5 outline-none transition-all"
                                            value={formatCurrency(item.amount)}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                onUpdateItem(item.id, 'amount', Number(val));
                                            }}
                                        />
                                    </td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="text" className="w-full text-sm text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#db2777] rounded px-2 py-1.5 outline-none transition-all"
                                            value={item.note} onChange={(e) => onUpdateItem(item.id, 'note', e.target.value)} placeholder="Ghi chú..."
                                        />
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <button className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-100" onClick={() => onRemoveItem(item.id)}>
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-slate-200">
                                <td colSpan="2" className="py-4 px-4 text-right font-bold text-slate-800 uppercase text-sm">
                                    Tổng cộng:
                                </td>
                                <td className="py-4 px-4 text-right font-black text-[#db2777] text-lg">
                                    {formatCurrency(total)} đ
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default PaymentRequestForm;
