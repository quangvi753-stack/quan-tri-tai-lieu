import React, { useState, useRef, useEffect } from 'react';
import * as mammoth from 'mammoth';
import { Bot, FileText, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const PaymentRequestForm = ({ data, onUpdate, activeWorkspace }) => {
    const [isExtracting, setIsExtracting] = useState(false);
    const [customers, setCustomers] = useState([]);
    const fileInputRef = useRef(null);

    // Tải danh bạ khách hàng
    useEffect(() => {
        if (activeWorkspace?.id) {
            fetch(`/api/customers?companyId=${activeWorkspace.id}`)
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        setCustomers(resData.data || []);
                    }
                })
                .catch(err => console.error("Lỗi khi tải danh bạ khách hàng:", err));
        }
    }, [activeWorkspace]);

    // Các tài khoản ngân hàng mẫu
    const bankPresets = [
        {
            label: 'Công ty QVN - Vietcombank',
            name: 'CONG TY TNHH QVN VIET NAM',
            number: '1012838992',
            bank: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank) - CN Hà Tây'
        },
        {
            label: 'Cá nhân (Quang) - Techcombank',
            name: 'VI NGUYEN QUANG',
            number: '19035688220015',
            bank: 'Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank) - CN Hà Đông'
        }
    ];

    const handleAIFileExtract = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsExtracting(true);
        try {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const dataUrl = reader.result;
                        const base64String = dataUrl.split(',')[1];
                        const res = await fetch('/api/ai/extract-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileBase64: base64String, mimeType: file.type })
                        });
                        const json = await res.json();
                        if (json.success && json.data) {
                            const d = json.data;
                            if (d.sendTo) onUpdate('sendTo', d.sendTo);
                            if (d.partyBName) onUpdate('partyBName', d.partyBName);
                            if (d.contractNumber) onUpdate('contractNumber', d.contractNumber);
                            if (d.goodsDescription) onUpdate('goodsDescription', d.goodsDescription);
                            if (d.totalContractValue) onUpdate('totalContractValue', Number(d.totalContractValue));
                            if (d.paymentPercent) onUpdate('paymentPercent', d.paymentPercent.toString());
                            if (d.paidAmount) onUpdate('paidAmount', Number(d.paidAmount));
                            if (d.paymentAmount) onUpdate('paymentAmount', Number(d.paymentAmount));
                            if (d.bankAccountName) onUpdate('bankAccountName', d.bankAccountName);
                            if (d.bankAccountNumber) onUpdate('bankAccountNumber', d.bankAccountNumber);
                            if (d.bankName) onUpdate('bankName', d.bankName);
                            alert('AI trích xuất đề nghị thanh toán thành công!');
                        } else {
                            alert('Lỗi từ AI: ' + json.message);
                        }
                    } catch (err) {
                        alert('Lỗi gọi AI: ' + err.message);
                    } finally {
                        setIsExtracting(false);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                let text = '';
                if (file.type === 'text/plain') text = await file.text();
                else if (file.name.endsWith('.docx')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    text = result.value;
                } else {
                    alert('Vui lòng chọn file .docx, .txt, .pdf hoặc ảnh chụp');
                    setIsExtracting(false);
                    return;
                }

                const res = await fetch('/api/ai/extract-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const json = await res.json();
                if (json.success && json.data) {
                    const d = json.data;
                    if (d.sendTo) onUpdate('sendTo', d.sendTo);
                    if (d.partyBName) onUpdate('partyBName', d.partyBName);
                    if (d.contractNumber) onUpdate('contractNumber', d.contractNumber);
                    if (d.goodsDescription) onUpdate('goodsDescription', d.goodsDescription);
                    if (d.totalContractValue) onUpdate('totalContractValue', Number(d.totalContractValue));
                    if (d.paymentPercent) onUpdate('paymentPercent', d.paymentPercent.toString());
                    if (d.paidAmount) onUpdate('paidAmount', Number(d.paidAmount));
                    if (d.paymentAmount) onUpdate('paymentAmount', Number(d.paymentAmount));
                    if (d.bankAccountName) onUpdate('bankAccountName', d.bankAccountName);
                    if (d.bankAccountNumber) onUpdate('bankAccountNumber', d.bankAccountNumber);
                    if (d.bankName) onUpdate('bankName', d.bankName);
                    alert('AI trích xuất đề nghị thanh toán thành công!');
                } else {
                    alert('Lỗi từ AI: ' + json.message);
                }
                setIsExtracting(false);
            }
        } catch (err) {
            alert('Lỗi khi đọc file: ' + err.message);
            setIsExtracting(false);
        } finally {
            e.target.value = '';
        }
    };

    const basisDateObj = new Date(data.date);
    const formattedBasisDate = isNaN(basisDateObj.getTime()) ? '.../.../...' : `${String(basisDateObj.getDate()).padStart(2, '0')}/${String(basisDateObj.getMonth() + 1).padStart(2, '0')}/${basisDateObj.getFullYear()}`;

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="hover:text-[#db2777] cursor-pointer transition-colors">Thanh toán</span>
                    <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
                    <span className="text-slate-800">Tạo đề nghị thanh toán chuẩn HĐ</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                            Đề Nghị Thanh Toán
                            <span className="text-[10px] bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full font-black border border-pink-100 uppercase tracking-wider">Bước 6</span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-md">Điền thông tin hợp đồng và ngân hàng để tạo đề nghị thanh toán.</p>
                    </div>
                    {/* AI Extraction Button */}
                    <div className="flex items-center gap-3">
                        <input type="file" accept=".docx,.txt,.pdf,image/*" ref={fileInputRef} className="hidden" onChange={handleAIFileExtract} />
                        <Button
                            variant="gradient"
                            onClick={() => fileInputRef.current.click()}
                            disabled={isExtracting}
                            className="gap-2"
                        >
                            <Bot className="w-5 h-5 animate-pulse" />
                            {isExtracting ? 'Đang trích xuất...' : 'AI Điền Form Tự Động'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Thông tin Công ty & Khách hàng */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Công ty & Khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-indigo-600 mb-2">Chọn Khách hàng từ Database</label>
                        <select
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-medium text-slate-700"
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) return;
                                const customer = customers.find(c => c.id === selectedId);
                                if (customer) {
                                    onUpdate('sendTo', customer.fullName.toUpperCase());
                                    onUpdate('partyBName', customer.fullName);
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="">-- Chọn khách hàng lưu sẵn trong danh bạ --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.fullName} {c.shortName ? `(${c.shortName})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
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

            {/* Thông tin Căn cứ (Hợp đồng / Đơn hàng / Đề nghị đặt hàng) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Căn cứ (Hợp đồng / Đơn hàng / Đề nghị đặt hàng)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-indigo-600 mb-2">Loại Căn cứ</label>
                        <select
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-medium text-slate-700"
                            value={data.basisType || 'Hợp đồng kinh tế'}
                            onChange={(e) => onUpdate('basisType', e.target.value)}
                        >
                            <option value="Hợp đồng kinh tế">Hợp đồng kinh tế</option>
                            <option value="Đơn đặt hàng">Đơn đặt hàng</option>
                            <option value="Đề nghị đặt hàng">Đề nghị đặt hàng</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Số {data.basisType || 'Hợp đồng kinh tế'}</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.contractNumber} onChange={(e) => onUpdate('contractNumber', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Nội dung (Về việc...)</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.goodsDescription} onChange={(e) => onUpdate('goodsDescription', e.target.value)} placeholder="mua các loại Bảo hộ lao động"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Giá trị (Bao gồm VAT)</label>
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

            {/* Thông tin Thanh toán & Tài khoản */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Thông tin Thanh toán & Tài khoản</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1 text-sm font-medium text-slate-600 flex items-center gap-2">
                        Tỷ lệ thanh toán đợt này:
                        <input
                            type="text" className="w-16 px-2 py-1 bg-white border border-slate-300 rounded outline-none font-bold text-[#db2777] text-center"
                            value={data.paymentPercent} onChange={(e) => onUpdate('paymentPercent', e.target.value)}
                        /> %
                    </div>
                    
                    <div className="col-span-1 text-right flex items-center justify-end gap-2 text-sm font-bold text-slate-800">
                        Đã tạm ứng/thanh toán trước:
                        <div className="relative w-full">
                            <input
                                type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-sm outline-none text-right pr-10"
                                value={formatCurrency(data.paidAmount || 0)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    onUpdate('paidAmount', Number(val));
                                }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VNĐ</span>
                        </div>
                    </div>

                    <div className="col-span-1 text-right flex items-center justify-end gap-2 text-sm font-bold text-slate-800">
                        Số tiền đề nghị đợt này:
                        <div className="relative w-full">
                            <input
                                type="text" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-sm outline-none font-black text-[#db2777] text-right pr-10"
                                value={formatCurrency(data.paymentAmount || 0)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    onUpdate('paymentAmount', Number(val));
                                }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VNĐ</span>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <label className="block text-xs font-bold text-slate-700">Tên tài khoản Ngân hàng (Bên thụ hưởng)</label>
                            <div className="flex flex-wrap gap-1.5">
                                {bankPresets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            onUpdate('bankAccountName', preset.name);
                                            onUpdate('bankAccountNumber', preset.number);
                                            onUpdate('bankName', preset.bank);
                                        }}
                                        className="text-[10px] bg-indigo-55 text-indigo-600 border border-indigo-150 hover:bg-indigo-100/70 font-semibold px-2 py-0.5 rounded transition-colors animate-fade-in"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none uppercase font-semibold"
                            value={data.bankAccountName} onChange={(e) => onUpdate('bankAccountName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Số tài khoản</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none font-bold text-[#1a237e]"
                            value={data.bankAccountNumber} onChange={(e) => onUpdate('bankAccountNumber', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2">Ngân hàng</label>
                        <input
                            type="text" className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none"
                            value={data.bankName} onChange={(e) => onUpdate('bankName', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tùy chỉnh Nội dung văn bản */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-pink-500">edit_note</span>
                    Tùy chỉnh Nội dung văn bản
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Đoạn 1: Căn cứ pháp lý</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none text-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            value={data.basisParagraph !== undefined ? data.basisParagraph : `Căn cứ ${data.basisType || 'Hợp đồng kinh tế'} Số: ${data.contractNumber || ''} ký ngày ${formattedBasisDate} giữa ${data.partyBName || ''} (Bên Mua) và ${data.companyName || ''} (Bên Bán) về việc ${data.goodsDescription || ''}, đến nay chúng tôi đã hoàn thành việc giao hàng.`}
                            onChange={(e) => onUpdate('basisParagraph', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Đoạn 2: Đề nghị thanh toán</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none text-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            value={data.requestParagraph !== undefined ? data.requestParagraph : `Vậy kính đề nghị Quý công ty thanh toán giá trị còn lại (đã bao gồm VAT) cụ thể như sau:`}
                            onChange={(e) => onUpdate('requestParagraph', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Đoạn 3: Dẫn nhập thông tin tài khoản</label>
                        <textarea
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm outline-none text-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            value={data.bankIntroduction !== undefined ? data.bankIntroduction : `Để đảm bảo tiến độ thanh toán, kính đề nghị Quý công ty thanh toán kịp thời cho chúng tôi số tiền trên vào tài khoản sau:`}
                            onChange={(e) => onUpdate('bankIntroduction', e.target.value)}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PaymentRequestForm;
