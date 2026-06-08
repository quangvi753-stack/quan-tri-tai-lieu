import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const AdvanceRequestPreview = ({ data }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    const basisLabel = data.basisType || 'Hợp đồng kinh tế';
    const basisLower = basisLabel.toLowerCase();

    // Xử lý ngày tháng
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `${data.requestLocation || 'Hà Nội'}, Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} Năm ${formatDateObj.getFullYear()}`;

    // Inline style font cho chuẩn công văn
    const printStyles = {
        fontFamily: "'Times New Roman', Times, serif"
    };

    return (
        <div id="advance-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[15px] leading-[1.6] relative print:m-0 print:p-0" style={printStyles}>
            <div className="px-16 py-12 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                <table className="w-full mb-6" style={{ width: '100%', border: 'none', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '45%', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', textTransform: 'uppercase', border: 'none', fontSize: '14px', padding: '0 10px' }}>
                                {data.companyName}
                                <div style={{ width: '120px', margin: '6px auto 0', borderTop: '1px solid black' }}></div>
                            </td>
                            <td style={{ width: '55%', textAlign: 'center', verticalAlign: 'top', border: 'none', padding: '0 10px' }}>
                                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '13px' }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '2px' }}>Độc lập - Tự do - Hạnh phúc</div>
                                <div style={{ width: '160px', margin: '6px auto 0', borderTop: '1px solid black' }}></div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Title Section */}
                <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', textTransform: 'uppercase', marginBottom: '4px' }}>GIẤY ĐỀ NGHỊ THANH TOÁN TẠM ỨNG</div>
                    <div style={{ fontStyle: 'italic', fontSize: '14.5px' }}>(V/V: Tạm ứng giá trị {basisLabel} {data.goodsDescription})</div>
                </div>

                {/* Content */}
                <div className="mb-8" style={{ textAlign: 'justify' }}>
                    <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                        <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Kính gửi</span>
                        <span style={{ fontWeight: 'bold' }}> : &nbsp;{data.sendTo?.toUpperCase()}</span>
                    </div>

                    <p style={{ textAlign: 'justify', marginBottom: '12px', fontSize: '15px', textIndent: '30px', lineHeight: '1.5' }}>
                        {data.basisParagraph !== undefined && data.basisParagraph !== '' 
                            ? data.basisParagraph 
                            : `Căn cứ ${basisLabel} Số: ${data.contractNumber || ''} giữa ${data.partyBName || ''} (Bên Mua) và ${data.companyName || ''} (Bên Bán) về việc ${data.goodsDescription || ''}`}
                    </p>

                    <p style={{ textAlign: 'justify', marginBottom: '16px', fontSize: '15px', textIndent: '30px', lineHeight: '1.5' }}>
                        {data.requestParagraph !== undefined && data.requestParagraph !== '' 
                            ? data.requestParagraph 
                            : `Vậy kính đề nghị Quý công ty thanh toán tạm ứng ${data.advancePercent || 0}% giá trị ${basisLower} (đã bao gồm VAT) ngay sau khi ${basisLower} được hai bên xác nhận, giá trị cụ thể như sau:`}
                    </p>

                    <div style={{ paddingLeft: '30px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '6px' }}>
                            1. Tổng giá trị {basisLower} <span style={{ fontWeight: 'bold' }}>{formatCurrency(data.totalContractValue || 0)} đồng</span> (đã bao gồm VAT)
                        </div>
                        <div style={{ marginBottom: '6px' }}>
                            2. Giá trị đề nghị thanh toán tạm ứng: <span style={{ fontWeight: 'bold' }}>{formatCurrency(data.advanceAmount || 0)} đồng</span>
                        </div>
                        <div style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            (Bằng chữ: <span className="capitalize-first">{numberToWords(data.advanceAmount || 0)}</span>)
                        </div>
                    </div>

                    <p style={{ textAlign: 'justify', marginBottom: '12px', fontSize: '15px', textIndent: '30px', lineHeight: '1.5' }}>
                        {data.bankIntroduction !== undefined && data.bankIntroduction !== '' 
                            ? data.bankIntroduction 
                            : `Để đảm bảo tiến độ xử lý đơn hàng, kính đề nghị Quý công ty tạm ứng kịp thời cho chúng tôi số tiền trên vào tài khoản sau:`}
                    </p>

                    <div style={{ paddingLeft: '30px', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '4px' }}>
                            - &nbsp;&nbsp;&nbsp;Tên tài khoản: <span style={{ fontWeight: 'bold' }}>{data.bankAccountName?.toUpperCase()}</span>
                        </div>
                        <div>
                            Số tài khoản: {data.bankAccountNumber}. {data.bankName}
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', fontStyle: 'italic', margin: '24px 0', fontSize: '15px' }}>
                        Cảm ơn vì sự tin tưởng và ủng hộ của Quý công ty !
                    </p>

                    {/* Footer Signature */}
                    <table style={{ width: '100%', border: 'none', borderCollapse: 'collapse', marginTop: '30px' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', border: 'none' }}></td>
                                <td style={{ width: '50%', textAlign: 'center', border: 'none', fontSize: '15px', lineHeight: '1.5' }}>
                                    <div style={{ fontStyle: 'italic', marginBottom: '4px', fontSize: '14px' }}>
                                        {dateFormatted}
                                    </div>
                                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        {data.companyName}
                                    </div>
                                    <div className="h-24 flex items-center justify-center overflow-hidden my-1">
                                      {data.signatureA ? (
                                        <img src={data.signatureA} alt="Chữ ký" className="max-h-24 object-contain mix-blend-multiply" />
                                      ) : (
                                        <div className="h-16" />
                                      )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
