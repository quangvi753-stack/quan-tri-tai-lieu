import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const PaymentRequestPreview = ({ data }) => {
    // Tính tổng
    const total = data.items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    // Xử lý ngày tháng
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} năm ${formatDateObj.getFullYear()}`;

    return (
        <div id="payment-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[14px] leading-relaxed relative print:m-0 print:p-0 font-display">
            <div className="p-10 md:p-14 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                <table className="w-full mb-8 text-[13px] font-bold" style={{ width: '100%', border: 'none' }}>
                    <tbody>
                        <tr>
                            <td className="w-[50%] align-top text-left uppercase" style={{ width: '50%', border: 'none' }}>
                                <div>Đơn vị: {data.companyName}</div>
                                <div>Bộ phận: {data.department}</div>
                            </td>
                            <td className="w-[50%] text-center align-top" style={{ width: '50%', border: 'none' }}>
                                <div>Mẫu số: 05-TT</div>
                                <div className="font-normal italic">(Ban hành theo Thông tư số 200/2014/TT-BTC<br />Ngày 22/12/2014 của Bộ Tài chính)</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title Section */}
                <div className="text-center mb-10">
                    <div className="font-black text-[22px] uppercase tracking-wide mb-1">GIẤY ĐỀ NGHỊ THANH TOÁN</div>
                    <div className="italic text-[13px]">{dateFormatted}</div>
                </div>

                {/* Info Text */}
                <div className="mb-6 leading-[1.8] text-[15px]">
                    <div className="flex mb-1">
                        <div className="w-[180px] font-bold shrink-0">Kính gửi:</div>
                        <div className="flex-1 font-bold border-b border-dotted border-black leading-tight flex items-end">{data.sendTo}</div>
                    </div>
                    <div className="flex mb-1">
                        <div className="w-[180px] shrink-0">Họ và tên người đề nghị:</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end">{data.requesterName}</div>
                    </div>
                    <div className="flex mb-1">
                        <div className="w-[180px] shrink-0">Bộ phận (Phòng/Ban):</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end">{data.department}</div>
                    </div>
                    <div className="flex mb-1 mt-3">
                        <div className="w-[180px] shrink-0">Nội dung thanh toán:</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end italic">{data.reason}</div>
                    </div>
                    <div className="flex mb-1 mt-1">
                        <div className="w-[180px] shrink-0 font-bold">Số tiền:</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end font-bold">{formatCurrency(total)} VNĐ</div>
                    </div>
                    <div className="flex mb-1">
                        <div className="w-[180px] shrink-0">Viết bằng chữ:</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end italic font-medium capitalize-first">{numberToWords(total)}</div>
                    </div>
                    <div className="flex mb-1">
                        <div className="w-[180px] shrink-0">Kèm theo:</div>
                        <div className="flex-1 border-b border-dotted border-black leading-tight flex items-end">{data.attachedDocs}</div>
                        <div className="w-[150px] shrink-0 text-right ml-2">chứng từ gốc.</div>
                    </div>
                </div>

                {/* Main Table Detail */}
                <div className="mb-6">
                    <div className="font-bold underline mb-2">Chi tiết thanh toán:</div>
                    <table border="1" className="w-full border-collapse border border-black text-[13px]" style={{ width: '100%', borderCollapse: 'collapse', borderColor: 'black' }}>
                        <thead>
                            <tr className="font-bold text-center">
                                <th className="border border-black p-2" style={{ width: '50px' }}>STT</th>
                                <th className="border border-black p-2">Nội dung chi tiết</th>
                                <th className="border border-black p-2" style={{ width: '140px' }}>Số tiền (VNĐ)</th>
                                <th className="border border-black p-2" style={{ width: '120px' }}>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2 text-left">{item.description}</td>
                                    <td className="border border-black p-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                    <td className="border border-black p-2 text-center">{item.note}</td>
                                </tr>
                            ))}
                            <tr className="font-bold text-center bg-slate-50">
                                <td colSpan="2" className="border border-black p-2 uppercase text-right">Tổng cộng:</td>
                                <td className="border border-black p-2 text-right text-[14px]">{formatCurrency(total)}</td>
                                <td className="border border-black p-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer Signatures */}
                <div className="mt-8 flex-1">
                    <table className="w-full text-center font-bold" style={{ width: '100%', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td className="w-1/4 align-top" style={{ width: '25%', border: 'none' }}>
                                    <div>Giám đốc</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                </td>
                                <td className="w-1/4 align-top" style={{ width: '25%', border: 'none' }}>
                                    <div>Kế toán trưởng</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                </td>
                                <td className="w-1/4 align-top" style={{ width: '25%', border: 'none' }}>
                                    <div>Phụ trách bộ phận</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                </td>
                                <td className="w-1/4 align-top" style={{ width: '25%', border: 'none' }}>
                                    <div>Người đề nghị</div>
                                    <div className="italic font-normal text-xs mt-1" style={{ fontWeight: 'normal' }}>(Ký, họ tên)</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="h-[120px]"></div> {/* Space for signatures */}
                </div>
            </div>

            {/* Scoped CSS for capitalzing first letter in React safely inline */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .capitalize-first { display: inline-block; }
                .capitalize-first::first-letter { text-transform: uppercase; }
            `}} />
        </div>
    );
};

export default PaymentRequestPreview;
