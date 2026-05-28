import React from 'react';
import { numberToWords } from '../utils/numberToWords';

const ContractPreview = ({ data }) => {

    // Tính tổng tiền bao gồm cả thuế
    const calculateTotal = () => {
        const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        return subtotal + (subtotal * (data.taxRate / 100));
    };

    const totalValue = calculateTotal();
    const totalValueInWords = numberToWords(totalValue);

    return (
        <div className="w-full max-w-[850px] mx-auto bg-transparent border-none">
            {/* Richtext Document Editor Block */}
            <div id="contract-preview-content" className="bg-white p-10 md:p-14 lg:p-[80px] text-[12pt] font-['Times_New_Roman',_Times,_serif] text-slate-900 shadow-xl print:shadow-none min-h-[1122px] w-[794px] mx-auto box-border" style={{ lineHeight: '1.5' }}>

                {/* Header: Quốc hiệu, tiêu ngữ */}
                <table className="w-full mb-8" style={{ border: 'none', width: '100%' }}>
                    <tbody>
                        <tr>
                            <td className="w-[40%] text-center align-top" style={{ border: 'none', width: '40%' }}>
                                <p className="font-bold text-[12pt] uppercase mb-1">CÔNG TY TNHH QVN VIỆT NAM</p>
                                <p className="font-bold text-[12pt] border-b-[1.5px] border-slate-900 inline-block pb-0.5 mb-1 text-center min-w-[120px]">Số: {data.id}</p>
                            </td>
                            <td className="w-[60%] text-center align-top" style={{ border: 'none', width: '60%' }}>
                                <h2 className="text-[13pt] font-bold uppercase tracking-wide mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                                <p className="text-[13pt] font-bold mb-1 border-b-[1.5px] border-slate-900 inline-block pb-0.5">Độc lập - Tự do - Hạnh phúc</p>
                                <p className="italic mt-4 text-[12pt]">Hà Nội, ngày {data.date ? new Date(data.date).getDate().toString().padStart(2, '0') : '...'} tháng {data.date ? (new Date(data.date).getMonth() + 1).toString().padStart(2, '0') : '...'} năm {data.date ? new Date(data.date).getFullYear() : '20...'}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Tiêu đề Hợp đồng */}
                <div className="text-center mb-8" style={{ textAlign: 'center' }}>
                    <h1 className="text-[16pt] font-bold uppercase mb-2">
                        {data.documentType !== 'contract' ? 'PHỤ LỤC HỢP ĐỒNG KINH TẾ' : 'HỢP ĐỒNG KINH TẾ'}
                    </h1>
                    {data.documentType !== 'contract' ? (
                        <p className="italic font-normal">(Kèm theo Hợp đồng kinh tế số: <span className="font-bold">{data.appendixForId || '...............'}</span> ký ngày <span className="font-bold">{data.appendixForDate ? new Date(data.appendixForDate).getDate().toString().padStart(2, '0') + '/' + (new Date(data.appendixForDate).getMonth() + 1).toString().padStart(2, '0') + '/' + new Date(data.appendixForDate).getFullYear() : '...'}</span>)</p>
                    ) : (
                        <p className="italic font-normal">(V/v: Mua bán hàng hóa/dịch vụ)</p>
                    )}
                </div>

                {/* Căn cứ pháp lý */}
                <div className="mb-6 italic text-justify">
                    {data.legalBases.split('\n').map((line, i) => (
                        <p key={i} className="mb-1">{line}</p>
                    ))}
                </div>

                <div className="mb-6 text-justify">
                    <p>Hôm nay, ngày <span className="font-bold">{data.date ? new Date(data.date).getDate().toString().padStart(2, '0') : '...'}</span> tháng <span className="font-bold">{data.date ? (new Date(data.date).getMonth() + 1).toString().padStart(2, '0') : '...'}</span> năm <span className="font-bold">{data.date ? new Date(data.date).getFullYear() : '20...'}</span>, tại <span className="font-bold">{data.location || '...................................................'}</span>, chúng tôi gồm:</p>
                </div>

                {/* Thông tin Bên A */}
                <div className="mb-6">
                    <h3 className="font-bold uppercase text-[12pt] mb-2 underline">BÊN BÁN (BÊN A): {data.partyAName}</h3>
                    <table className="w-full" style={{ border: 'none', width: '100%' }}>
                        <tbody>
                            <tr>
                                <td className="w-[120px] font-bold align-top py-1 text-left" style={{ border: 'none' }}>Địa chỉ:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{data.partyAAddress}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Điện thoại:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{data.partyAPhone}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Mã số thuế:</td>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>{data.partyATax}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Tài khoản số:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{(data.partyABank || '...........................................') + ' tại ngân hàng ' + (data.partyABankName || '..........')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Đại diện:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>
                                    <span className="font-bold">{data.partyARep}</span>
                                    <span style={{ display: 'inline-block', width: '40px' }}>&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="font-bold">Chức vụ:</span> {data.partyARole}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Thông tin Bên B */}
                <div className="mb-6">
                    <h3 className="font-bold uppercase text-[12pt] mb-2 underline">BÊN MUA (BÊN B): {data.partyBName || '........................................................'}</h3>
                    <table className="w-full" style={{ border: 'none', width: '100%' }}>
                        <tbody>
                            <tr>
                                <td className="w-[120px] font-bold align-top py-1 text-left" style={{ border: 'none' }}>Địa chỉ:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{data.partyBAddress || '..................................................................................................'}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Điện thoại:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{data.partyBPhone || '........................................................'}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Mã số thuế:</td>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>{data.partyBTax || '........................................................'}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Tài khoản số:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>{(data.partyBBank || '...........................................') + ' tại ngân hàng ' + (data.partyBBankName || '..........')}</td>
                            </tr>
                            <tr>
                                <td className="font-bold py-1 text-left" style={{ border: 'none' }}>Đại diện:</td>
                                <td className="py-1 text-left" style={{ border: 'none' }}>
                                    <span className="font-bold">{data.partyBRep || '................................................'}</span>
                                    <span style={{ display: 'inline-block', width: '40px' }}>&nbsp;&nbsp;&nbsp;&nbsp;</span><span className="font-bold">Chức vụ:</span> {data.partyBRole || '.....................'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-6 text-justify">
                    <p>{data.documentType !== 'contract' ? 'Hai bên thống nhất ký kết Phụ lục Hợp đồng với các điều khoản sau:' : 'Hai bên thống nhất ký kết Hợp đồng kinh tế với các điều khoản sau:'}</p>
                </div>

                {/* Các Điều khoản */}
                <div className="space-y-6 text-justify">
                    {data.documentType !== 'contract' && (
                        <div className="mb-2 text-justify">
                            {data.appendixContent.split('\n').map((line, i) => (
                                <p key={i} className="mb-1">{line}</p>
                            ))}
                        </div>
                    )}

                    {/* Điều 1 / Options Item Table */}
                    {(data.documentType !== 'appendix_addition' || (data.items && data.items.length > 0)) && (
                        <div>
                            {data.documentType === 'contract' ? (
                                <>
                                    <h3 className="font-bold uppercase mb-2">ĐIỀU 1: HÀNG HÓA VÀ GIÁ TRỊ HỢP ĐỒNG</h3>
                                    <p className="mb-3">Bên A đồng ý bán và Bên B đồng ý mua số lượng hàng hóa/dịch vụ chi tiết như sau:</p>
                                </>
                            ) : (
                                <h3 className="font-bold mb-2">BẢNG CHI TIẾT HÀNG HÓA/DỊCH VỤ ĐÍNH KÈM:</h3>
                            )}

                            {data.documentType === 'appendix_addition' ? (
                                <table border="1" className="w-full border-collapse border border-solid border-black my-4 text-[11pt]" style={{ width: '100%', borderCollapse: 'collapse', borderColor: 'black', border: '1px solid black' }}>
                                    <thead>
                                        <tr className="font-bold text-center bg-[#e5e7eb]" style={{ backgroundColor: '#e5e7eb' }}>
                                            <th className="p-3 border border-solid border-black" style={{ width: '15%', border: '1px solid black' }}>STT</th>
                                            <th className="p-3 border border-solid border-black" style={{ width: '85%', border: '1px solid black' }}>Chủng loại/Quy cách hàng hóa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="p-4 border border-solid border-black text-center text-[11pt]" style={{ border: '1px solid black' }}>{index + 1}</td>
                                                <td className="p-4 border border-solid border-black text-left font-bold text-[11pt]" style={{ border: '1px solid black' }}>{item.name || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table border="1" className="w-full border-collapse border border-solid border-black my-4 text-[11pt]" style={{ width: '100%', borderCollapse: 'collapse', borderColor: 'black', border: '1px solid black' }}>
                                    <thead>
                                        <tr className="font-bold text-center">
                                            <th className="p-2 border border-solid border-black" style={{ width: '40px', border: '1px solid black' }}>STT</th>
                                            <th className="p-2 border border-solid border-black" style={{ border: '1px solid black' }}>Tên hàng hóa, quy cách</th>
                                            {data.documentType === 'appendix_quantity' && (
                                                <th className="p-2 border border-solid border-black" style={{ width: '96px', border: '1px solid black' }}>Hình ảnh</th>
                                            )}
                                            <th className="p-2 border border-solid border-black" style={{ width: '64px', border: '1px solid black' }}>ĐVT</th>
                                            <th className="p-2 border border-solid border-black" style={{ width: '64px', border: '1px solid black' }}>SL</th>
                                            {data.documentType === 'appendix_quantity' ? (
                                                <th className="p-2 border border-solid border-black" style={{ width: '96px', border: '1px solid black' }}>Ghi chú</th>
                                            ) : (
                                                <>
                                                    <th className="p-2 border border-solid border-black" style={{ width: '112px', border: '1px solid black' }}>Đơn giá (VNĐ)</th>
                                                    <th className="p-2 border border-solid border-black" style={{ width: '128px', border: '1px solid black' }}>Thành tiền (VNĐ)</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="p-2 border border-solid border-black text-center align-middle" style={{ border: '1px solid black' }}>{index + 1}</td>
                                                <td className="p-2 border border-solid border-black text-left align-middle" style={{ border: '1px solid black' }}>{item.name || ''}</td>
                                                {data.documentType === 'appendix_quantity' && (
                                                    <td className="p-2 border border-solid border-black text-center align-middle" style={{ height: '70px', border: '1px solid black' }}>
                                                        {item.image && <img src={item.image} alt="Hinh" width="70" height="70" style={{ maxWidth: '70px', maxHeight: '70px', display: 'block', margin: '0 auto', objectFit: 'contain' }} />}
                                                    </td>
                                                )}
                                                <td className="p-2 border border-solid border-black text-center align-middle" style={{ border: '1px solid black' }}>{item.unit || ''}</td>
                                                <td className="p-2 border border-solid border-black text-center align-middle" style={{ border: '1px solid black' }}>{item.quantity > 0 ? item.quantity : ''}</td>
                                                {data.documentType === 'appendix_quantity' ? (
                                                    <td className="p-2 border border-solid border-black text-left align-middle" style={{ border: '1px solid black' }}>{item.note || ''}</td>
                                                ) : (
                                                    <>
                                                        <td className="p-2 border border-solid border-black text-right align-middle" style={{ border: '1px solid black' }}>{item.price > 0 ? item.price.toLocaleString() : ''}</td>
                                                        <td className="p-2 border border-solid border-black text-right align-middle" style={{ border: '1px solid black' }}>
                                                            {(item.quantity > 0 && item.price > 0) ? (item.quantity * item.price).toLocaleString() : ''}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                        {/* Hàng Tổng */}
                                        {data.documentType !== 'appendix_quantity' && (
                                            <>
                                                <tr>
                                                    <td colSpan={5} className="p-2 border border-solid border-black font-bold text-right uppercase" style={{ border: '1px solid black' }}>
                                                        Tổng cộng tiền hàng:
                                                    </td>
                                                    <td className="p-2 border border-solid border-black font-bold text-right" style={{ border: '1px solid black' }}>
                                                        {data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={5} className="p-2 border border-solid border-black font-bold text-right uppercase" style={{ border: '1px solid black' }}>
                                                        Thuế GTGT ({data.taxRate}%):
                                                    </td>
                                                    <td className="p-2 border border-solid border-black font-bold text-right" style={{ border: '1px solid black' }}>
                                                        {(data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0) * (data.taxRate / 100)).toLocaleString()}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={5} className="p-2 border border-solid border-black font-bold text-right uppercase" style={{ border: '1px solid black' }}>
                                                        Tổng GIÁ TRỊ HỢP ĐỒNG ĐÃ BAO GỒM THUẾ (VNĐ):
                                                    </td>
                                                    <td className="p-2 border border-solid border-black font-bold text-right" style={{ border: '1px solid black' }}>
                                                        {totalValue.toLocaleString()}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            )}
                            {data.documentType === 'contract' && (
                                <p className="mt-2 text-[12pt]">
                                    <span className="font-bold underline italic">Bằng chữ:</span> <span className="font-bold">{totalValueInWords}./.</span>
                                </p>
                            )}
                        </div>
                    )}

                    {data.documentType === 'contract' && data.clauses && data.clauses.map((clause, index) => (
                        <div key={clause.id} className="mb-4">
                            <h3 className="font-bold uppercase mb-2">ĐIỀU {index + 2}: {clause.title}</h3>
                            <div className="text-justify">
                                {clause.content.split('\n').map((line, i) => (
                                    <p key={i} className="mb-1">{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chữ ký */}
                <table className="w-full mt-12 mb-20 text-center" style={{ width: '100%', border: 'none', marginTop: '48px', marginBottom: '80px' }}>
                    <tbody>
                        <tr>
                            <td className="w-[45%] align-top" style={{ width: '45%', border: 'none' }}>
                                <h3 className="font-bold text-[12pt] uppercase mb-1">ĐẠI DIỆN BÊN A</h3>
                                <p className="text-[11pt] italic mb-24" style={{ marginBottom: '96px' }}>(Chữ ký, họ tên, đóng dấu)</p>
                                <p className="font-bold">{data.partyARep}</p>
                            </td>
                            <td className="w-[10%]" style={{ width: '10%', border: 'none' }}></td>
                            <td className="w-[45%] align-top" style={{ width: '45%', border: 'none' }}>
                                <h3 className="font-bold text-[12pt] uppercase mb-1">ĐẠI DIỆN BÊN B</h3>
                                <p className="text-[11pt] italic mb-24" style={{ marginBottom: '96px' }}>(Chữ ký, họ tên, đóng dấu)</p>
                                <p className="font-bold">{data.partyBRep || '........................................'}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default ContractPreview;
