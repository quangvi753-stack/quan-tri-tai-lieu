import React from 'react';

const AdvanceRequestForm = ({ data, onUpdate }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="hover:text-[#f59e0b] cursor-pointer transition-colors">Tạm ứng</span>
                    <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
                    <span className="text-slate-800">Tạo đề nghị tạm ứng chuẩn HĐ</span>
                </div>
                <div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Đề Nghị Tạm Ứng Hợp Đồng</h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-md">Điền thông tin hợp đồng và ngân hàng để tạo đề nghị thanh toán tạm ứng.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Công ty & Khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Công ty phát hành (Bên Bán)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-semibold text-slate-800"
                            value={data.companyName} onChange={(e) => onUpdate('companyName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Kính gửi (In Hoa Đậm)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-bold"
                            value={data.sendTo} onChange={(e) => onUpdate('sendTo', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Bên Mua (Thường)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.partyBName} onChange={(e) => onUpdate('partyBName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Ngày tháng năm (Dưới cùng)</label>
                        <div className="flex gap-2">
                            <input
                                type="text" className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                                value={data.requestLocation} onChange={(e) => onUpdate('requestLocation', e.target.value)} placeholder="Hà Nội"
                            />
                            <input
                                type="date" className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                                value={data.date} onChange={(e) => onUpdate('date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Hợp đồng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Số Hợp đồng kinh tế</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.contractNumber} onChange={(e) => onUpdate('contractNumber', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Nội dung hợp đồng (Về việc...)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.goodsDescription} onChange={(e) => onUpdate('goodsDescription', e.target.value)} placeholder="mua các loại Bảo hộ lao động"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Giá trị Hợp đồng (Bao gồm VAT)</label>
                        <div className="relative">
                            <input
                                type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-bold"
                                value={formatCurrency(data.totalContractValue || 0)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    onUpdate('totalContractValue', Number(val));
                                }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VNĐ</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Tạm ứng & Tài khoản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                        Tỷ lệ tạm ứng:
                        <input
                            type="text" className="w-16 px-2 py-1 bg-white border border-slate-300 rounded outline-none font-bold text-[#f59e0b] text-center"
                            value={data.advancePercent} onChange={(e) => onUpdate('advancePercent', e.target.value)}
                        /> %
                    </div>
                    <div className="col-span-1 text-right flex items-center justify-end gap-2 text-sm font-bold text-slate-800 mt-2">
                        Số tiền tạm ứng:
                        <div className="relative w-48">
                            <input
                                type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-sm outline-none font-black text-[#f59e0b] text-right pr-10"
                                value={formatCurrency(data.advanceAmount || 0)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    onUpdate('advanceAmount', Number(val));
                                }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VNĐ</span>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Tên tài khoản Ngân hàng</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none uppercase font-semibold"
                            value={data.bankAccountName} onChange={(e) => onUpdate('bankAccountName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Số tài khoản</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-bold text-[#1a237e]"
                            value={data.bankAccountNumber} onChange={(e) => onUpdate('bankAccountNumber', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Ngân hàng</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.bankName} onChange={(e) => onUpdate('bankName', e.target.value)}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdvanceRequestForm;
