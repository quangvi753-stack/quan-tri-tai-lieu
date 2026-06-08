import React, { useState, useRef, useEffect } from 'react';
import { resizeImageBase64 } from '../utils/imageResize';
import * as mammoth from 'mammoth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import TaxLookupInput from './ui/TaxLookupInput';
import { FileText, Building2, User, Package, Scale, PlusCircle, Trash2, X, ImagePlus, Bot } from 'lucide-react';

const ContractForm = ({ data, onUpdate, onUpdateItem, onAddItem, onRemoveItem, onUpdateClause, onAddClause, onRemoveClause, activeWorkspace }) => {
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
                .catch(err => console.error("Lỗi khi tải danh bạ khách hàng trong hợp đồng:", err));
        }
    }, [activeWorkspace]);

    // Các điều khoản hợp đồng mẫu
    const clausePresets = [
        {
            title: 'Điều 2: Phương thức thanh toán',
            content: '1. Bên B tạm ứng cho Bên A 30% giá trị hợp đồng ngay sau khi hai bên ký kết.\n2. Số tiền còn lại 70% giá trị hợp đồng sẽ được Bên B thanh toán chuyển khoản cho Bên A trong vòng 5 ngày làm việc sau khi Bên A bàn giao đầy đủ hàng hóa, biên bản giao nhận nghiệm thu và hóa đơn tài chính hợp lệ.'
        },
        {
            title: 'Điều 3: Chất lượng và Giao nhận hàng hóa',
            content: '1. Bên A cam kết cung cấp hàng hóa đúng chất lượng, quy cách mẫu mã hai bên đã thỏa thuận.\n2. Địa điểm giao hàng: Tại văn phòng Bên B.\n3. Thời gian giao hàng: Trong vòng 7-10 ngày kể từ ngày Bên A nhận được khoản tạm ứng đợt 1 và duyệt mẫu.'
        },
        {
            title: 'Điều 4: Bảo hành sản phẩm',
            content: '1. Bên A chịu trách nhiệm bảo hành chất lượng sản phẩm trong vòng 3 tháng kể từ ngày ký biên bản bàn giao.\n2. Nội dung bảo hành bao gồm sửa chữa hoặc thay mới các lỗi kỹ thuật phát sinh do quá trình sản xuất (đường may, khóa kéo).'
        },
        {
            title: 'Điều 5: Trách nhiệm của các bên',
            content: '1. Trường hợp Bên B chậm thanh toán phải chịu lãi phạt chậm trả là 0.05%/ngày trên số tiền chậm trả.\n2. Trường hợp Bên A chậm giao hàng phải chịu phạt 0.05%/ngày trên giá trị hàng hóa chậm giao.\n3. Mức phạt tối đa cho mọi vi phạm không vượt quá 8% giá trị hợp đồng.'
        }
    ];

    const handleAddPresetClause = (preset) => {
        const newClause = {
            id: `c${Date.now()}`,
            title: preset.title,
            content: preset.content
        };
        onUpdate('clauses', [...data.clauses, newClause]);
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
                        const res = await fetch('/api/ai/extract-contract', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileBase64: base64String, mimeType: file.type })
                        });
                        const json = await res.json();
                        if (json.success && json.data) {
                            if (json.data.partyBName) onUpdate('partyBName', json.data.partyBName);
                            if (json.data.partyBAddress) onUpdate('partyBAddress', json.data.partyBAddress);
                            if (json.data.partyBTax) onUpdate('partyBTax', json.data.partyBTax);
                            if (json.data.partyBRep) onUpdate('partyBRep', json.data.partyBRep);
                            if (json.data.partyBRole) onUpdate('partyBRole', json.data.partyBRole);
                            if (json.data.partyBPhone) onUpdate('partyBPhone', json.data.partyBPhone);
                            if (json.data.partyBBank) onUpdate('partyBBank', json.data.partyBBank);
                            if (json.data.partyBBankName) onUpdate('partyBBankName', json.data.partyBBankName);
                            if (json.data.items && json.data.items.length > 0) {
                                const mappedItems = json.data.items.map(item => ({
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
                             alert('AI trích xuất hợp đồng thành công!');
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

                const res = await fetch('/api/ai/extract-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const json = await res.json();
                if (json.success && json.data) {
                    if (json.data.partyBName) onUpdate('partyBName', json.data.partyBName);
                    if (json.data.partyBAddress) onUpdate('partyBAddress', json.data.partyBAddress);
                    if (json.data.partyBTax) onUpdate('partyBTax', json.data.partyBTax);
                    if (json.data.partyBRep) onUpdate('partyBRep', json.data.partyBRep);
                    if (json.data.partyBRole) onUpdate('partyBRole', json.data.partyBRole);
                    if (json.data.partyBPhone) onUpdate('partyBPhone', json.data.partyBPhone);
                    if (json.data.partyBBank) onUpdate('partyBBank', json.data.partyBBank);
                    if (json.data.partyBBankName) onUpdate('partyBBankName', json.data.partyBBankName);
                    if (json.data.items && json.data.items.length > 0) {
                        const mappedItems = json.data.items.map(item => ({
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
                    alert('AI trích xuất hợp đồng thành công!');
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

    const calculateTotal = () => {
        const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        return subtotal + (subtotal * (data.taxRate / 100));
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-[20px] font-black tracking-tight text-slate-900 border-l-[3px] border-[#8b5cf6] pl-3 leading-tight flex items-center gap-2">
                        Soạn Hợp Đồng Kinh Tế
                        <span className="text-[10px] bg-violet-50 text-violet-600 px-2.5 py-0.5 rounded-full font-black border border-violet-100 uppercase tracking-wider">Bước 3</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 pl-3.5 font-medium">
                        Điền hoặc chỉnh sửa thông tin Hợp đồng
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <input type="file" accept=".docx,.txt,.pdf,image/*" ref={fileInputRef} className="hidden" onChange={handleAIFileExtract} />
                    <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="h-8 border-violet-250 text-violet-600 hover:bg-violet-50 font-bold text-xs gap-1.5"
                        onClick={() => fileInputRef.current.click()}
                        disabled={isExtracting}
                    >
                        <Bot className="w-3.5 h-3.5" />
                        {isExtracting ? 'Đang quét...' : 'AI Quét File/Ảnh'}
                    </Button>
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
                            <Label className="mb-1.5 block font-bold text-blue-600">Chọn nhanh Khách hàng từ Database</Label>
                            <select
                                className="w-full text-sm rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700"
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
                                        onUpdate('partyBBank', customer.bankAccount || '');
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="">-- Chọn khách hàng lưu sẵn trong danh bạ --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.fullName} {c.shortName ? `(${c.shortName})` : ''} - {c.representative || 'Chưa rõ đại diện'}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                            <TaxLookupInput
                                value={data.partyBTax}
                                onChange={(val) => onUpdate('partyBTax', val)}
                                onFound={(result) => {
                                    if (result.name) onUpdate('partyBName', result.name);
                                    if (result.address) onUpdate('partyBAddress', result.address);
                                }}
                                placeholder="Nhập MST Bên B để tự động điền tên và địa chỉ..."
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

                                <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100 mb-3">
                                    <div className="text-xs font-bold text-rose-700 mb-2">Thêm nhanh Mẫu điều khoản:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {clausePresets.map((preset, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleAddPresetClause(preset)}
                                                className="text-[10px] bg-white text-rose-600 border border-rose-150 hover:bg-rose-50 font-semibold px-2.5 py-1 rounded transition-colors"
                                            >
                                                + {preset.title.split(':')[1]?.trim() || preset.title}
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
                                    Thêm Điều Khoản Trống Mới
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
