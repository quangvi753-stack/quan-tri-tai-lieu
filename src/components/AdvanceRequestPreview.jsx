import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const AdvanceRequestPreview = ({ data }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    // Xử lý ngày tháng
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `${data.requestLocation || 'Hà Nội'}, Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} Năm ${formatDateObj.getFullYear()}`;

    // Inline style font cho chuẩn công văn
    const printStyles = {
        fontFamily: "'Times New Roman', Times, serif"
    };

    return (
        <div id="advance-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[16px] leading-[1.6] relative print:m-0 print:p-0" style={printStyles}>
            <div className="px-16 py-12 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                <table className="w-full mb-10 text-[15px]" style={{ width: '100%', border: 'none' }}>
                    <tbody>
                        <tr>
                            <td className="w-[45%] text-center align-top font-bold uppercase" style={{ width: '45%', border: 'none' }}>
                                {data.companyName}
                            </td>
                            <td className="w-[55%] text-center align-top" style={{ width: '55%', border: 'none' }}>
                                <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div className="font-bold underline" style={{ textUnderlineOffset: '4px' }}>Độc Lập-Tự Do-Hạnh Phúc</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title Section */}
                <div className="text-center mb-8 mt-12">
                    <div className="font-bold text-[20px] uppercase tracking-wide mb-1">GIẤY ĐỀ NGHỊ THANH TOÁN TẠM ỨNG</div>
                    <div className="italic text-[16px] font-normal">(V/V: Tạm ứng giá trị Hợp Đồng {data.goodsDescription})</div>
                </div>

                {/* Content */}
                <div className="mb-8 text-justify">
                    <div className="mb-6 flex">
                        <div className="inline-block font-bold">
                            <span className="underline" style={{ textUnderlineOffset: '3px' }}>Kính gửi</span>
                            <span> :  &nbsp; {data.sendTo}</span>
                        </div>
                    </div>

                    <p className="mb-4 text-justify" style={{ textIndent: '30px' }}>
                        Căn cứ Hợp đồng kinh tế Số: {data.contractNumber} giữa {data.partyBName} (Bên Mua)
                        và {data.companyName} (Bên Bán) về việc {data.goodsDescription}
                    </p>

                    <p className="mb-4 text-justify" style={{ textIndent: '30px' }}>
                        Vậy kính đề nghị Quý công ty thanh toán tạm ứng {data.advancePercent}% giá trị hợp đồng (đã bao gồm VAT)
                        ngay sau khi Hợp Đồng được ký kết, giá trị cụ thể như sau;
                    </p>

                    <div className="pl-8 mb-4">
                        <div className="mb-3">
                            1. Tổng giá trị hợp đồng <span className="font-bold">{formatCurrency(data.totalContractValue || 0)} đồng (đã bao gồm VAT)</span>
                        </div>
                        <div className="mb-3">
                            2. Giá trị đề nghị thanh toán tạm ứng: <span className="font-bold text-[18px]">{formatCurrency(data.advanceAmount || 0)} đồng</span>
                        </div>
                        <div className="font-bold italic mt-2">
                            (Bằng chữ: <span className="capitalize-first">{numberToWords(data.advanceAmount || 0)}</span>. )
                        </div>
                    </div>

                    <p className="mb-4 text-justify">
                        Để đảm tiến độ xử lý đơn hàng rất Quý công ty tạm ứng kịp thời cho chúng tôi số tiền trên vào tài khoản sau
                    </p>

                    <div className="pl-8 mb-8">
                        <div>
                            - &nbsp;&nbsp;&nbsp;Tên tài khoản: <span style={{ fontFamily: "Arial, Helvetica, sans-serif" }} className="text-[#3b82f6]">{data.bankAccountName}</span>
                        </div>
                        <div>
                            Số tài khoản: {data.bankAccountNumber}. {data.bankName}
                        </div>
                    </div>

                    <p className="mb-12 text-justify text-[16px]" style={{ textIndent: '30px' }}>
                        Cảm ơn vì sự tin tưởng và ủng hộ của Quý công ty !
                    </p>

                    {/* Footer Signature */}
                    <div className="flex flex-col items-end pt-4" style={{ width: '100%' }}>
                        <div className="w-[50%] text-center">
                            <div className="italic mb-4">
                                {dateFormatted}
                            </div>
                            <div className="font-bold text-[18px] uppercase tracking-wide">
                                {data.companyName}
                            </div>
                            <div className="h-[120px]"></div> {/* Space for signature */}
                        </div>
                    </div>
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

export default AdvanceRequestPreview;
