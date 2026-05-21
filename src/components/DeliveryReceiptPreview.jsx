import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const DeliveryReceiptPreview = ({ data }) => {
    // Tính toán
    const totalQuantity = data.items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Format tiền tệ kiểu Việt Nam (dấu chấm)
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val);

    // Xử lý ngày tháng thành "Hà Nội, Ngày ... tháng ... năm ..."
    const formatDateObj = new Date(data.date);
    const dateFormatted = isNaN(formatDateObj.getTime()) ? '' : `Ngày ${String(formatDateObj.getDate()).padStart(2, '0')} tháng ${String(formatDateObj.getMonth() + 1).padStart(2, '0')} năm ${formatDateObj.getFullYear()}`;

    return (
        <div id="delivery-preview-content" className="bg-white text-black w-full max-w-[800px] shadow-2xl print:shadow-none min-h-[1123px] text-[13px] leading-relaxed relative print:m-0 print:p-0">
            {/* Outline Page Box for Print Preview Context */}
            <div className="p-8 md:p-12 h-full flex flex-col border border-transparent print:border-none">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-6 text-[12px]">
                    <div className="w-[60%]">
                        <div className="font-bold uppercase text-[14px] leading-tight mb-1">{data.companyName}</div>
                        <div className="uppercase mb-2 text-[12px]">{data.companySubtitle}</div>
                        <div>{data.companyAddress}</div>
                        <div>MST: {data.companyTax}</div>
                        <div>Email: {data.companyEmail} - Web: {data.companyWeb}</div>
                        <div>ĐT/FAX: {data.companyPhone}</div>
                    </div>
                    <div className="w-[40%] pl-4 text-center">
                        <div className="font-bold border-b border-black pb-1 mb-1 inline-block uppercase">Chuyên</div>
                        <div className="text-left italic whitespace-pre-line leading-tight">
                            {data.companySpecialty}
                        </div>
                    </div>
                </div>

                {/* Title Section */}
                <table style={{ width: '100%', border: 'none', marginBottom: '24px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '25%', border: 'none' }}></td>
                            <td style={{ width: '50%', textAlign: 'center', border: 'none' }}>
                                <div className="font-bold text-2xl uppercase tracking-wide">PHIẾU XUẤT KHO</div>
                                <div className="font-bold uppercase">(KIÊM BIÊN BẢN GIAO NHẬN HÀNG)</div>
                                <div className="italic">{dateFormatted}</div>
                            </td>
                            <td style={{ width: '25%', textAlign: 'right', verticalAlign: 'top', fontSize: '13px', border: 'none' }}>
                                Số: &nbsp;&nbsp;&nbsp;{data.id}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Customer Info */}
                <div className="mb-4">
                    <table className="w-full text-left font-medium">
                        <tbody>
                            <tr>
                                <td className="py-1 w-[120px]">Người nhận hàng:</td>
                                <td className="py-1">{data.customerContact}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px]">Đơn vị:</td>
                                <td className="py-1">{data.customerName}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px] align-top">Địa chỉ:</td>
                                <td className="py-1 align-top">{data.customerAddress}</td>
                            </tr>
                            <tr>
                                <td className="py-1 w-[120px] align-top">Nội dung:</td>
                                <td className="py-1 align-top">{data.deliveryReason}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Main Table */}
                <table border="1" className="w-full border-collapse border border-black text-center text-[12px] mb-2" style={{ width: '100%', borderCollapse: 'collapse', borderColor: 'black' }}>
                    <thead>
                        <tr className="bg-[#dcfce7] font-bold" style={{ backgroundColor: '#dcfce7' }}>
                            <th className="border border-black p-2 w-10">STT</th>
                            <th className="border border-black p-2 w-20">Mã kho</th>
                            <th className="border border-black p-2 w-20">Mã VT</th>
                            <th className="border border-black p-2">Tên hàng hóa, dịch vụ</th>
                            <th className="border border-black p-2 w-16">Đơn vị<br />tính</th>
                            <th className="border border-black p-2 w-16">Số lượng</th>
                            <th className="border border-black p-2 w-24">Đơn giá</th>
                            <th className="border border-black p-2 w-24">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => {
                            const itemTotal = item.quantity * item.price;
                            return (
                                <tr key={item.id}>
                                    <td className="border border-black p-1.5">{index + 1}</td>
                                    <td className="border border-black p-1.5">{item.warehouseCode}</td>
                                    <td className="border border-black p-1.5">{item.productCode}</td>
                                    <td className="border border-black p-1.5 text-left">{item.name}</td>
                                    <td className="border border-black p-1.5">{item.unit}</td>
                                    <td className="border border-black p-1.5">{item.quantity}</td>
                                    <td className="border border-black p-1.5 text-right">{formatCurrency(item.price)}</td>
                                    <td className="border border-black p-1.5 text-right font-bold">{formatCurrency(itemTotal)}</td>
                                </tr>
                            )
                        })}
                        {/* Summary Rows */}
                        <tr className="font-bold">
                            <td colSpan="5" className="border border-black p-2 text-left">Tổng cộng:</td>
                            <td className="border border-black p-2 text-center text-[13px]">{totalQuantity}</td>
                            <td className="border border-black p-2 border-r-0"></td>
                            <td className="border border-black p-2 text-right text-[13px]">{formatCurrency(totalAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan="8" className="border border-black p-2 text-left italic">
                                Số tiền viết bằng chữ: {numberToWords(totalAmount)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Notes & Signatures */}
                <div className="mt-2 text-[12px]">
                    <div className="mb-4">
                        Đề nghị quý khách hàng kiểm tra kỹ số lượng, chủng loại hàng hóa trước khi nhận hàng. Công ty chúng tôi không chịu trách nhiệm giải quyết khiếu nại hay thắc mắc về thiếu hay nhầm lẫn về hàng hóa sau khi đã ký nhận. <span className="italic">Xin cảm ơn quý khách!</span>
                    </div>

                    <div className="flex justify-end mb-4 italic pr-12">
                        Ngày ..... tháng ..... năm .........
                    </div>

                    <div className="flex justify-between text-center font-bold">
                        <div className="w-1/5">
                            <div>NGƯỜI LẬP PHIẾU</div>
                            <div className="italic font-normal text-xs mt-1">(Ký, họ tên)</div>
                        </div>
                        <div className="w-1/5">
                            <div>NGƯỜI GIAO HÀNG</div>
                            <div className="italic font-normal text-xs mt-1">(Ký, họ tên)</div>
                        </div>
                        <div className="w-1/5">
                            <div>THỦ KHO</div>
                            <div className="italic font-normal text-xs mt-1">(Ký, họ tên)</div>
                        </div>
                        <div className="w-1/5">
                            <div>NGƯỜI NHẬN HÀNG</div>
                            <div className="italic font-normal text-xs mt-1">(Ký, họ tên)</div>
                        </div>
                        <div className="w-1/5">
                            <div>GIÁM ĐỐC</div>
                            <div className="italic font-normal text-xs mt-1">(Ký, họ tên)</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DeliveryReceiptPreview;
