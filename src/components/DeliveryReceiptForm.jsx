import React from 'react';

const DeliveryReceiptForm = ({ data, onUpdate, onUpdateItem, onAddItem, onRemoveItem }) => {
    // Tính tổng
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalQuantity = data.items.reduce((sum, item) => sum + Number(item.quantity), 0);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24">
            {/* Breadcrumb & Header Zone */}
            <div className="mb-8">
                <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="hover:text-[#1a237e] cursor-pointer transition-colors">Phiếu xuất kho</span>
                    <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
                    <span className="text-slate-800">Tạo phiếu mới</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                            Phiếu Xuất Kho
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-black border border-indigo-100 uppercase tracking-wider">Bước 5</span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-md">Lập phiếu xuất kho kiêm biên bản giao nhận hàng hóa.</p>
                    </div>
                </div>
            </div>

            {/* Thông tin Công ty */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Đơn Vị Xuất (Người gửi)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Tên Công Ty</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.companyName} onChange={(e) => onUpdate('companyName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Tiêu đề phụ</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.companySubtitle} onChange={(e) => onUpdate('companySubtitle', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Địa chỉ</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.companyAddress} onChange={(e) => onUpdate('companyAddress', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Mã số thuế</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.companyTax} onChange={(e) => onUpdate('companyTax', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Điện thoại</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.companyPhone} onChange={(e) => onUpdate('companyPhone', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 border-l border-slate-100 pl-4">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Email & Web</label>
                        <div className="flex gap-2">
                            <input
                                type="text" className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                                value={data.companyEmail} onChange={(e) => onUpdate('companyEmail', e.target.value)} placeholder="Email"
                            />
                            <input
                                type="text" className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                                value={data.companyWeb} onChange={(e) => onUpdate('companyWeb', e.target.value)} placeholder="Web"
                            />
                        </div>
                    </div>
                    <div className="col-span-3 mt-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Khối Thông tin Chuyên Mục (Góc Phải)</label>
                        <textarea
                            className="w-full h-20 px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none resize-none leading-relaxed"
                            value={data.companySpecialty} onChange={(e) => onUpdate('companySpecialty', e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Thông tin Phiếu & Khách Hàng */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Phiếu Xuất & Người Nhận</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Đơn vị nhận (Tên CTY & MST)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.customerName} onChange={(e) => onUpdate('customerName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Địa chỉ Khách hàng</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.customerAddress} onChange={(e) => onUpdate('customerAddress', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Số phiếu (ID)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-medium"
                            value={data.id} onChange={(e) => onUpdate('id', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Ngày lập phiếu</label>
                        <input
                            type="date" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.date} onChange={(e) => onUpdate('date', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Người nhận hàng</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.customerContact} onChange={(e) => onUpdate('customerContact', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Nội dung (Lý do xuất)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.deliveryReason} onChange={(e) => onUpdate('deliveryReason', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Chi tiết hàng hóa xuất kho</h3>
                    <button
                        className="flex items-center gap-1.5 text-sm font-bold text-[#10b981] hover:text-[#059669] transition-colors"
                        onClick={onAddItem}
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Thêm dòng
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b-2 border-slate-100 bg-[#ecfdf5]">
                                <th className="py-4 pl-4 pr-2 text-[11px] font-black text-slate-500 uppercase w-10 text-center">STT</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-20 text-center">Mã Kho</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-24 text-center">Mã VT</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-[30%]">TÊN HÀNG HÓA/DỊCH VỤ</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-16 text-center">ĐVT</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-20 text-center">SL</th>
                                <th className="py-4 px-2 text-[11px] font-black text-slate-500 uppercase w-[15%] text-right">ĐƠN GIÁ</th>
                                <th className="py-4 px-6 text-[11px] font-black text-slate-500 uppercase w-[15%] text-right">THÀNH TIỀN</th>
                                <th className="py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, index) => {
                                const itemTotal = item.quantity * item.price;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 pl-4 pr-2 text-sm text-slate-500 text-center font-medium">{index + 1}</td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-xs text-center font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#10b981] outline-none transition-all pb-1 uppercase"
                                                value={item.warehouseCode} onChange={(e) => onUpdateItem(item.id, 'warehouseCode', e.target.value)} placeholder="KHO1"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-xs text-center font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#10b981] outline-none transition-all pb-1 uppercase"
                                                value={item.productCode} onChange={(e) => onUpdateItem(item.id, 'productCode', e.target.value)} placeholder="Mã..."
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#10b981] outline-none transition-all pb-1"
                                                value={item.name} onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)} placeholder="Tên mặt hàng"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm text-center text-slate-600 bg-transparent border border-slate-200 rounded py-1 outline-none focus:ring-1 focus:ring-[#10b981]/50 focus:border-[#10b981]"
                                                value={item.unit} onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)} placeholder="Đôi"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number" className="w-full text-sm text-center font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 outline-none pb-1"
                                                value={item.quantity} onChange={(e) => onUpdateItem(item.id, 'quantity', Number(e.target.value))} min="1"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm text-right font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 outline-none pb-1"
                                                value={formatCurrency(item.price)}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    onUpdateItem(item.id, 'price', Number(val));
                                                }}
                                            />
                                        </td>
                                        <td className="py-3 px-6 text-right font-bold text-slate-900 text-[15px]">
                                            {formatCurrency(itemTotal)}
                                        </td>
                                        <td className="py-3 pr-4 text-center">
                                            <button className="text-slate-300 hover:text-red-500 transition-colors p-1" onClick={() => onRemoveItem(item.id)}>
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col items-end pt-5 pb-5">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between items-center py-2 text-sm border-b border-slate-200 mb-2">
                            <span className="text-slate-500 font-medium">Tổng SL xuất</span>
                            <span className="font-bold text-slate-800 text-[15px]">{totalQuantity}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 mb-0">
                            <span className="text-lg font-black text-[#10b981]">Tổng Thành Tiền</span>
                            <span className="font-black text-[22px] text-[#10b981]">{formatCurrency(totalAmount)} đ</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DeliveryReceiptForm;
