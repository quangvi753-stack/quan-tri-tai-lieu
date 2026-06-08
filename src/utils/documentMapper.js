// Tiện ích ánh xạ và đồng bộ dữ liệu chéo giữa các loại chứng từ

// Tính tổng giá trị danh sách hàng hóa có thuế suất
const calculateTotalWithTax = (items = [], taxRate = 8) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * (taxRate / 100);
  return subtotal + tax;
};

export const mapQuoteToContract = (quoteData) => {
  return {
    documentType: 'contract',
    id: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}/QVN`,
    date: new Date().toISOString().split('T')[0],
    location: 'trụ sở Công ty TNHH QVN Việt Nam',
    legalBases: '- Căn cứ Bộ Luật Dân sự 2015;\n- Căn cứ Luật Thương mại 2005;\n- Căn cứ vào nhu cầu và khả năng thực tế của hai bên ký kết hợp đồng.',
    generalTerms: '7.1. Hợp đồng có hiệu lực có hiệu lực từ ngày ký và tự động thanh lý sau khi hai bên hoàn thành đầy đủ các nghĩa vụ được nêu trong hợp đồng.\n7.2. Các phụ lục kèm theo là một phần cơ bản không thể tách rời của Hợp đồng này. Việc điều chỉnh, chuyển nhượng, thay đổi hay sửa đổi của Hợp đồng này phải được lập thành bằng văn bản và chỉ có hiệu lực khi được đại diện có đủ thẩm quyền của hai Bên ký kết.\n7.3. Hai bên cam kết thực hiện nghiêm chỉnh và đúng theo các điều khoản của hợp đồng này...',
    partyAName: quoteData.companyName || 'CÔNG TY TNHH QVN VIỆT NAM',
    partyAAddress: quoteData.companyAddress || 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    partyATax: quoteData.companyTax || '0110990938',
    partyARep: quoteData.preparedBy || 'Ông Vi Nguyễn Quang',
    partyARole: 'Giám Đốc',
    partyAPhone: quoteData.companyPhone || '0912.5283.16',
    partyABank: '3656866789',
    partyABankName: 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    partyBName: quoteData.customerName || '',
    partyBAddress: quoteData.customerAddress || '',
    partyBTax: quoteData.customerTax || '',
    partyBRep: quoteData.representative || '',
    partyBRole: '',
    partyBPhone: quoteData.customerPhone || '',
    partyBBank: '',
    partyBBankName: '',
    items: (quoteData.items || []).map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      unit: item.unit || 'Cái',
      quantity: item.quantity,
      price: item.price,
      image: item.image || '',
      note: ''
    })),
    taxRate: quoteData.taxRate || 8,
    clauses: [
      {
        id: 'c1',
        title: 'THỜI GIAN VÀ ĐỊA ĐIỂM GIAO HÀNG',
        content: `2.1. Thời gian giao hàng: Dự kiến từ 7-15 ngày kể từ ngày nhận tạm ứng.\n2.2. Địa điểm giao hàng: Tại địa chỉ của Bên B.`
      },
      {
        id: 'c2',
        title: 'HÌNH THỨC THANH TOÁN',
        content: `3.1. Hình thức thanh toán: Chuyển khoản.\n3.2. Tiến độ thanh toán:\n- Tạm ứng: 50% ngay sau khi ký hợp đồng.\n- Thanh toán: 50% còn lại sau khi nhận đủ hàng và chứng từ thanh toán.`
      }
    ]
  };
};

export const mapQuoteToOrderConfirm = (quoteData) => {
  return {
    id: `XN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}/QVN`,
    date: new Date().toISOString().split('T')[0],
    location: 'trụ sở Công ty TNHH QVN Việt Nam',
    basisType: 'Báo giá',
    basisNumber: quoteData.id || '',
    partyAName: quoteData.companyName || 'CÔNG TY TNHH QVN VIỆT NAM',
    partyAAddress: quoteData.companyAddress || 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    partyATax: quoteData.companyTax || '0110990938',
    partyARep: quoteData.preparedBy || 'Ông Vi Nguyễn Quang',
    partyBName: quoteData.customerName || '',
    partyBAddress: quoteData.customerAddress || '',
    partyBTax: quoteData.customerTax || '',
    partyBRep: quoteData.representative || '',
    partyBRole: '',
    partyBPhone: quoteData.customerPhone || '',
    deliveryLocation: quoteData.customerAddress || '',
    deliveryTime: 'Theo thỏa thuận (dự kiến trong vòng 7 - 10 ngày)',
    advancePercent: '50',
    taxRate: quoteData.taxRate || 8,
    items: (quoteData.items || []).map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      unit: item.unit || 'Cái',
      quantity: item.quantity,
      price: item.price,
      image: item.image || '',
      specs: item.specs || '',
      note: ''
    })),
    clauses: [
      {
        id: 'c1',
        title: 'Thời gian và Địa điểm giao hàng',
        content: '1. Thời gian giao nhận: Dự kiến trong vòng 7 - 10 ngày kể từ ngày Bên A nhận được khoản tạm ứng đợt 1.\n2. Địa điểm giao hàng: Tại địa chỉ Bên B.'
      },
      {
        id: 'c2',
        title: 'Thanh toán và Tạm ứng đặt cọc',
        content: '1. Phương thức thanh toán: Chuyển khoản.\n2. Tiến độ thanh toán:\n- Đợt 1: Tạm ứng đặt cọc 50% giá trị đơn hàng ngay sau khi ký biên bản này.\n- Đợt 2: Thanh toán 50% giá trị còn lại ngay sau khi nhận đầy đủ hàng hóa.'
      }
    ]
  };
};

export const mapContractToAdvance = (contractData) => {
  const totalVal = calculateTotalWithTax(contractData.items, contractData.taxRate);
  return {
    id: `TU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    companyName: contractData.partyAName || 'CÔNG TY TNHH QVN VIỆT NAM',
    sendTo: contractData.partyBName || '',
    contractNumber: contractData.id || '',
    partyBName: contractData.partyBName || '',
    goodsDescription: 'mua các thiết bị theo hợp đồng kinh tế',
    advancePercent: '50',
    totalContractValue: Math.round(totalVal),
    advanceAmount: Math.round(totalVal * 0.5),
    bankAccountName: 'QVN VN COM CO., LTD',
    bankAccountNumber: contractData.partyABank || '3656866789',
    bankName: contractData.partyABankName || 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    requestLocation: 'Hà Nội'
  };
};

export const mapContractToPayment = (contractData) => {
  const totalVal = calculateTotalWithTax(contractData.items, contractData.taxRate);
  return {
    id: `TT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    companyName: contractData.partyAName || 'CÔNG TY TNHH QVN VIỆT NAM',
    sendTo: contractData.partyBName || '',
    contractNumber: contractData.id || '',
    partyBName: contractData.partyBName || '',
    goodsDescription: 'mua các thiết bị theo hợp đồng kinh tế',
    paymentPercent: '50',
    totalContractValue: Math.round(totalVal),
    paidAmount: Math.round(totalVal * 0.5),
    paymentAmount: Math.round(totalVal * 0.5),
    bankAccountName: 'QVN VN COM CO., LTD',
    bankAccountNumber: contractData.partyABank || '3656866789',
    bankName: contractData.partyABankName || 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    requestLocation: 'Hà Nội'
  };
};

export const mapContractToDelivery = (contractData) => {
  return {
    id: `XK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    companyName: contractData.partyAName || 'CÔNG TY TNHH QVN VIỆT NAM',
    companySubtitle: 'NHÀ PHÂN PHỐI BẢO HỘ LAO ĐỘNG',
    companyAddress: contractData.partyAAddress || 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    companyTax: contractData.partyATax || '0110990938',
    companyEmail: 'salesqvn@gmail.com',
    companyWeb: 'Baohoalaodongqvn.com.vn',
    companyPhone: contractData.partyAPhone || '0912.5283.16',
    companySpecialty: '* Sản xuất kinh doanh, đại lý phân phối thiết bị\nan toàn lao động: giầy, mũ, ủng, quần áo...\n\n* Cung cấp thiết bị PCCC...\n* Cung cấp vật tư phụ, hàng kim khí tổng hợp',
    customerContact: contractData.partyBRep || '',
    customerName: contractData.partyBName || '',
    customerAddress: contractData.partyBAddress || '',
    deliveryReason: 'Xuất bán hàng theo hợp đồng ' + (contractData.id || ''),
    items: (contractData.items || []).map((item, idx) => ({
      id: idx + 1,
      warehouseCode: 'KHO1',
      productCode: `0403${1000 + idx}`,
      name: item.name,
      unit: item.unit || 'Cái',
      quantity: item.quantity,
      price: item.price
    }))
  };
};

export const mapQuoteToDelivery = (quoteData) => {
  return {
    id: `XK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    companyName: quoteData.companyName || 'CÔNG TY TNHH QVN VIỆT NAM',
    companySubtitle: 'NHÀ PHÂN PHỐI BẢO HỘ LAO ĐỘNG',
    companyAddress: quoteData.companyAddress || 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    companyTax: quoteData.companyTax || '0110990938',
    companyEmail: 'salesqvn@gmail.com',
    companyWeb: 'Baohoalaodongqvn.com.vn',
    companyPhone: quoteData.companyPhone || '0912.5283.16',
    companySpecialty: '* Sản xuất kinh doanh, đại lý phân phối thiết bị\nan toàn lao động: giầy, mũ, ủng, quần áo...\n\n* Cung cấp thiết bị PCCC...\n* Cung cấp vật tư phụ, hàng kim khí tổng hợp',
    customerContact: quoteData.representative || '',
    customerName: quoteData.customerName || '',
    customerAddress: quoteData.customerAddress || '',
    deliveryReason: 'Xuất bán hàng theo báo giá ' + (quoteData.id || ''),
    items: (quoteData.items || []).map((item, idx) => ({
      id: idx + 1,
      warehouseCode: 'KHO1',
      productCode: `0403${1000 + idx}`,
      name: item.name,
      unit: item.unit || 'Cái',
      quantity: item.quantity,
      price: item.price
    }))
  };
};

export const mapOrderConfirmToContract = (orderConfirmData) => {
  return {
    documentType: 'contract',
    id: `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}/QVN`,
    date: new Date().toISOString().split('T')[0],
    location: 'trụ sở Công ty TNHH QVN Việt Nam',
    legalBases: '- Căn cứ Bộ Luật Dân sự 2015;\n- Căn cứ Luật Thương mại 2005;\n- Căn cứ vào nhu cầu và khả năng thực tế của hai bên ký kết hợp đồng.',
    generalTerms: '7.1. Hợp đồng có hiệu lực có hiệu lực từ ngày ký...',
    partyAName: orderConfirmData.partyAName || 'CÔNG TY TNHH QVN VIỆT NAM',
    partyAAddress: orderConfirmData.partyAAddress || 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    partyATax: orderConfirmData.partyATax || '0110990938',
    partyARep: orderConfirmData.partyARep || 'Ông Vi Nguyễn Quang',
    partyARole: 'Giám Đốc',
    partyAPhone: '0912.5283.16',
    partyABank: '3656866789',
    partyABankName: 'Ngân hàng Techcombank',
    partyBName: orderConfirmData.partyBName || '',
    partyBAddress: orderConfirmData.partyBAddress || '',
    partyBTax: orderConfirmData.partyBTax || '',
    partyBRep: orderConfirmData.partyBRep || '',
    partyBRole: orderConfirmData.partyBRole || '',
    partyBPhone: orderConfirmData.partyBPhone || '',
    partyBBank: '',
    partyBBankName: '',
    items: (orderConfirmData.items || []).map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      unit: item.unit || 'Cái',
      quantity: item.quantity,
      price: item.price,
      image: item.image || '',
      note: ''
    })),
    taxRate: orderConfirmData.taxRate || 8,
    clauses: (orderConfirmData.clauses || []).map(c => ({
      id: c.id,
      title: c.title.toUpperCase(),
      content: c.content
    }))
  };
};

// Hàm ánh xạ tổng quát dựa trên loại nguồn và đích
export const performSync = (sourceType, targetType, sourceData) => {
  if (sourceType === 'quote' && targetType === 'contract') {
    return mapQuoteToContract(sourceData);
  }
  if (sourceType === 'quote' && targetType === 'order_confirm') {
    return mapQuoteToOrderConfirm(sourceData);
  }
  if (sourceType === 'contract' && targetType === 'advance') {
    return mapContractToAdvance(sourceData);
  }
  if (sourceType === 'contract' && targetType === 'payment') {
    return mapContractToPayment(sourceData);
  }
  if (sourceType === 'contract' && targetType === 'delivery') {
    return mapContractToDelivery(sourceData);
  }
  if (sourceType === 'quote' && targetType === 'delivery') {
    return mapQuoteToDelivery(sourceData);
  }
  if (sourceType === 'order_confirm' && targetType === 'contract') {
    return mapOrderConfirmToContract(sourceData);
  }
  
  // Trả về mặc định nếu không có bộ ánh xạ phù hợp
  return null;
};

/**
 * Điền sẵn thông tin đối tác từ customerInfo của Bộ chứng từ vào form tương ứng.
 * Dùng khi tạo chứng từ mới từ bộ nhưng không có chứng từ nguồn để đồng bộ.
 *
 * @param {object} customerInfo  - Thông tin đối tác lưu trong bộ chứng từ
 * @param {string} targetType    - Loại chứng từ đích (quote, contract, delivery, advance, payment, order_confirm)
 * @returns {object|null}        - Object dữ liệu được điền sẵn (partial), hoặc null nếu không có info
 */
export const prefillFromSetCustomer = (customerInfo, targetType) => {
  if (!customerInfo || !customerInfo.name) return null;

  const { name = '', address = '', taxId = '', contactPerson = '', phone = '', email = '' } = customerInfo;

  switch (targetType) {
    case 'quote':
      return {
        customerName: name,
        customerAddress: address,
        customerTax: taxId,
        representative: contactPerson,
        customerPhone: phone,
      };

    case 'order_confirm':
      return {
        partyBName: name,
        partyBAddress: address,
        partyBTax: taxId,
        partyBRep: contactPerson,
        partyBPhone: phone,
        deliveryLocation: address,
      };

    case 'contract':
      return {
        partyBName: name,
        partyBAddress: address,
        partyBTax: taxId,
        partyBRep: contactPerson,
        partyBRole: '',
        partyBPhone: phone,
        partyBBank: '',
        partyBBankName: '',
      };

    case 'delivery':
      return {
        customerName: name,
        customerAddress: address,
        customerContact: contactPerson,
      };

    case 'advance':
      return {
        sendTo: name,
        partyBName: name,
      };

    case 'payment':
      return {
        sendTo: name,
        partyBName: name,
      };

    default:
      return { customerName: name, customerAddress: address };
  }
};

