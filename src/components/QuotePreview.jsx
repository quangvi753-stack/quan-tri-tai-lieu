import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const QuotePreview = ({ data }) => {
    // Tính toán
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

    // Format tiền tệ kiểu Việt Nam (dấu chấm)
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    // Xử lý ngày tháng thành "Hà Nội, Ngày ... tháng ... năm ..."
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} năm ${formatDateObj.getFullYear()}`;

    // Logo hiển thị (nếu có user upload thì dùng, không thì tự tạo placeholder html)
    const renderLogo = () => {
        if (data.companyLogo) {
            return <img src={data.companyLogo} alt="Logo" width="150" height="80" style={{ maxWidth: '150px', maxHeight: '80px', objectFit: 'contain' }} />;
        }
        return (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#2bb4e1] flex items-center justify-center font-bold text-white text-3xl font-serif">
                    V
                </div>
                <div className="text-[10px] italic mt-1 font-serif">Đồng Phục Cao Cấp</div>
            </div>
        );
    }

    return (
        <div id="quote-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[13px] leading-relaxed relative print:m-0 print:p-0">
            {/* Outline Page Box for Print Preview Context */}
            <div className="p-8 md:p-12 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                {/* Header Section */}
                <table border="0" cellSpacing="0" cellPadding="0" className="w-full mb-6 text-[12px]" style={{ width: '100%', border: 'none' }}>
                    <tbody>
                        <tr>
                            <td className="w-[60%] align-top" style={{ width: '60%', border: 'none' }}>
                                <div className="font-bold uppercase text-[14px] leading-tight mb-1">{data.companyName}</div>
                                <div className="uppercase mb-2 text-[12px]">{data.companySubtitle}</div>
                                <div>{data.companyAddress}</div>
                                <div>MST: {data.companyTax}</div>
                                <div>Email: {data.companyEmail}</div>
                                <div>ĐT/FAX: {data.companyPhone}</div>
                            </td>
                            <td className="w-[40%] pl-4 text-center align-top" style={{ width: '40%', border: 'none' }}>
                                <div className="font-bold border-b border-black pb-1 mb-1 inline-block uppercase" style={{ borderBottom: '1.5px solid black' }}>Chuyên</div>
                                <div className="text-left italic whitespace-pre-line leading-tight">
                                    {data.companySpecialty}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title Section */}
                {/* Title Section */}
                <table border="0" cellSpacing="0" cellPadding="0" style={{ width: '100%', border: 'none', marginBottom: '24px', marginTop: '16px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '30%', border: 'none' }}></td>
                            <td style={{ width: '40%', textAlign: 'center', border: 'none' }}>
                                <div className="font-bold text-2xl uppercase tracking-wide">BÁO GIÁ</div>
                                <div className="italic mt-1">{dateFormatted}</div>
                            </td>
                            <td style={{ width: '30%', textAlign: 'right', verticalAlign: 'top', fontSize: '13px', border: 'none' }}>
                                Số: &nbsp;&nbsp;&nbsp;{data.id}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Customer Info */}
                <div className="mb-4">
                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full text-left font-medium" style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="py-1 w-[120px]" style={{ width: '120px', border: 'none' }}>Khách hàng:</td>
                                <td className="py-1" style={{ border: 'none' }}>{data.representative}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px]" style={{ width: '120px', border: 'none' }}>Đơn vị:</td>
                                <td className="py-1" style={{ border: 'none' }}>{data.customerName}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px] align-top" style={{ width: '120px', border: 'none' }}>Địa chỉ:</td>
                                <td className="py-1 align-top" style={{ border: 'none' }}>{data.customerAddress}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px] align-top" style={{ width: '120px', border: 'none' }}>Nội dung:</td>
                                <td className="py-1 align-top" style={{ border: 'none' }}>Báo giá sản phẩm dịch vụ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Table */}
                <table border="1" cellPadding="6" className="w-full border-collapse border border-black text-center text-[12px] mb-2" style={{ width: '100%', borderCollapse: 'collapse', borderColor: 'black' }}>
                    <thead>
                        <tr className="bg-[#dcfce7] font-bold" style={{ backgroundColor: '#dcfce7' }}>
                            <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '40px', backgroundColor: '#dcfce7' }}>STT</th>
                            <th className="border border-black p-2 bg-[#dcfce7]" style={{ backgroundColor: '#dcfce7' }}>Tên hàng hóa, dịch vụ</th>
                            <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '80px', backgroundColor: '#dcfce7' }}>Hình Ảnh</th>
                            <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '64px', backgroundColor: '#dcfce7' }}>Đơn vị<br />tính</th>
                            {!hasTiers && <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '64px', backgroundColor: '#dcfce7' }}>Số lượng</th>}
                            {!hasTiers && <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '96px', backgroundColor: '#dcfce7' }}>Đơn giá</th>}
                            {!hasTiers && <th className="border border-black p-2 bg-[#dcfce7]" style={{ width: '96px', backgroundColor: '#dcfce7' }}>Thành tiền</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => {
                            const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
                            return (
                                <tr key={item.id}>
                                    <td className="border border-black p-1.5">{index + 1}</td>
                                    <td className="border border-black p-1.5 text-left">
                                        <div className="font-bold">{item.name}</div>
                                        {item.priceTiers && item.priceTiers.length > 0 && (
                                            <div className="text-[10px] text-slate-500 mt-0.5 italic print:text-slate-600">
                                                * Chính sách giá: {item.priceTiers.map(t => `>${t.minQty} ${item.unit || 'bộ'}: ${formatCurrency(t.price)}đ`).join(' | ')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-black p-1.5 h-14" style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center' }}>
                                        {item.image ? (
                                            <img src={item.image} alt="ảnh" width="70" height="70" style={{ maxWidth: '70px', maxHeight: '70px', display: 'block', margin: '0 auto' }} />
                                        ) : null}
                                    </td>
                                    <td className="border border-black p-1.5">{item.unit}</td>
                                    {!hasTiers && <td className="border border-black p-1.5">{item.quantity}</td>}
                                    {!hasTiers && <td className="border border-black p-1.5 text-right">{formatCurrency(item.price)}</td>}
                                    {!hasTiers && <td className="border border-black p-1.5 text-right font-bold">{formatCurrency(itemTotal)}</td>}
                                </tr>
                            )
                        })}
                        {/* Summary Rows */}
                        {!hasTiers && (
                            <>
                                <tr className="font-bold">
                                    <td colSpan="5" className="border border-black p-2 text-left">Cộng tiền hàng:</td>
                                    <td className="border border-black p-2 border-r-0"></td>
                                    <td className="border border-black p-2 text-right">{formatCurrency(subtotal)}</td>
                                </tr>
                                <tr className="font-bold">
                                    <td colSpan="5" className="border border-black p-2 text-left">Thuế GTGT ({data.taxRate}%):</td>
                                    <td className="border border-black p-2 border-r-0"></td>
                                    <td className="border border-black p-2 text-right">{formatCurrency(taxAmount)}</td>
                                </tr>
                                <tr className="font-bold">
                                    <td colSpan="5" className="border border-black p-2 text-left">Tổng cộng:</td>
                                    <td className="border border-black p-2 text-center text-[13px]">{data.items.reduce((sum, item) => sum + Number(item.quantity), 0)}</td>
                                    <td className="border border-black p-2 text-right text-[13px]">{formatCurrency(total)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="7" className="border border-black p-2 text-left italic">
                                        Số tiền viết bằng chữ: {numberToWords(total)}
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>

                {/* Bảng giá theo mốc số lượng */}
                {hasTiers && qtyTiers.length > 0 && (
                    <div className="mt-4 mb-4">
                        <div className="font-bold underline mb-1.5 text-[13px]">Bố cục Bảng giá theo mốc:</div>
                        <table border="1" cellPadding="6" className="w-full border-collapse border border-black text-center text-[12px] mb-4" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', borderColor: 'black' }}>
                            <thead>
                                <tr className="bg-[#f1f5f9] font-bold" style={{ backgroundColor: '#f1f5f9' }}>
                                    <th className="border border-black p-2 text-center bg-[#f1f5f9]" style={{ width: '20%', backgroundColor: '#f1f5f9' }}>Mốc số lượng</th>
                                    <th className="border border-black p-2 text-right bg-[#f1f5f9]" style={{ width: '20%', backgroundColor: '#f1f5f9' }}>Đơn giá / bộ<br />(Chưa VAT)</th>
                                    <th className="border border-black p-2 text-right bg-[#f1f5f9]" style={{ width: '20%', backgroundColor: '#f1f5f9' }}>Thành tiền<br />(Chưa VAT)</th>
                                    <th className="border border-black p-2 text-right bg-[#f1f5f9]" style={{ width: '20%', backgroundColor: '#f1f5f9' }}>Thuế GTGT<br />({data.taxRate}%)</th>
                                    <th className="border border-black p-2 text-right bg-[#f1f5f9]" style={{ width: '20%', backgroundColor: '#f1f5f9' }}>Tổng cộng thanh<br />toán (Có VAT)</th>
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
                                            <td className="border border-black p-2 font-bold text-center" style={{ width: '20%' }}>{qty} {data.items[0]?.unit || 'bộ'}</td>
                                            <td className="border border-black p-2 text-right font-medium" style={{ width: '20%' }}>{formatCurrency(donGiaBo)} đ</td>
                                            <td className="border border-black p-2 text-right font-medium" style={{ width: '20%' }}>{formatCurrency(thanhTien)} đ</td>
                                            <td className="border border-black p-2 text-right text-slate-600" style={{ width: '20%' }}>{formatCurrency(thueVAT)} đ</td>
                                            <td className="border border-black p-2 text-right font-bold bg-slate-50" style={{ width: '20%', backgroundColor: '#f8fafc' }}>{formatCurrency(tongCong)} đ</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Notes & Signatures */}
                <div className="mt-2 text-[12px]">
                    <div className="mb-4 text-justify">
                        <div className="font-bold underline mb-1">Ghi chú / Điều khoản:</div>
                        <div className="whitespace-pre-line leading-relaxed">
                            {data.terms.replace('Điều Khoản Thương Mại:\n', '').replace('Điều Khoản Thương Mại:', '')}
                        </div>
                    </div>

                    <div className="mb-4 italic text-right" style={{ textAlign: 'right' }}>
                        Ngày ..... tháng ..... năm .........
                    </div>

                    <table border="0" cellSpacing="0" cellPadding="0" className="w-full text-center font-bold" style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="w-1/3 align-top" style={{ width: '33.33%', border: 'none' }}>
                                    <div>NGƯỜI LẬP BÁO GIÁ</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                </td>
                                <td className="w-1/3 align-top" style={{ width: '33.33%', border: 'none' }}>
                                    <div>KHÁCH HÀNG</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký xác nhận)</div>
                                </td>
                                <td className="w-1/3 align-top" style={{ width: '33.33%', border: 'none' }}>
                                    <div>GIÁM ĐỐC</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
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
