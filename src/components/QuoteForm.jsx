import React, { useState, useRef } from 'react';
import { resizeImageBase64 } from '../utils/imageResize';
import * as mammoth from 'mammoth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ChevronRight, FileText, Bot, PlusCircle, Trash2, X, ImagePlus, CheckCircle2 } from 'lucide-react';

const QuoteForm = ({ data, onUpdate, onUpdateItem, onAddItem, onRemoveItem }) => {
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);
    // Tính tổng
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price * (1 - item.discount / 100)), 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const total = subtotal + taxAmount;

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24">
            {/* Breadcrumb & Header Zone */}
            <div className="mb-8">
                <div className="flex items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="hover:text-indigo-600 cursor-pointer transition-colors">Báo giá</span>
                    <ChevronRight className="w-3.5 h-3.5 mx-1" />
                    <span className="text-slate-800">Tạo báo giá theo mẫu QVN</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Báo Giá Hình Ảnh</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-md">Điền thông tin chi tiết dưới đây để tạo bảng báo giá có hình ảnh sản phẩm.</p>
                    </div>
                    
                    {/* AI Extraction Button */}
                    <div className="flex items-center gap-3">
                        <input type="file" accept=".docx,.txt" ref={fileInputRef} className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsExtracting(true);
                            try {
                                let text = '';
                                if (file.type === 'text/plain') text = await file.text();
                                else if (file.name.endsWith('.docx')) {
                                    const arrayBuffer = await file.arrayBuffer();
                                    const result = await mammoth.extractRawText({ arrayBuffer });
                                    text = result.value;
                                } else {
                                    alert('Vui lòng chọn file .docx hoặc .txt');
                                    setIsExtracting(false);
                                    return;
                                }
                                
                                const res = await fetch('/api/ai/extract-quote', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text })
                                });
                                const json = await res.json();
                                if (json.success && json.data) {
                                    if (json.data.customerName) onUpdate('customerName', json.data.customerName);
                                    if (json.data.customerAddress) onUpdate('customerAddress', json.data.customerAddress);
                                    if (json.data.items && json.data.items.length > 0) {
                                        onUpdate('items', json.data.items);
                                    }
                                    alert('Đã trích xuất và điền dữ liệu thành công!');
                                } else {
                                    alert('Lỗi từ AI: ' + json.message);
                                }
                            } catch (err) {
                                alert('Lỗi khi đọc file: ' + err.message);
                            } finally {
                                setIsExtracting(false);
                                e.target.value = ''; // Reset input
                            }
                        }} />
                        <Button
                            variant="gradient"
                            onClick={() => fileInputRef.current.click()}
                            disabled={isExtracting}
                            className="gap-2"
                        >
                            {isExtracting ? <Bot className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                            {isExtracting ? 'Đang trích xuất...' : 'AI Điền Form Tự Động'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Thông tin Công ty */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Thông tin Công ty (Người gửi)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="col-span-1 space-y-4">
                        <div>
                            <Label className="mb-1.5 block">Tên Công Ty</Label>
                            <Input
                                value={data.companyName} onChange={(e) => onUpdate('companyName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Phụ đề Công Ty</Label>
                            <Input
                                value={data.companySubtitle || ''} onChange={(e) => onUpdate('companySubtitle', e.target.value)} placeholder="VD: NHÀ PHÂN PHỐI..."
                            />
                        </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <div>
                            <Label className="mb-1.5 block">Địa chỉ</Label>
                            <Input
                                value={data.companyAddress} onChange={(e) => onUpdate('companyAddress', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Điện thoại & Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={data.companyPhone} onChange={(e) => onUpdate('companyPhone', e.target.value)} placeholder="SĐT"
                                />
                                <Input
                                    value={data.companyEmail} onChange={(e) => onUpdate('companyEmail', e.target.value)} placeholder="Email"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <div>
                            <Label className="mb-1.5 block">Mã số thuế</Label>
                            <Input
                                value={data.companyTax} onChange={(e) => onUpdate('companyTax', e.target.value)}
                            />
                        </div>
                        <div className="border-l pl-4 border-slate-200 space-y-4">
                            <div>
                                <Label className="mb-1.5 block">Người đại diện (Footer)</Label>
                                <Input
                                    value={data.representative} onChange={(e) => onUpdate('representative', e.target.value)} placeholder="Tên NV"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={data.repPhone} onChange={(e) => onUpdate('repPhone', e.target.value)} placeholder="SĐT NV"
                                />
                                <Input
                                    value={data.repEmail} onChange={(e) => onUpdate('repEmail', e.target.value)} placeholder="Email NV"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3 lg:col-span-1 border-t lg:border-t-0 lg:border-l lg:pl-5 border-slate-200 pt-4 lg:pt-0">
                        <Label className="mb-2 block">Logo (Từ Máy Tính)</Label>
                        <div className="flex flex-col gap-2 mb-4">
                            {data.companyLogo ? (
                                <div className="flex px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <img src={data.companyLogo} alt="Logo" className="max-h-8 max-w-[80px] object-contain border bg-white shadow-sm rounded-sm" />
                                        <span className="text-emerald-600 font-medium text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Đã tải</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onUpdate('companyLogo', '')}>Xóa</Button>
                                </div>
                            ) : (
                                <Input
                                    type="file" accept="image/*"
                                    className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                                const resized = await resizeImageBase64(reader.result, 150, 80);
                                                onUpdate('companyLogo', resized);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <Label className="mb-2 block">Danh mục chuyên (Góc Phải)</Label>
                        <Textarea
                            value={data.companySpecialty || ''} onChange={(e) => onUpdate('companySpecialty', e.target.value)} placeholder="* Dịch vụ 1..."
                        />
                    </div>
                </div>
            </div>

            {/* Thông tin Khách Hàng */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Thông tin Báo Giá & Khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="col-span-2">
                        <Label className="mb-1.5 block">Tên Khách hàng (KÍNH GỬI)</Label>
                        <Input
                            value={data.customerName} onChange={(e) => onUpdate('customerName', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <Label className="mb-1.5 block">Địa chỉ Khách hàng</Label>
                        <Input
                            value={data.customerAddress} onChange={(e) => onUpdate('customerAddress', e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <Label className="mb-1.5 block">Số báo giá (Dán tạm)</Label>
                        <Input
                            className="bg-slate-50 font-medium"
                            value={data.id} onChange={(e) => onUpdate('id', e.target.value)} readOnly
                        />
                    </div>
                    <div className="col-span-1">
                        <Label className="mb-1.5 block">Ngày BG (Góc phải)</Label>
                        <Input
                            type="date"
                            value={data.date} onChange={(e) => onUpdate('date', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        Chi tiết hàng hóa / dịch vụ
                    </h3>
                    <Button variant="outline" size="sm" onClick={onAddItem} className="gap-1.5 h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                        <PlusCircle className="w-4 h-4" />
                        Thêm dòng
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="py-3 pl-4 pr-2 text-[11px] font-bold text-slate-500 uppercase w-10 text-center tracking-wider">#</th>
                                <th className="py-3 px-2 text-[11px] font-bold text-slate-500 uppercase w-[25%] tracking-wider">TÊN HÀNG HÓA/DỊCH VỤ</th>
                                <th className="py-3 px-2 text-[11px] font-bold text-slate-500 uppercase w-28 text-center tracking-wider">HÌNH ẢNH</th>
                                <th className="py-3 px-2 text-[11px] font-bold text-slate-500 uppercase w-16 text-center tracking-wider">ĐVT</th>
                                <th className="py-3 px-2 text-[11px] font-bold text-slate-500 uppercase w-20 text-center tracking-wider">SL</th>
                                <th className="py-3 px-2 text-[11px] font-bold text-slate-500 uppercase w-[15%] text-right tracking-wider">ĐƠN GIÁ</th>
                                <th className="py-3 px-6 text-[11px] font-bold text-slate-500 uppercase w-[15%] text-right tracking-wider">THÀNH TIỀN</th>
                                <th className="py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, index) => {
                                const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3 pl-4 pr-2 text-sm text-slate-500 text-center font-medium">{index + 1}</td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-all pb-1 placeholder-slate-400"
                                                value={item.name} onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)} placeholder="Tên mặt hàng"
                                            />
                                        </td>
                                        <td className="py-3 px-2 min-w-[80px] text-center align-middle">
                                            <div className="flex flex-col items-center justify-center">
                                                {item.image ? (
                                                    <div className="relative group/img inline-block">
                                                        <img src={item.image} alt="Thumb" className="h-[46px] w-[50px] object-contain border border-slate-200 bg-white rounded shadow-sm" />
                                                        <button
                                                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                                                            onClick={() => onUpdateItem(item.id, 'image', '')}
                                                            title="Xóa ảnh này"
                                                        ><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-400 rounded transition-colors border border-dashed border-slate-300 w-[50px] h-[46px] flex flex-col items-center justify-center hover:border-indigo-300 hover:text-indigo-500">
                                                        <ImagePlus className="w-4 h-4 mb-0.5" />
                                                        <span className="text-[9px] font-medium pointer-events-none">Tải Ảnh</span>
                                                        <input
                                                            type="file" accept="image/*" className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = async () => {
                                                                        const resized = await resizeImageBase64(reader.result, 100, 100);
                                                                        onUpdateItem(item.id, 'image', resized);
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm text-center text-slate-600 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded py-1 outline-none transition-all"
                                                value={item.unit} onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)} placeholder="Bộ"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number" className="w-full text-sm text-center font-medium text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded py-1 outline-none transition-all"
                                                value={item.quantity} onChange={(e) => onUpdateItem(item.id, 'quantity', Number(e.target.value))} min="1"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="text" className="w-full text-sm text-right font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none pb-1 transition-all"
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all" onClick={() => onRemoveItem(item.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="bg-slate-50/80 p-6 border-t border-slate-200 flex flex-col items-end">
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between items-center py-2 text-sm">
                            <span className="text-slate-500 font-medium">Tạm tính</span>
                            <span className="font-bold text-slate-800 text-[15px]">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-sm relative group cursor-pointer">
                            <span className="text-slate-500 font-medium border-b border-dashed border-slate-300">Vat {data.taxRate}%</span>
                            <span className="font-bold text-slate-800 text-[15px]">{formatCurrency(taxAmount)}</span>
                            {/* Tooltip input tax */}
                            <div className="absolute right-0 top-8 bg-white border border-slate-200 shadow-lg rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-32 hidden group-hover:block">
                                <Input
                                    type="number" className="h-8 text-center"
                                    value={data.taxRate} onChange={(e) => onUpdate('taxRate', Number(e.target.value))} min="0" max="100" placeholder="% Phí VAT"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200">
                            <span className="text-lg font-black text-indigo-600">Tổng Tiền Hàng</span>
                            <span className="font-black text-[22px] text-indigo-600">{formatCurrency(total)} đ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3 - Text Editor Blocks */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[280px] overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-800">Điều khoản Thương Mại & Footer</h3>
                    </div>
                    <textarea
                        className="flex-1 w-full p-5 border-none text-sm text-slate-700 focus:ring-0 outline-none resize-none leading-relaxed font-serif"
                        value={data.terms}
                        onChange={(e) => onUpdate('terms', e.target.value)}
                    ></textarea>
                </div>
            </div>

        </div>
    );
};

export default QuoteForm;
