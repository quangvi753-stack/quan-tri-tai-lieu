import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const QuotePreview = ({ data }) => {
    // Determine template type (fallback to standard)
    const template = data.templateType || 'standard';

    // Calculations
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price * (1 - item.discount / 100)), 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const total = subtotal + taxAmount;

    const hasTiers = data.items.some(item => item.useTiers && item.priceTiers && item.priceTiers.length > 0);

    const getQtyTiers = () => {
        const qtySet = new Set();
        data.items.forEach(item => {
            if (item.useTiers && item.priceTiers) {
                item.priceTiers.forEach(t => qtySet.add(t.minQty));
            }
        });
        return Array.from(qtySet).sort((a, b) => a - b);
    };

    const qtyTiers = getQtyTiers();

    // Format currency to Vietnamese standard (dots as thousands separator)
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    // Format date: "Ngày ... tháng ... năm ..."
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} năm ${formatDateObj.getFullYear()}`;

    // Logo renderer
    const renderLogo = () => {
        if (data.companyLogo) {
            return (
                <img 
                    src={data.companyLogo} 
                    alt="Logo" 
                    width="120" 
                    height="60" 
                    style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain', display: 'block', margin: template === 'corporate' ? '0' : '0 auto' }} 
                />
            );
        }
        
        // Custom elegant fallback logos based on template
        if (template === 'corporate') {
            return (
                <div style={{ display: 'inline-block', textAlign: 'left' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#ffffff', fontSize: '20px', fontFamily: 'serif' }}>
                        QVN
                    </div>
                </div>
            );
        }
        
        return (
            <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#2bb4e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#ffffff', fontSize: '20px', fontFamily: 'serif', margin: '0 auto' }}>
                    V
                </div>
                <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '2px', fontFamily: 'serif', color: '#64748b' }}>Đồng Phục Cao Cấp</div>
            </div>
        );
    }

    // Helper to chunk array for visual grid display in tables
    const chunkArray = (arr, size) => {
        const chunked = [];
        for (let i = 0; i < arr.length; i += size) {
            chunked.push(arr.slice(i, i + size));
        }
        return chunked;
    };

    // Header backgrounds and styles configuration
    const thBg = template === 'corporate' ? '#1e3a8a' : (template === 'minimal' ? '#f1f5f9' : '#dcfce7');
    const thColor = template === 'corporate' ? '#ffffff' : '#000000';
    const tblBorderClass = template === 'corporate' ? 'border-navy' : (template === 'minimal' ? 'border-grey' : 'border-black');
    const tblBorderColor = template === 'corporate' ? '#1e3a8a' : (template === 'minimal' ? '#cbd5e1' : '#000000');

    return (
        <div id="quote-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[13px] leading-relaxed relative print:m-0 print:p-0">
            {/* Outline Page Box for Print Preview Context */}
            <div className="p-8 md:p-12 h-full flex flex-col border border-transparent print:border-none">
                
                {/* 1. Header Section based on Template */}
                {template === 'corporate' ? (
                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-4 text-[12px] border-bottom-navy" style={{ width: '100%', border: 'none', borderBottom: '3px solid #1e3a8a', paddingBottom: '16px' }}>
                        <tbody>
                            <tr>
                                <td className="w-[15%] align-top" style={{ width: '15%', border: 'none' }}>
                                    {renderLogo()}
                                </td>
                                <td className="w-[55%] pl-4 align-top" style={{ width: '55%', border: 'none' }}>
                                    <div className="font-bold uppercase text-[15px] text-[#1e3a8a] leading-tight mb-1" style={{ color: '#1e3a8a' }}>{data.companyName}</div>
                                    <div className="uppercase font-semibold text-[10px] text-slate-500 mb-1.5">{data.companySubtitle}</div>
                                    <div className="text-slate-600 text-[11px] space-y-0.5">
                                        <div>{data.companyAddress}</div>
                                        <div>MST: {data.companyTax}</div>
                                        <div>Email: {data.companyEmail} | ĐT: {data.companyPhone}</div>
                                    </div>
                                </td>
                                <td className="w-[30%] pl-4 text-center align-top border-l border-slate-200" style={{ width: '30%', border: 'none', borderLeft: '1px solid #e2e8f0' }}>
                                    <div className="font-bold text-[#1e3a8a] border-b border-navy pb-0.5 mb-1 inline-block uppercase text-[11px]" style={{ borderBottom: '1.5px solid #1e3a8a', color: '#1e3a8a' }}>Lĩnh vực chuyên môn</div>
                                    <div className="text-left italic leading-tight text-slate-500 text-[10px]">
                                        {data.companySpecialty && data.companySpecialty.split('\n').map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : template === 'minimal' ? (
                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-4 text-[12px] border-bottom-grey" style={{ width: '100%', border: 'none', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                        <tbody>
                            <tr>
                                <td className="w-[15%] align-top" style={{ width: '15%', border: 'none' }}>
                                    {renderLogo()}
                                </td>
                                <td className="w-[85%] pl-4 align-top" style={{ width: '85%', border: 'none' }}>
                                    <div className="font-bold uppercase text-[14px] leading-tight mb-1 text-slate-800">{data.companyName}</div>
                                    <div className="text-slate-500 text-[11px] leading-relaxed">
                                        {data.companyAddress} | MST: {data.companyTax} <br />
                                        ĐT: {data.companyPhone} | Email: {data.companyEmail}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    /* Default Standard & Visual Layout Header */
                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-6 text-[12px]" style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="w-[60%] align-top" style={{ width: '60%', border: 'none' }}>
                                    <div className="flex items-start gap-3 mb-2">
                                        <div style={{ display: 'inline-block', marginRight: '8px' }}>{renderLogo()}</div>
                                        <div>
                                            <div className="font-bold uppercase text-[14px] leading-tight mb-1">{data.companyName}</div>
                                            <div className="uppercase mb-2 text-[12px] text-slate-500">{data.companySubtitle}</div>
                                        </div>
                                    </div>
                                    <div className="text-slate-600 text-[11px] space-y-0.5">
                                        <div>{data.companyAddress}</div>
                                        <div>MST: {data.companyTax}</div>
                                        <div>Email: {data.companyEmail}</div>
                                        <div>ĐT/FAX: {data.companyPhone}</div>
                                    </div>
                                </td>
                                <td className="w-[40%] pl-4 text-center align-top" style={{ width: '40%', border: 'none' }}>
                                    <div className="font-bold border-b border-black pb-1 mb-1 inline-block uppercase" style={{ borderBottom: '1.5px solid black' }}>Chuyên</div>
                                    <div className="text-left italic leading-tight text-slate-600 text-[11px]">
                                        {data.companySpecialty && data.companySpecialty.split('\n').map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

                {/* 2. Title Section */}
                {template === 'corporate' ? (
                    <table border="0" cellSpacing="0" cellPadding="0" style={{ width: '100%', border: 'none', marginBottom: '20px', marginTop: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '25%', border: 'none' }}></td>
                                <td style={{ width: '50%', textAlign: 'center', border: 'none' }}>
                                    <div className="font-bold text-2xl uppercase tracking-wide text-[#1e3a8a]" style={{ color: '#1e3a8a' }}>BÁO GIÁ THƯƠNG MẠI</div>
                                    <div className="text-xs font-semibold text-slate-500 tracking-wider mt-0.5">COMMERCIAL QUOTATION</div>
                                    <div className="italic text-slate-500 text-[11px] mt-1">{dateFormatted}</div>
                                </td>
                                <td style={{ width: '25%', textAlign: 'right', verticalAlign: 'top', fontSize: '11px', border: 'none', color: '#64748b' }}>
                                    Số / No: <span className="font-bold text-slate-800">{data.id}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table border="0" cellSpacing="0" cellPadding="0" style={{ width: '100%', border: 'none', marginBottom: '24px', marginTop: '10px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '30%', border: 'none' }}></td>
                                <td style={{ width: '40%', textAlign: 'center', border: 'none' }}>
                                    <div className="font-bold text-2xl uppercase tracking-wide">{template === 'visual' ? 'CATALOGUE BÁO GIÁ' : 'BÁO GIÁ'}</div>
                                    <div className="italic text-slate-500 text-[11px] mt-1">{dateFormatted}</div>
                                </td>
                                <td style={{ width: '30%', textAlign: 'right', verticalAlign: 'top', fontSize: '13px', border: 'none' }}>
                                    Số: &nbsp;&nbsp;&nbsp;{data.id}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

                {/* 3. Customer Info Section */}
                {template === 'corporate' ? (
                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-6" style={{ width: '100%', border: 'none', marginBottom: '20px' }}>
                        <tbody>
                            <tr>
                                <td className="bg-light-blue" style={{ borderLeft: '4px solid #1e3a8a', backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '0 4px 4px 0' }}>
                                    <table border="0" cellSpacing="0" cellPadding="0" style={{ width: '100%', border: 'none' }}>
                                        <tbody>
                                            <tr>
                                                <td className="py-0.5 font-bold text-[#1e3a8a] text-[11px]" style={{ width: '130px', border: 'none', color: '#1e3a8a' }}>KÍNH GỬI / TO:</td>
                                                <td className="py-0.5 text-slate-800 text-[12px] font-bold" style={{ border: 'none' }}>{data.representative || 'Quý Khách Hàng'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-0.5 font-bold text-[#1e3a8a] text-[11px]" style={{ width: '130px', border: 'none', color: '#1e3a8a' }}>ĐƠN VỊ / COMPANY:</td>
                                                <td className="py-0.5 text-slate-800 text-[12px] font-semibold" style={{ border: 'none' }}>{data.customerName}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-0.5 font-bold text-[#1e3a8a] text-[11px]" style={{ width: '130px', border: 'none', color: '#1e3a8a' }}>ĐỊA CHỈ / ADDRESS:</td>
                                                <td className="py-0.5 text-slate-600 text-[11px]" style={{ border: 'none' }}>{data.customerAddress}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-0.5 font-bold text-[#1e3a8a] text-[11px]" style={{ width: '130px', border: 'none', color: '#1e3a8a' }}>NỘI DUNG / SUBJECT:</td>
                                                <td className="py-0.5 text-slate-600 text-[11px]" style={{ border: 'none' }}>Báo giá cung cấp sản phẩm dịch vụ thương mại</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div className="mb-4">
                        <table border="0" cellSpacing="0" cellPadding="0" className="w-full text-left font-medium" style={{ width: '100%', border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td className="py-1 w-[120px] text-slate-500" style={{ width: '120px', border: 'none' }}>Khách hàng:</td>
                                    <td className="py-1 text-slate-800" style={{ border: 'none' }}>{data.representative}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 w-[120px] text-slate-500" style={{ width: '120px', border: 'none' }}>Đơn vị:</td>
                                    <td className="py-1 text-slate-800 font-bold" style={{ border: 'none' }}>{data.customerName}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 w-[120px] align-top text-slate-500" style={{ width: '120px', border: 'none' }}>Địa chỉ:</td>
                                    <td className="py-1 align-top text-slate-700" style={{ border: 'none' }}>{data.customerAddress}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 w-[120px] align-top text-slate-500" style={{ width: '120px', border: 'none' }}>Nội dung:</td>
                                    <td className="py-1 align-top text-slate-700" style={{ border: 'none' }}>Báo giá sản phẩm dịch vụ</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. Products Render (Table or Grid) */}
                {template === 'visual' ? (
                    /* Visual Catalog Grid cards (via 2-column Word-compatible tables) */
                    <div>
                        <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-6" style={{ width: '100%', border: 'none', borderCollapse: 'separate', borderSpacing: '12px' }}>
                            <tbody>
                                {chunkArray(data.items, 2).map((rowItems, rIdx) => (
                                    <tr key={rIdx}>
                                        {rowItems.map((item) => {
                                            const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
                                            return (
                                                <td 
                                                    key={item.id} 
                                                    className="catalog-card" 
                                                    style={{ 
                                                        width: '50%', 
                                                        border: '1px solid #cbd5e1', 
                                                        borderRadius: '8px', 
                                                        padding: '12px', 
                                                        verticalAlign: 'top', 
                                                        backgroundColor: '#ffffff' 
                                                    }}
                                                >
                                                    {/* Image Box */}
                                                    <div 
                                                        className="catalog-img-container" 
                                                        style={{ 
                                                            height: '140px', 
                                                            backgroundColor: '#f8fafc', 
                                                            border: '1px solid #e2e8f0', 
                                                            borderRadius: '6px', 
                                                            padding: '8px', 
                                                            marginBottom: '10px', 
                                                            textAlign: 'center',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        {item.image ? (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name} 
                                                                style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', paddingTop: '50px' }}>Không có hình ảnh</div>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', marginBottom: '8px', lineHeight: '1.4', minHeight: '36px' }}>
                                                        {item.name}
                                                    </div>

                                                    {/* Details List Table */}
                                                    <table border="0" cellSpacing="0" cellPadding="2" style={{ width: '100%', border: 'none', fontSize: '11px', color: '#475569' }}>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ border: 'none', padding: '2px 0', width: '80px', color: '#94a3b8' }}>Đơn vị tính:</td>
                                                                <td style={{ border: 'none', padding: '2px 0', fontWeight: 'bold', color: '#334155' }}>{item.unit}</td>
                                                            </tr>
                                                            {!hasTiers && (
                                                                <>
                                                                    <tr>
                                                                        <td style={{ border: 'none', padding: '2px 0', color: '#94a3b8' }}>Số lượng:</td>
                                                                        <td style={{ border: 'none', padding: '2px 0', fontWeight: 'bold', color: '#334155' }}>{item.quantity}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td style={{ border: 'none', padding: '2px 0', color: '#94a3b8' }}>Đơn giá:</td>
                                                                        <td style={{ border: 'none', padding: '2px 0', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(item.price)} đ</td>
                                                                    </tr>
                                                                    <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                                                                        <td style={{ border: 'none', padding: '4px 0 2px 0', fontWeight: 'bold', color: '#1e3a8a' }}>Thành tiền:</td>
                                                                        <td style={{ border: 'none', padding: '4px 0 2px 0', fontWeight: 'black', color: '#1e3a8a', fontSize: '12px' }}>{formatCurrency(itemTotal)} đ</td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            {hasTiers && (
                                                                <tr>
                                                                    <td style={{ border: 'none', padding: '2px 0', color: '#94a3b8' }}>Giá cơ bản:</td>
                                                                    <td style={{ border: 'none', padding: '2px 0', fontWeight: 'bold', color: '#334155' }}>{formatCurrency(item.basePrice || item.price)} đ</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>

                                                    {/* Price Tiers List Inside Card */}
                                                    {item.priceTiers && item.priceTiers.length > 0 && (
                                                        <div style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '6px', lineHeight: '1.3' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '2px', fontStyle: 'normal' }}>Mốc giá sỉ:</div>
                                                            {item.priceTiers.map((t, idx) => (
                                                                <div key={idx}>&gt; {t.minQty} {item.unit || 'bộ'}: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(t.price)}đ</span></div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {/* Fill empty td if single item in row */}
                                        {rowItems.length === 1 && (
                                            <td style={{ width: '50%', border: 'none', backgroundColor: 'transparent' }}></td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary Table for Visual Layout (if no tiers) */}
                        {!hasTiers && (
                            <table border="1" cellPadding="6" className="w-full border-collapse border border-grey text-center text-[12px] mb-4" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#cbd5e1' }}>
                                <tbody>
                                    <tr className="font-bold">
                                        <td colSpan="5" className="border border-grey p-2 text-left" style={{ borderColor: '#cbd5e1' }}>Cộng tiền hàng / Total catalog:</td>
                                        <td className="border border-grey p-2 text-right" style={{ borderColor: '#cbd5e1', width: '150px' }}>{formatCurrency(subtotal)}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td colSpan="5" className="border border-grey p-2 text-left" style={{ borderColor: '#cbd5e1' }}>Thuế GTGT ({data.taxRate}%):</td>
                                        <td className="border border-grey p-2 text-right" style={{ borderColor: '#cbd5e1' }}>{formatCurrency(taxAmount)}</td>
                                    </tr>
                                    <tr className="font-bold bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                                        <td colSpan="5" className="border border-grey p-2 text-left text-[13px]" style={{ borderColor: '#cbd5e1' }}>Tổng thanh toán (Có VAT):</td>
                                        <td className="border border-grey p-2 text-right text-[14px] text-[#1e3a8a]" style={{ borderColor: '#cbd5e1', color: '#1e3a8a' }}>{formatCurrency(total)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="6" className="border border-grey p-2 text-left italic" style={{ borderColor: '#cbd5e1' }}>
                                            Số tiền viết bằng chữ: {numberToWords(total)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    /* Standard Table-based layouts: Standard, Minimal, Corporate */
                    <table border="1" cellPadding="6" className={`w-full border-collapse border ${tblBorderClass} text-center text-[12px] mb-2`} style={{ width: '100%', borderCollapse: 'collapse', borderColor: tblBorderColor }}>
                        <thead>
                            <tr className="font-bold" style={{ backgroundColor: thBg, color: thColor }}>
                                <th className={`border ${tblBorderClass} p-2`} style={{ width: '40px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>STT</th>
                                <th className={`border ${tblBorderClass} p-2`} style={{ backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Tên hàng hóa, dịch vụ</th>
                                {template !== 'minimal' && <th className={`border ${tblBorderClass} p-2`} style={{ width: '80px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Hình Ảnh</th>}
                                <th className={`border ${tblBorderClass} p-2`} style={{ width: '64px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Đơn vị<br />tính</th>
                                {!hasTiers && <th className={`border ${tblBorderClass} p-2`} style={{ width: '64px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Số lượng</th>}
                                {!hasTiers && <th className={`border ${tblBorderClass} p-2`} style={{ width: '96px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Đơn giá</th>}
                                {!hasTiers && <th className={`border ${tblBorderClass} p-2`} style={{ width: '96px', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Thành tiền</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, index) => {
                                const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/30">
                                        <td className={`border ${tblBorderClass} p-1.5`} style={{ borderColor: tblBorderColor }}>{index + 1}</td>
                                        <td className={`border ${tblBorderClass} p-1.5 text-left`} style={{ borderColor: tblBorderColor }}>
                                            <div className="font-bold text-slate-800">{item.name}</div>
                                            {item.priceTiers && item.priceTiers.length > 0 && (
                                                <div className="text-[10px] text-slate-500 mt-0.5 italic print:text-slate-600">
                                                    * Chính sách giá: {item.priceTiers.map(t => `>${t.minQty} ${item.unit || 'bộ'}: ${formatCurrency(t.price)}đ`).join(' | ')}
                                                </div>
                                            )}
                                        </td>
                                        {template !== 'minimal' && (
                                            <td className={`border ${tblBorderClass} p-1.5 h-14`} style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center', borderColor: tblBorderColor }}>
                                                {item.image ? (
                                                    <img src={item.image} alt="ảnh" width="70" height="70" style={{ maxWidth: '70px', maxHeight: '70px', display: 'block', margin: '0 auto', objectFit: 'contain' }} />
                                                ) : null}
                                            </td>
                                        )}
                                        <td className={`border ${tblBorderClass} p-1.5`} style={{ borderColor: tblBorderColor }}>{item.unit}</td>
                                        {!hasTiers && <td className={`border ${tblBorderClass} p-1.5`} style={{ borderColor: tblBorderColor }}>{item.quantity}</td>}
                                        {!hasTiers && <td className={`border ${tblBorderClass} p-1.5 text-right`} style={{ borderColor: tblBorderColor }}>{formatCurrency(item.price)}</td>}
                                        {!hasTiers && <td className={`border ${tblBorderClass} p-1.5 text-right font-bold`} style={{ borderColor: tblBorderColor }}>{formatCurrency(itemTotal)}</td>}
                                    </tr>
                                )
                            })}
                            {/* Summary Rows */}
                            {!hasTiers && (
                                <>
                                    <tr className="font-bold">
                                        <td colSpan={template === 'minimal' ? 3 : 4} className={`border ${tblBorderClass} p-2 text-left`} style={{ borderColor: tblBorderColor }}>Cộng tiền hàng:</td>
                                        <td className={`border ${tblBorderClass} p-2 border-r-0`} style={{ borderColor: tblBorderColor }}></td>
                                        <td className={`border ${tblBorderClass} p-2 text-right`} style={{ borderColor: tblBorderColor }}>{formatCurrency(subtotal)}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td colSpan={template === 'minimal' ? 3 : 4} className={`border ${tblBorderClass} p-2 text-left`} style={{ borderColor: tblBorderColor }}>Thuế GTGT ({data.taxRate}%):</td>
                                        <td className={`border ${tblBorderClass} p-2 border-r-0`} style={{ borderColor: tblBorderColor }}></td>
                                        <td className={`border ${tblBorderClass} p-2 text-right`} style={{ borderColor: tblBorderColor }}>{formatCurrency(taxAmount)}</td>
                                    </tr>
                                    <tr className="font-bold">
                                        <td colSpan={template === 'minimal' ? 3 : 4} className={`border ${tblBorderClass} p-2 text-left`} style={{ borderColor: tblBorderColor, backgroundColor: template === 'corporate' ? '#f0f4f8' : 'transparent' }}>Tổng cộng:</td>
                                        <td className={`border ${tblBorderClass} p-2 text-center text-[13px]`} style={{ borderColor: tblBorderColor, backgroundColor: template === 'corporate' ? '#f0f4f8' : 'transparent' }}>{data.items.reduce((sum, item) => sum + Number(item.quantity), 0)}</td>
                                        <td className={`border ${tblBorderClass} p-2 text-right text-[13px]`} style={{ borderColor: tblBorderColor, backgroundColor: template === 'corporate' ? '#f0f4f8' : 'transparent' }}>{formatCurrency(total)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={template === 'minimal' ? 6 : 7} className={`border ${tblBorderClass} p-2 text-left italic`} style={{ borderColor: tblBorderColor }}>
                                            Số tiền viết bằng chữ: {numberToWords(total)}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                )}

                {/* 5. Quantity Pricing Tiers Table (if hasTiers) */}
                {hasTiers && qtyTiers.length > 0 && (
                    <div className="mt-4 mb-4">
                        <div className="font-bold underline mb-1.5 text-[13px]" style={{ color: template === 'corporate' ? '#1e3a8a' : '#000000' }}>Bảng giá theo mốc số lượng / Quantity Pricing Tier Table:</div>
                        <table border="1" cellPadding="6" className={`w-full border-collapse border ${tblBorderClass} text-center text-[12px] mb-4`} style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', borderColor: tblBorderColor }}>
                            <thead>
                                <tr className="font-bold" style={{ backgroundColor: thBg, color: thColor }}>
                                    <th className={`border ${tblBorderClass} p-2 text-center`} style={{ width: '20%', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Mốc số lượng</th>
                                    <th className={`border ${tblBorderClass} p-2 text-right`} style={{ width: '20%', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Đơn giá / bộ<br />(Chưa VAT)</th>
                                    <th className={`border ${tblBorderClass} p-2 text-right`} style={{ width: '20%', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Thành tiền<br />(Chưa VAT)</th>
                                    <th className={`border ${tblBorderClass} p-2 text-right`} style={{ width: '20%', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Thuế GTGT<br />({data.taxRate}%)</th>
                                    <th className={`border ${tblBorderClass} p-2 text-right`} style={{ width: '20%', backgroundColor: thBg, color: thColor, borderColor: tblBorderColor }}>Tổng cộng thanh<br />toán (Có VAT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {qtyTiers.map(qty => {
                                    let donGiaBo = 0;
                                    data.items.forEach(item => {
                                        if (item.useTiers && item.priceTiers && item.priceTiers.length > 0) {
                                            const sorted = [...item.priceTiers].sort((a, b) => b.minQty - a.minQty);
                                            const match = sorted.find(t => qty >= t.minQty);
                                            donGiaBo += match ? match.price : (item.basePrice || item.price);
                                        } else {
                                            donGiaBo += item.price;
                                        }
                                    });

                                    const thanhTien = donGiaBo * qty;
                                    const thueVAT = (thanhTien * data.taxRate) / 100;
                                    const tongCong = thanhTien + thueVAT;

                                    return (
                                        <tr key={qty} className="hover:bg-slate-50/50">
                                            <td className={`border ${tblBorderClass} p-2 font-bold text-center`} style={{ width: '20%', borderColor: tblBorderColor }}>{qty} {data.items[0]?.unit || 'bộ'}</td>
                                            <td className={`border ${tblBorderClass} p-2 text-right font-medium`} style={{ width: '20%', borderColor: tblBorderColor }}>{formatCurrency(donGiaBo)} đ</td>
                                            <td className={`border ${tblBorderClass} p-2 text-right font-medium`} style={{ width: '20%', borderColor: tblBorderColor }}>{formatCurrency(thanhTien)} đ</td>
                                            <td className={`border ${tblBorderClass} p-2 text-right text-slate-600`} style={{ width: '20%', borderColor: tblBorderColor }}>{formatCurrency(thueVAT)} đ</td>
                                            <td className={`border ${tblBorderClass} p-2 text-right font-bold bg-slate-50`} style={{ width: '20%', backgroundColor: '#f8fafc', borderColor: tblBorderColor }}>{formatCurrency(tongCong)} đ</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 6. Footer Notes & Signatures */}
                <div className="mt-4 text-[12px]">
                    <div className="mb-4 text-justify">
                        <div className="font-bold underline mb-1" style={{ color: template === 'corporate' ? '#1e3a8a' : '#000000' }}>Ghi chú / Điều khoản:</div>
                        <div className="leading-relaxed text-justify text-slate-700">
                            {data.terms && data.terms
                                .replace('Điều Khoản Thương Mại:\n', '')
                                .replace('Điều Khoản Thương Mại:', '')
                                .split('\n')
                                .map((line, i) => (
                                    <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
                                ))
                            }
                        </div>
                    </div>

                    <table border="0" cellSpacing="0" cellPadding="0" style={{ width: '100%', border: 'none', marginBottom: '8px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '60%', border: 'none' }}></td>
                                <td style={{ width: '40%', border: 'none', textAlign: 'center' }}>
                                    <div className="italic text-slate-500" style={{ marginBottom: '4px' }}>
                                        {dateFormatted ? `${dateFormatted}` : 'Ngày ..... tháng ..... năm .........'}
                                    </div>
                                    <div className="font-bold" style={{ color: template === 'corporate' ? '#1e3a8a' : '#000000' }}>
                                        NGƯỜI LẬP BÁO GIÁ
                                    </div>
                                    <div className="italic font-normal text-xs mt-1 text-slate-500" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                    <div className="h-16 flex items-center justify-center overflow-hidden my-1">
                                      {data.signatureA ? (
                                        <img src={data.signatureA} alt="Chữ ký" className="max-h-16 object-contain mix-blend-multiply" />
                                      ) : (
                                        <div className="h-10" />
                                      )}
                                    </div>
                                    <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontSize: '11px', color: '#64748b' }}>
                                        {data.preparedBy || ''}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default QuotePreview;
