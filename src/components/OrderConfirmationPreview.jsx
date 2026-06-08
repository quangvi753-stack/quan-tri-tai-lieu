import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const OrderConfirmationPreview = ({ data }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    const subtotal = (data.items || []).reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxValue = subtotal * ((data.taxRate || 0) / 100);
    const total = subtotal + taxValue;

    // Xử lý ngày tháng
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} Năm ${formatDateObj.getFullYear()}`;

    // Helper tự động định dạng danh sách quy cách sản phẩm
    const renderSpecs = (specsText) => {
        if (!specsText) return null;
        // Tách theo dấu phẩy (có khoảng trắng sau đó), dấu chấm phẩy hoặc xuống dòng
        const items = specsText
            .split(/(?:,\s+|\n|;)+/)
            .map(item => item.trim().replace(/^-\s*/, '')) // Xóa dấu gạch ngang đầu dòng nếu người dùng nhập sẵn
            .filter(Boolean);
        
        if (items.length <= 1) {
            return (
                <div className="whitespace-pre-line pl-2 border-l border-slate-300 text-[12.5px] leading-relaxed text-slate-700">
                    {specsText}
                </div>
            );
        }

        return (
            <ul className="list-none pl-2 border-l border-slate-300 space-y-1">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                        <span className="text-[12px] text-slate-500 mt-1 shrink-0">-</span>
                        <span className="text-[12.5px] leading-relaxed text-slate-700">{item}</span>
                    </li>
                ))}
            </ul>
        );
    };

    // Inline style font cho chuẩn công văn
    const printStyles = {
        fontFamily: "'Times New Roman', Times, serif"
    };

    return (
        <div id="order-confirm-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[15px] leading-[1.6] relative print:m-0 print:p-0 font-display" style={printStyles}>
            <div className="px-12 py-12 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                <table className="w-full mb-8 text-[14px]" style={{ width: '100%', border: 'none' }}>
                    <tbody>
                        <tr>
                            <td className="w-[45%] text-center align-top font-bold uppercase" style={{ width: '45%', border: 'none' }}>
                                {data.partyAName}<br/>
                                <span className="text-[11px] font-normal lowercase">{data.partyAAddress}</span>
                            </td>
                            <td className="w-[55%] text-center align-top" style={{ width: '55%', border: 'none' }}>
                                <div className="font-bold uppercase text-[13px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div className="font-bold text-[13px]">Độc lập - Tự do - Hạnh phúc</div>
                                <div className="text-[12px] italic mt-1">--------***--------</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="font-bold text-[20px] uppercase tracking-wide mb-1">BIÊN BẢN XÁC NHẬN ĐẶT HÀNG</div>
                    <div className="italic text-[13px] font-normal">Số: {data.id}</div>
                    {data.location && <div className="italic text-[13px] font-normal">Địa điểm: {data.location}</div>}
                    <div className="italic text-[13px] font-normal">{dateFormatted}</div>
                </div>

                {/* Căn cứ */}
                <div className="mb-6 text-[14px] italic">
                    <p className="mb-1">- Căn cứ nhu cầu và khả năng thực tế của hai bên.</p>
                    {data.basisNumber && (
                        <p className="mb-1">- Căn cứ {data.basisType || 'Báo giá'} số {data.basisNumber} gửi khách hàng.</p>
                    )}
                </div>

                {/* Parties Details */}
                <div className="mb-6 text-[14px]">
                    <p className="font-bold mb-2">Hôm nay, hai bên chúng tôi gồm có:</p>
                    
                    {/* BÊN A */}
                    <div className="mb-4">
                        <table className="w-full border-none" style={{ border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td className="w-[100px] font-bold align-top border-none" style={{ width: '100px', border: 'none' }}>BÊN A (BÁN):</td>
                                    <td className="font-bold uppercase border-none" style={{ border: 'none' }}>{data.partyAName}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Địa chỉ:</td>
                                    <td className="border-none" style={{ border: 'none' }}>{data.partyAAddress}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Mã số thuế:</td>
                                    <td className="font-mono border-none" style={{ border: 'none' }}>{data.partyATax}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Đại diện:</td>
                                    <td className="border-none" style={{ border: 'none' }}><span className="font-bold">{data.partyARep}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* BÊN B */}
                    <div className="mb-4">
                        <table className="w-full border-none" style={{ border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td className="w-[100px] font-bold align-top border-none" style={{ width: '100px', border: 'none' }}>BÊN B (MUA):</td>
                                    <td className="font-bold uppercase border-none" style={{ border: 'none' }}>{data.partyBName || '................................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Địa chỉ:</td>
                                    <td className="border-none" style={{ border: 'none' }}>{data.partyBAddress || '................................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Mã số thuế:</td>
                                    <td className="font-mono border-none" style={{ border: 'none' }}>{data.partyBTax || '................................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Đại diện:</td>
                                    <td className="border-none" style={{ border: 'none' }}>
                                        <span className="font-bold">{data.partyBRep || '................................................................'}</span>
                                        {data.partyBRole ? ` - Chức vụ: ${data.partyBRole}` : ''}
                                    </td>
                                </tr>
                                {data.partyBPhone && (
                                    <tr>
                                        <td className="font-semibold align-top border-none" style={{ border: 'none' }}>Điện thoại:</td>
                                        <td className="border-none" style={{ border: 'none' }}>{data.partyBPhone}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng sản phẩm */}
                <div className="mb-6">
                    <p className="font-bold mb-2">Hai bên cùng thống nhất xác nhận đơn đặt hàng với chi tiết như sau:</p>
                    <table className="w-full text-center border-collapse" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[40px]">STT</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold">Tên hàng hóa/dịch vụ và Quy cách yêu cầu</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[55px]">ĐVT</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[55px]">SL</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[90px]">Đơn giá</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[105px]">Thành tiền</th>
                                <th className="border border-black px-2 py-1.5 text-center font-bold w-[80px]">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.items || []).map((item, index) => (
                                <tr key={item.id}>
                                    <td className="border border-black px-2 py-2 text-center align-top font-semibold w-[40px]">
                                        {index + 1}
                                    </td>
                                    <td className="border border-black px-3 py-2 text-left align-top">
                                        <div className="flex items-start gap-2.5">
                                            {item.image && <img src={item.image} alt="" className="w-8 h-8 object-contain shrink-0 mt-0.5" />}
                                            <div className="flex-1">
                                                <div className="font-bold text-[14.5px] text-black">{item.name}</div>
                                                {item.specs && (
                                                    <div className="mt-1.5 pt-1.5 border-t border-dashed border-slate-300">
                                                        <span className="font-bold text-slate-800 text-[12px] block mb-1">Quy cách kỹ thuật:</span>
                                                        {renderSpecs(item.specs)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-black px-2 py-2 text-center align-top">{item.unit}</td>
                                    <td className="border border-black px-2 py-2 text-center font-bold align-top">{item.quantity}</td>
                                    <td className="border border-black px-2 py-2 text-right align-top">{formatCurrency(item.price)}</td>
                                    <td className="border border-black px-2 py-2 text-right font-bold align-top">{formatCurrency(item.quantity * item.price)}</td>
                                    <td className="border border-black px-3 py-2 text-left text-[12.5px] align-top">{item.note}</td>
                                </tr>
                            ))}
                            {/* Cộng tiền hàng */}
                            <tr>
                                <td colSpan="5" className="border border-black px-2 py-1.5 text-right font-bold">Cộng tiền hàng (chưa VAT):</td>
                                <td className="border border-black px-2 py-1.5 text-right font-bold">{formatCurrency(subtotal)}</td>
                                <td className="border border-black px-2 py-1.5"></td>
                            </tr>
                            {/* VAT */}
                            <tr>
                                <td colSpan="5" className="border border-black px-2 py-1.5 text-right font-bold">Thuế GTGT ({data.taxRate || 0}%):</td>
                                <td className="border border-black px-2 py-1.5 text-right font-bold">{formatCurrency(taxValue)}</td>
                                <td className="border border-black px-2 py-1.5"></td>
                            </tr>
                            {/* Tổng thanh toán */}
                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                                <td colSpan="5" className="border border-black px-2 py-1.5 text-right font-black uppercase text-[13px]">Tổng cộng thanh toán (sau VAT):</td>
                                <td className="border border-black px-2 py-1.5 text-right font-black text-cyan-700 text-[14px]">{formatCurrency(total)} đ</td>
                                <td className="border border-black px-2 py-1.5"></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    {total > 0 && (
                        <div className="font-bold italic mt-2 text-[14px]">
                            (Bằng chữ: <span className="capitalize-first font-normal">{numberToWords(total)} đồng./.</span>)
                        </div>
                    )}
                </div>

                {/* Điều kiện giao hàng & thanh toán nhanh */}
                <div className="mb-6 text-[14px] border border-slate-200 bg-slate-50/50 p-4 rounded-lg">
                    <p className="font-bold mb-1.5 text-cyan-800">Thông tin tóm tắt điều kiện đơn hàng:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Địa điểm giao hàng: <span className="font-semibold">{data.deliveryLocation || 'Bà Rịa – Vũng Tàu'}</span></li>
                        <li>Thời gian giao hàng dự kiến: <span className="font-semibold">{data.deliveryTime || 'Theo thỏa thuận'}</span></li>
                        {data.advancePercent && (
                            <li>Thanh toán tạm ứng đặt cọc: <span className="font-semibold">{data.advancePercent}% giá trị đơn hàng ({formatCurrency(total * (Number(data.advancePercent) / 100))} đ)</span></li>
                        )}
                    </ul>
                </div>

                {/* Các điều khoản chi tiết */}
                <div className="mb-10 text-[14px] text-justify space-y-3">
                    {(data.clauses || []).map((clause, idx) => (
                        <div key={clause.id}>
                            <p className="font-bold mb-1">Mục {idx + 1}. {clause.title}</p>
                            <p className="whitespace-pre-line pl-3 text-slate-800">{clause.content}</p>
                        </div>
                    ))}
                </div>

                {/* Signatures */}
                <div className="mt-auto pt-6 text-[14px]" style={{ pageBreakInside: 'avoid' }}>
                    <table className="w-full text-center border-none" style={{ border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="w-1/2 align-top font-bold uppercase border-none" style={{ width: '50%', border: 'none' }}>
                                    ĐẠI DIỆN BÊN B (MUA)<br/>
                                    <span className="italic text-[11px] font-normal lowercase">(Ký, ghi rõ họ tên và đóng dấu)</span>
                                    <div className="h-24 flex items-center justify-center overflow-hidden my-1">
                                      {data.signatureB ? (
                                        <img src={data.signatureB} alt="Chữ ký Bên B" className="max-h-24 object-contain mix-blend-multiply" />
                                      ) : (
                                        <div className="h-16" />
                                      )}
                                    </div>
                                    <span className="text-[14px]">{data.partyBRep || '........................................'}</span>
                                </td>
                                <td className="w-1/2 align-top font-bold uppercase border-none" style={{ width: '50%', border: 'none' }}>
                                    ĐẠI DIỆN BÊN A (BÁN)<br/>
                                    <span className="italic text-[11px] font-normal lowercase">(Ký, ghi rõ họ tên và đóng dấu)</span>
                                    <div className="h-24 flex items-center justify-center overflow-hidden my-1">
                                      {data.signatureA ? (
                                        <img src={data.signatureA} alt="Chữ ký Bên A" className="max-h-24 object-contain mix-blend-multiply" />
                                      ) : (
                                        <div className="h-16" />
                                      )}
                                    </div>
                                    <span className="text-[14px]">{data.partyARep}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .capitalize-first { display: inline-block; }
                .capitalize-first::first-letter { text-transform: uppercase; }
            `}} />
        </div>
    );
};

export default OrderConfirmationPreview;
