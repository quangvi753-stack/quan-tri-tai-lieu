import React from 'react';
import { resizeImageBase64 } from '../utils/imageResize';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { FileText, Building2, User, Package, Scale, PlusCircle, Trash2, X, ImagePlus } from 'lucide-react';

const ContractForm = ({ data, onUpdate, onUpdateItem, onAddItem, onRemoveItem, onUpdateClause, onAddClause, onRemoveClause }) => {

    const calculateTotal = () => {
        const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        return subtotal + (subtotal * (data.taxRate / 100));
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-[20px] font-black tracking-tight text-slate-900 border-l-[3px] border-[#8b5cf6] pl-3 leading-tight">
                        Soạn Hợp Đồng Kinh Tế
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 pl-3.5 font-medium">
                        Điền hoặc chỉnh sửa thông tin Hợp đồng
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8">Lưu nháp</Button>
                    <Button size="sm" className="h-8 bg-[#8b5cf6] hover:bg-[#7c3aed]">Cập nhật</Button>
                </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24">

                {/* Phần 0: Thông tin chung Hợp Đồng */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                            <FileText className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Thông tin chung</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="col-span-2 mb-1">
                            <Label className="mb-2 block uppercase text-xs tracking-wider text-slate-500">Loại Văn Bản</Label>
                            <div className="flex gap-6 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="documentType" value="contract" checked={data.documentType === 'contract'} onChange={() => onUpdate('documentType', 'contract')} className="text-violet-600 focus:ring-violet-500 w-4 h-4" />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700">Hợp Đồng</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="documentType" value="appendix_quantity" checked={data.documentType === 'appendix_quantity'} onChange={() => onUpdate('documentType', 'appendix_quantity')} className="text-violet-600 focus:ring-violet-500 w-4 h-4" />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700">PL Số Lượng</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="documentType" value="appendix_addition" checked={data.documentType === 'appendix_addition'} onChange={() => onUpdate('documentType', 'appendix_addition')} className="text-violet-600 focus:ring-violet-500 w-4 h-4" />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700">PL Bổ Sung</span>
                                </label>
                            </div>
                        </div>

                        {data.documentType !== 'contract' && (
                            <div className="col-span-2 grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200 mb-2 shadow-sm">
                                <div>
                                    <Label className="mb-1.5 block">Tham chiếu HĐ Số</Label>
                                    <Input
                                        value={data.appendixForId || ''}
                                        onChange={(e) => onUpdate('appendixForId', e.target.value)}
                                        placeholder="Ví dụ: HD-1234..."
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">Ngày ký HĐ Gốc</Label>
                                    <Input
                                        type="date"
                                        value={data.appendixForDate || ''}
                                        onChange={(e) => onUpdate('appendixForDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label className="mb-1.5 block">Số Chứng Từ <span className="text-red-500">*</span></Label>
                            <Input
                                className="font-bold text-slate-800"
                                value={data.id}
                                onChange={(e) => onUpdate('id', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Ngày Lập</Label>
                            <Input
                                type="date"
                                value={data.date}
                                onChange={(e) => onUpdate('date', e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 mt-2">
                            <Label className="mb-1.5 block">Địa Điểm Ký Kết</Label>
                            <Input
                                value={data.location || ''}
                                onChange={(e) => onUpdate('location', e.target.value)}
                                placeholder="Ví dụ: trụ sở Công ty TNHH QVN Việt Nam"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Căn Cứ Pháp Lý (Mỗi dòng 1 căn cứ)</Label>
                            <Textarea
                                value={data.legalBases || ''}
                                onChange={(e) => onUpdate('legalBases', e.target.value)}
                                placeholder="- Căn cứ Luật Thương mại..."
                            />
                        </div>
                    </div>
                </section>

                {/* Phần 1: Tự động - Bên A */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[11px]">A</div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Đại Diện Bên A (Bán)</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase border border-green-200">QVN Mặc định</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm grid grid-cols-2 gap-x-6 gap-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tên Công Ty (Bên A)</Label>
                            <Input
                                className="font-semibold text-slate-800"
                                value={data.partyAName}
                                onChange={(e) => onUpdate('partyAName', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Địa Chỉ (Bên A)</Label>
                            <Input
                                value={data.partyAAddress}
                                onChange={(e) => onUpdate('partyAAddress', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Mã Số Thuế (Bên A)</Label>
                            <Input
                                className="font-mono"
                                value={data.partyATax}
                                onChange={(e) => onUpdate('partyATax', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Người Đại Diện (Bên A)</Label>
                            <Input
                                value={data.partyARep}
                                onChange={(e) => onUpdate('partyARep', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Chức Vụ</Label>
                            <Input
                                value={data.partyARole}
                                onChange={(e) => onUpdate('partyARole', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Số Điện Thoại</Label>
                            <Input
                                value={data.partyAPhone}
                                onChange={(e) => onUpdate('partyAPhone', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tài Khoản Số</Label>
                            <div className="flex gap-3">
                                <Input
                                    className="flex-1"
                                    value={data.partyABank}
                                    onChange={(e) => onUpdate('partyABank', e.target.value)}
                                    placeholder="Số TK..."
                                />
                                <Input
                                    className="flex-1"
                                    value={data.partyABankName}
                                    onChange={(e) => onUpdate('partyABankName', e.target.value)}
                                    placeholder="Tại Ngân hàng..."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Phần 2: Bên B */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[11px]">B</div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Đại Diện Bên B (Mua)</h3>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm grid grid-cols-2 gap-x-6 gap-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tên Công Ty/KH (Bên B)</Label>
                            <Input
                                className="font-semibold text-slate-800"
                                value={data.partyBName}
                                onChange={(e) => onUpdate('partyBName', e.target.value)}
                                placeholder="Nhập tên Công ty đối tác"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Địa Chỉ (Bên B)</Label>
                            <Input
                                value={data.partyBAddress}
                                onChange={(e) => onUpdate('partyBAddress', e.target.value)}
                                placeholder="Địa chỉ đối tác"
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Mã Số Thuế (Bên B)</Label>
                            <Input
                                className="font-mono"
                                value={data.partyBTax}
                                onChange={(e) => onUpdate('partyBTax', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Người Đại Diện (Bên B)</Label>
                            <Input
                                value={data.partyBRep}
                                onChange={(e) => onUpdate('partyBRep', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Chức Vụ</Label>
                            <Input
                                value={data.partyBRole}
                                onChange={(e) => onUpdate('partyBRole', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Số Điện Thoại</Label>
                            <Input
                                value={data.partyBPhone}
                                onChange={(e) => onUpdate('partyBPhone', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tài Khoản Số (Bên B)</Label>
                            <div className="flex gap-3">
                                <Input
                                    className="flex-1"
                                    value={data.partyBBank}
                                    onChange={(e) => onUpdate('partyBBank', e.target.value)}
                                    placeholder="Số TK..."
                                />
                                <Input
                                    className="flex-1"
                                    value={data.partyBBankName}
                                    onChange={(e) => onUpdate('partyBBankName', e.target.value)}
                                    placeholder="Tại Ngân hàng..."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Phần 3: Danh sách sản phẩm / Dịch vụ thuộc hợp đồng */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Package className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Điều 1: Hàng hóa</h3>
                        </div>
                    </div>

                    {/* Danh sách Item từ Báo Giá */}
                    <div className="space-y-4">
                        {data.items.map((item, index) => (
                            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-300 transition-all relative">
                                <button
                                    className="absolute -top-3 -right-3 size-7 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:border-red-200"
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="flex items-start gap-5">
                                    <div className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-100 text-[11px] font-bold text-slate-500 mt-1 shrink-0 border border-slate-200">
                                        #{(index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex flex-col items-center justify-center shrink-0 w-[60px] mt-0.5">
                                        {item.image ? (
                                            <div className="relative group/img inline-block">
                                                <img src={item.image} alt="Thumb" className="h-[56px] w-[60px] object-contain border border-slate-200 bg-white rounded-md shadow-sm" />
                                                <button
                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                                                    onClick={() => onUpdateItem(item.id, 'image', '')}
                                                    title="Xóa ảnh này"
                                                ><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-md transition-colors border border-dashed border-slate-300 w-[60px] h-[56px] flex flex-col items-center justify-center hover:border-indigo-300 hover:text-indigo-500">
                                                <ImagePlus className="w-4 h-4 mb-1" />
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
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div className="grid grid-cols-12 gap-4 w-full">
                                            <div className="col-span-12 sm:col-span-6">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block">Tên Hàng</Label>
                                                <input
                                                    type="text"
                                                    placeholder="Tên Hàng Hóa / Dịch vụ"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-semibold text-slate-800 focus:border-emerald-500 outline-none transition-colors"
                                                    value={item.name}
                                                    onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-center">ĐVT</Label>
                                                <input
                                                    type="text"
                                                    placeholder="Đơn vị"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-center text-slate-700 focus:border-emerald-500 outline-none transition-colors"
                                                    value={item.unit}
                                                    onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-center">SL</Label>
                                                <input
                                                    type="number"
                                                    placeholder="SL"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-center font-medium text-slate-800 focus:border-emerald-500 outline-none transition-colors"
                                                    value={item.quantity}
                                                    onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2 relative">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-right">Đơn giá</Label>
                                                <input
                                                    type="number"
                                                    placeholder="Đơn giá"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-right font-medium text-slate-800 focus:border-emerald-500 outline-none transition-colors"
                                                    value={item.price}
                                                    onChange={(e) => onUpdateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full mt-1">
                                            <input
                                                type="text"
                                                placeholder="Ghi chú (Size, màu sắc, thông số,...)"
                                                className="w-full bg-transparent border-b border-slate-200 py-1 text-xs font-normal text-slate-500 focus:border-emerald-500 outline-none transition-colors"
                                                value={item.note || ''}
                                                onChange={(e) => onUpdateItem(item.id, 'note', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed border-2 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 gap-2"
                            onClick={onAddItem}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Thêm hàng hóa vào Hợp Đồng
                        </Button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 w-full sm:w-72 shadow-sm">
                            <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-slate-600 font-medium">Thuế GTGT (VAT)</span>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="h-8 w-16 text-center bg-white"
                                        value={data.taxRate}
                                        onChange={(e) => onUpdate('taxRate', parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <span className="font-bold text-slate-800">Tổng V/trị:</span>
                                <span className="font-black text-lg text-emerald-600">{calculateTotal().toLocaleString()} đ</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Phần 4: Điều khoản riêng (Giao hàng / Thanh toán) */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <Scale className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Điều Khoản {data.documentType === 'appendix' ? 'Phụ Lục' : 'Hợp Đồng'}</h3>
                    </div>

                    <div className="space-y-5">
                        {data.documentType === 'appendix' ? (
                            <div>
                                <Label className="mb-2 block">Nội Dung Phụ Lục</Label>
                                <Textarea
                                    className="min-h-[120px]"
                                    value={data.appendixContent || ''}
                                    onChange={(e) => onUpdate('appendixContent', e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.clauses.map((clause, index) => (
                                    <div key={clause.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative group">
                                        <button
                                            onClick={() => onRemoveClause(clause.id)}
                                            className="absolute -top-3 -right-3 size-7 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:border-red-200"
                                            title="Xóa điều khoản"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="mb-4 flex items-center gap-3">
                                            <div className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded text-xs font-bold whitespace-nowrap">
                                                Điều {index + 2}
                                            </div>
                                            <Input
                                                className="font-bold text-slate-800 h-9"
                                                value={clause.title}
                                                onChange={(e) => onUpdateClause(clause.id, 'title', e.target.value)}
                                                placeholder="Tiêu đề điều khoản..."
                                            />
                                        </div>
                                        <div>
                                            <Textarea
                                                className="min-h-[120px]"
                                                value={clause.content}
                                                onChange={(e) => onUpdateClause(clause.id, 'content', e.target.value)}
                                                placeholder="Nội dung điều khoản..."
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-dashed border-2 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-500 gap-2"
                                    onClick={onAddClause}
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Thêm Điều Khoản Mới
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ContractForm;
