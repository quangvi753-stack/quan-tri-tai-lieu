import React, { useState, useRef, useEffect } from 'react';
import { resizeImageBase64 } from '../utils/imageResize';
import * as mammoth from 'mammoth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import TaxLookupInput from './ui/TaxLookupInput';
import { FileText, Building2, User, Package, Scale, PlusCircle, Trash2, X, ImagePlus, Bot, Calendar, MapPin } from 'lucide-react';

const OrderConfirmationForm = ({
    data,
    onUpdate,
    onUpdateItem,
    onAddItem,
    onRemoveItem,
    onUpdateClause,
    onAddClause,
    onRemoveClause,
    activeWorkspace
}) => {
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
                .catch(err => console.error("Lỗi khi tải danh bạ khách hàng trong đơn xác nhận đặt hàng:", err));
        }
    }, [activeWorkspace]);

    // Các điều khoản xác nhận mẫu
    const clausePresets = [
        {
            title: 'Thời gian và Địa điểm giao hàng',
            content: '1. Thời gian giao nhận: Dự kiến trong vòng 7 - 10 ngày kể từ ngày Bên A nhận được khoản tạm ứng đợt 1 và duyệt sản phẩm mẫu.\n2. Địa điểm giao hàng: Giao hàng tận nơi tại kho Bên B (địa điểm cụ thể theo thỏa thuận).'
        },
        {
            title: 'Thanh toán và Tạm ứng đặt cọc',
            content: '1. Phương thức thanh toán: Chuyển khoản qua ngân hàng.\n2. Tiến độ thanh toán:\n- Đợt 1: Bên B tạm ứng đặt cọc 50% giá trị đơn đặt hàng ngay sau khi hai bên ký xác nhận đơn hàng.\n- Đợt 2: Bên B thanh toán 50% giá trị còn lại ngay sau khi nhận đầy đủ hàng hóa kèm biên bản giao nhận và hóa đơn tài chính hợp lệ.'
        },
        {
            title: 'Chất lượng hàng hóa & Bảo hành',
            content: '1. Bên A cam kết cung cấp hàng hóa đúng chủng loại, chất lượng, tiêu chuẩn kỹ thuật đã thống nhất.\n2. Hàng hóa được bảo hành các lỗi kỹ thuật phát sinh do nhà sản xuất (đường may, chất liệu vải) trong vòng 03 tháng kể từ ngày giao nhận.'
        }
    ];

    const handleAddPresetClause = (preset) => {
        const newClause = {
            id: `c${Date.now()}`,
            title: preset.title,
            content: preset.content
        };
        const currentClauses = data.clauses || [];
        onUpdate('clauses', [...currentClauses, newClause]);
    };

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
                        const res = await fetch('/api/ai/extract-order-confirm', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileBase64: base64String, mimeType: file.type })
                        });
                        const json = await res.json();
                        if (json.success && json.data) {
                            const d = json.data;
                            if (d.partyBName) onUpdate('partyBName', d.partyBName);
                            if (d.partyBAddress) onUpdate('partyBAddress', d.partyBAddress);
                            if (d.partyBTax) onUpdate('partyBTax', d.partyBTax);
                            if (d.partyBRep) onUpdate('partyBRep', d.partyBRep);
                            if (d.partyBRole) onUpdate('partyBRole', d.partyBRole);
                            if (d.partyBPhone) onUpdate('partyBPhone', d.partyBPhone);
                            if (d.partyBBank) onUpdate('partyBBank', d.partyBBank);
                            if (d.partyBBankName) onUpdate('partyBBankName', d.partyBBankName);
                            if (d.deliveryLocation) onUpdate('deliveryLocation', d.deliveryLocation);
                            if (d.deliveryTime) onUpdate('deliveryTime', d.deliveryTime);
                            if (d.advancePercent) onUpdate('advancePercent', d.advancePercent);
                            if (d.items && d.items.length > 0) {
                                const mappedItems = d.items.map(item => ({
                                    id: item.id || Date.now() + Math.random(),
                                    name: item.name || '',
                                    image: '',
                                    unit: item.unit || 'Bộ',
                                    quantity: Number(item.quantity) || 1,
                                    price: Number(item.price) || 0,
                                    note: item.note || ''
                                }));
                                onUpdate('items', mappedItems);
                            }
                            alert('AI trích xuất biên bản xác nhận đặt hàng thành công!');
                        } else {
                            alert('Lỗi từ AI: ' + json.message);
                        }
                    } catch (err) {
                        alert('Lỗi AI: ' + err.message);
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

                const res = await fetch('/api/ai/extract-order-confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const json = await res.json();
                if (json.success && json.data) {
                    const d = json.data;
                    if (d.partyBName) onUpdate('partyBName', d.partyBName);
                    if (d.partyBAddress) onUpdate('partyBAddress', d.partyBAddress);
                    if (d.partyBTax) onUpdate('partyBTax', d.partyBTax);
                    if (d.partyBRep) onUpdate('partyBRep', d.partyBRep);
                    if (d.partyBRole) onUpdate('partyBRole', d.partyBRole);
                    if (d.partyBPhone) onUpdate('partyBPhone', d.partyBPhone);
                    if (d.partyBBank) onUpdate('partyBBank', d.partyBBank);
                    if (d.partyBBankName) onUpdate('partyBBankName', d.partyBBankName);
                    if (d.deliveryLocation) onUpdate('deliveryLocation', d.deliveryLocation);
                    if (d.deliveryTime) onUpdate('deliveryTime', d.deliveryTime);
                    if (d.advancePercent) onUpdate('advancePercent', d.advancePercent);
                    if (d.items && d.items.length > 0) {
                        const mappedItems = d.items.map(item => ({
                            id: item.id || Date.now() + Math.random(),
                            name: item.name || '',
                            image: '',
                            unit: item.unit || 'Bộ',
                            quantity: Number(item.quantity) || 1,
                            price: Number(item.price) || 0,
                            note: item.note || ''
                        }));
                        onUpdate('items', mappedItems);
                    }
                    alert('AI trích xuất biên bản xác nhận đặt hàng thành công!');
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

    const calculateSubtotal = () => {
        return (data.items || []).reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + (subtotal * ((data.taxRate || 0) / 100));
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-[20px] font-black tracking-tight text-slate-900 border-l-[3px] border-cyan-500 pl-3 leading-tight flex items-center gap-2">
                        Xác Nhận Đặt Hàng
                        <span className="text-[10px] bg-cyan-50 text-cyan-600 px-2.5 py-0.5 rounded-full font-black border border-cyan-100 uppercase tracking-wider">Bước 2</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 pl-3.5 font-medium">
                        Điền thông tin và bảng sản phẩm để xác nhận đơn hàng
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <input type="file" accept=".docx,.txt,.pdf,image/*" ref={fileInputRef} className="hidden" onChange={handleAIFileExtract} />
                    <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-cyan-200 text-cyan-600 hover:bg-cyan-50 font-bold text-xs gap-1.5"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isExtracting}
                    >
                        <Bot className="w-3.5 h-3.5" />
                        {isExtracting ? 'Đang quét...' : 'AI Quét File/Ảnh'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">Lưu nháp</Button>
                    <Button size="sm" className="h-8 bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Cập nhật</Button>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24">
                
                {/* Phần 0: Thông tin chung Biên Bản */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                            <FileText className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Thông tin chung</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <Label className="mb-1.5 block">Số Biên Bản <span className="text-red-500">*</span></Label>
                            <Input
                                className="font-bold text-slate-800 bg-white"
                                value={data.id}
                                onChange={(e) => onUpdate('id', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Ngày Lập</Label>
                            <Input
                                type="date"
                                className="bg-white"
                                value={data.date}
                                onChange={(e) => onUpdate('date', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Địa Điểm Lập Biên Bản</Label>
                            <Input
                                className="bg-white"
                                value={data.location || ''}
                                onChange={(e) => onUpdate('location', e.target.value)}
                                placeholder="Ví dụ: Văn phòng Cty QVN Việt Nam"
                            />
                        </div>
                        <div className="col-span-1">
                            <Label className="mb-1.5 block">Loại Căn cứ</Label>
                            <select
                                className="w-full text-sm rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-medium text-slate-700"
                                value={data.basisType || 'Báo giá'}
                                onChange={(e) => onUpdate('basisType', e.target.value)}
                            >
                                <option value="Báo giá">Báo giá</option>
                                <option value="Yêu cầu đặt hàng">Yêu cầu đặt hàng</option>
                                <option value="Đơn đề nghị đặt hàng">Đơn đề nghị đặt hàng</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <Label className="mb-1.5 block">Số hiệu Căn cứ (nếu có)</Label>
                            <Input
                                className="bg-white font-mono"
                                value={data.basisNumber || ''}
                                onChange={(e) => onUpdate('basisNumber', e.target.value)}
                                placeholder="Số hiệu..."
                            />
                        </div>
                    </div>
                </section>

                {/* Phần 1: Đại diện Bên A (Bán) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[11px]">A</div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Đại Diện Bên A (Bên Bán)</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded uppercase border border-green-200">Mặc định</span>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-sm grid grid-cols-2 gap-x-6 gap-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tên Đơn Vị</Label>
                            <Input
                                className="font-semibold text-slate-800"
                                value={data.partyAName}
                                onChange={(e) => onUpdate('partyAName', e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Địa Chỉ</Label>
                            <Input
                                value={data.partyAAddress}
                                onChange={(e) => onUpdate('partyAAddress', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Mã Số Thuế</Label>
                            <TaxLookupInput
                                value={data.partyATax}
                                onChange={(val) => onUpdate('partyATax', val)}
                                onFound={(result) => {
                                    if (result.name && !data.partyAName) onUpdate('partyAName', result.name);
                                    if (result.address && !data.partyAAddress) onUpdate('partyAAddress', result.address);
                                }}
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Người Đại Diện</Label>
                            <Input
                                value={data.partyARep}
                                onChange={(e) => onUpdate('partyARep', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Phần 2: Đại diện Bên B (Mua) */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[11px]">B</div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Đại Diện Bên B (Bên Mua)</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm grid grid-cols-2 gap-x-6 gap-y-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block font-bold text-blue-600">Chọn nhanh Khách hàng từ Database</Label>
                            <select
                                className="w-full text-sm rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    if (!selectedId) return;
                                    const customer = customers.find(c => c.id === selectedId);
                                    if (customer) {
                                        onUpdate('partyBName', customer.fullName || '');
                                        onUpdate('partyBAddress', customer.address || '');
                                        onUpdate('partyBTax', customer.taxCode || '');
                                        onUpdate('partyBRep', customer.representative || '');
                                        onUpdate('partyBRole', customer.position || '');
                                        onUpdate('partyBPhone', customer.phone || '');
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
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Tên Đơn Vị/Khách Hàng</Label>
                            <Input
                                className="font-semibold text-slate-800"
                                value={data.partyBName}
                                onChange={(e) => onUpdate('partyBName', e.target.value)}
                                placeholder="Nhập tên đối tác..."
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1.5 block">Địa Chỉ</Label>
                            <Input
                                value={data.partyBAddress}
                                onChange={(e) => onUpdate('partyBAddress', e.target.value)}
                                placeholder="Địa chỉ..."
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Mã Số Thuế (Bên B)</Label>
                            <TaxLookupInput
                                value={data.partyBTax}
                                onChange={(val) => onUpdate('partyBTax', val)}
                                onFound={(result) => {
                                    if (result.name) onUpdate('partyBName', result.name);
                                    if (result.address) onUpdate('partyBAddress', result.address);
                                }}
                                placeholder="Nhập MST để tự động điền tên & địa chỉ Bên B..."
                            />
                        </div>
                        <div>
                            <Label className="mb-1.5 block">Người Đại Diện</Label>
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
                    </div>
                </section>

                {/* Phần Giao hàng */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Điều kiện giao hàng</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="col-span-1">
                            <Label className="mb-1.5 block">Địa điểm giao hàng</Label>
                            <Input
                                className="bg-white"
                                value={data.deliveryLocation || ''}
                                onChange={(e) => onUpdate('deliveryLocation', e.target.value)}
                                placeholder="Địa điểm..."
                            />
                        </div>
                        <div className="col-span-1">
                            <Label className="mb-1.5 block">Thời gian giao hàng dự kiến</Label>
                            <Input
                                className="bg-white"
                                value={data.deliveryTime || ''}
                                onChange={(e) => onUpdate('deliveryTime', e.target.value)}
                                placeholder="Thời gian..."
                            />
                        </div>
                    </div>
                </section>

                {/* Phần 3: Danh sách sản phẩm */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Package className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Nội dung sản phẩm đặt hàng</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {(data.items || []).map((item, index) => (
                            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-cyan-300 transition-all relative">
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
                                            <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-md transition-colors border border-dashed border-slate-300 w-[60px] h-[56px] flex flex-col items-center justify-center hover:border-cyan-300 hover:text-cyan-500">
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
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block">Tên hàng hóa/dịch vụ</Label>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập tên..."
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-semibold text-slate-800 focus:border-cyan-500 outline-none transition-colors"
                                                    value={item.name}
                                                    onChange={(e) => onUpdateItem(item.id, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-center">ĐVT</Label>
                                                <input
                                                    type="text"
                                                    placeholder="Bộ, cái..."
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-center text-slate-700 focus:border-cyan-500 outline-none transition-colors"
                                                    value={item.unit}
                                                    onChange={(e) => onUpdateItem(item.id, 'unit', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-center">SL</Label>
                                                <input
                                                    type="number"
                                                    placeholder="SL"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-center font-medium text-slate-800 focus:border-cyan-500 outline-none transition-colors"
                                                    value={item.quantity}
                                                    onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div className="col-span-4 sm:col-span-2">
                                                <Label className="text-[10px] text-slate-400 font-medium uppercase mb-1 block text-right">Đơn giá (chưa VAT)</Label>
                                                <input
                                                    type="number"
                                                    placeholder="Đơn giá"
                                                    className="w-full bg-transparent border-b border-slate-200 py-1 text-sm text-right font-medium text-slate-800 focus:border-cyan-500 outline-none transition-colors"
                                                    value={item.price}
                                                    onChange={(e) => onUpdateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        {/* Quy cách / Yêu cầu kỹ thuật */}
                                        <div className="w-full mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                                            <Label className="text-[10px] text-amber-700 font-bold uppercase mb-1 block flex items-center gap-1">
                                                <span>📋</span> Quy cách / Yêu cầu kỹ thuật của Bên Mua
                                            </Label>
                                            <textarea
                                                rows={2}
                                                placeholder="VD: Chất liệu vải kaki cotton 65/35, màu xanh than, may cúc đồng, thêu logo theo mẫu đính kèm..."
                                                className="w-full bg-white border border-amber-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 outline-none transition-colors resize-none leading-relaxed"
                                                value={item.specs || ''}
                                                onChange={(e) => onUpdateItem(item.id, 'specs', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full mt-1">
                                            <input
                                                type="text"
                                                placeholder="Ghi chú thêm..."
                                                className="w-full bg-transparent border-b border-slate-200 py-1 text-xs font-normal text-slate-500 focus:border-cyan-500 outline-none transition-colors"
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
                            className="w-full h-12 border-dashed border-2 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 text-slate-500 gap-2"
                            onClick={onAddItem}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Thêm sản phẩm mới
                        </Button>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 w-full sm:w-72 shadow-sm">
                            <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-slate-600 font-medium">Tiền hàng (chưa VAT)</span>
                                <span className="font-bold text-slate-800">{formatCurrency(calculateSubtotal())} đ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-slate-600 font-medium">Thuế GTGT (VAT)</span>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="h-8 w-16 text-center bg-white"
                                        value={data.taxRate || 0}
                                        onChange={(e) => onUpdate('taxRate', parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                                <span className="font-black text-lg text-cyan-600">{formatCurrency(calculateTotal())} đ</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Phần 4: Điều khoản cam kết */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="size-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                            <Scale className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Điều khoản xác nhận đặt hàng</h3>
                    </div>

                    <div className="space-y-6">
                        {(data.clauses || []).map((clause, index) => (
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
                                        Mục {index + 1}
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
                                        className="min-h-[100px]"
                                        value={clause.content}
                                        onChange={(e) => onUpdateClause(clause.id, 'content', e.target.value)}
                                        placeholder="Nội dung điều khoản..."
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100 mb-3">
                            <div className="text-xs font-bold text-rose-700 mb-2">Thêm nhanh mẫu điều khoản đặt hàng:</div>
                            <div className="flex flex-wrap gap-2">
                                {clausePresets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddPresetClause(preset)}
                                        className="text-[10px] bg-white text-rose-600 border border-rose-150 hover:bg-rose-50 font-semibold px-2.5 py-1 rounded transition-colors"
                                    >
                                        + {preset.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed border-2 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-500 gap-2"
                            onClick={onAddClause}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Thêm điều khoản mới
                        </Button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default OrderConfirmationForm;
