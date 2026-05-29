import { useState, useEffect } from 'react'
import QuoteForm from './components/QuoteForm'
import QuotePreview from './components/QuotePreview'
import Dashboard from './components/Dashboard'
import ContractForm from './components/ContractForm'
import ContractPreview from './components/ContractPreview'
import DeliveryReceiptForm from './components/DeliveryReceiptForm'
import DeliveryReceiptPreview from './components/DeliveryReceiptPreview'
import PaymentRequestForm from './components/PaymentRequestForm'
import PaymentRequestPreview from './components/PaymentRequestPreview'
import AdvanceRequestForm from './components/AdvanceRequestForm'
import AdvanceRequestPreview from './components/AdvanceRequestPreview'
import { exportHTMLToWord } from './utils/exportToWord'
import { useWorkspace } from './contexts/WorkspaceContext'
import SetList from './components/document-sets/SetList'
import CustomerManager from './components/CustomerManager'
import SaveToSetModal from './components/SaveToSetModal'
import AICopilot from './components/AICopilot'
import AIDocumentStudio from './components/AIDocumentStudio'
import { motion, AnimatePresence } from 'framer-motion'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'

function useCloudData(type, defaultData, companyId) {
  const [data, setData] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    
    fetch(`/api/documents/${type}?companyId=${companyId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          setData(resData.data);
        } else {
          // Nếu không có data thì dùng default
          setData(defaultData);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load', type, err);
        setIsLoaded(true);
      });
  }, [type, companyId]);

  useEffect(() => {
    if (!isLoaded || !companyId) return;
    const timeoutId = setTimeout(() => {
      fetch(`/api/documents/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId })
      }).catch(err => console.error('Failed to save', type, err));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [data, type, isLoaded, companyId]);

  return [data, setData];
}

function App() {
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('quote');

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveModalType, setSaveModalType] = useState('');
  const [saveModalData, setSaveModalData] = useState(null);

  const handleOpenSaveModal = (type, data) => {
    setSaveModalType(type);
    setSaveModalData(data);
    setIsSaveModalOpen(true);
  };

  // Dữ liệu báo giá mẫu
  const defaultQuoteData = {
    id: 'BG-2023-0042',
    date: '2026-03-04',
    expiryDate: '2026-04-04',
    customerName: 'Công ty TNHH Dịch vụ và TM Bảo Minh Nam',
    customerAddress: 'Ngoại giao đoàn, Xuân Tảo, Bắc từ liêm, Hà Nội',
    companyLogo: '',
    companyName: 'CÔNG TY TNHH QVN VIỆT NAM',
    companySubtitle: 'NHÀ PHÂN PHỐI BẢO HỘ LAO ĐỘNG',
    companySpecialty: '* Sản xuất kinh doanh, đại lý phân phối thiết bị an toàn lao động: giầy, mũ, ủng, quần áo...\n\n* Cung cấp thiết bị PCCC...\n* Cung cấp vật tư phụ, hàng kim khí tổng hợp',
    companyAddress: 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    companyPhone: '0912.5283.16',
    companyEmail: 'Salesqvnd@gmail.com',
    companyTax: '0 1 1 0 9 9 0 9 3 8',
    representative: 'Mr Vi Nguyễn Quang',
    repPhone: '0912.528.316',
    repEmail: 'Salesqvn@gmail.com',
    items: [
      {
        id: 1,
        name: 'Quần áo BHLĐ KCT DK',
        image: 'https://placehold.co/100x60?text=Áo',
        unit: 'Bộ',
        quantity: 50,
        price: 450000,
        basePrice: 450000,
        discount: 0,
        useTiers: true,
        priceTiers: [
          { minQty: 100, price: 380000 },
          { minQty: 200, price: 360000 },
          { minQty: 300, price: 340000 },
          { minQty: 400, price: 330000 },
          { minQty: 500, price: 320000 }
        ]
      },
      {
        id: 2,
        name: 'May chun đai lưng quần',
        image: '',
        unit: 'Cái',
        quantity: 50,
        price: 20000,
        basePrice: 20000,
        discount: 0,
        useTiers: false,
        priceTiers: []
      }
    ],
    taxRate: 8,
    terms: 'Điều Khoản Thương Mại:\n1. Giá trên đã bao gồm chi phí in ấn may thêm đai lưng.\n2.Giao hàng: Thời gian giao hàng từ 7-15 ngày đối với hàng có sẵn và 20-25 ngày với hàng đặt may riêng\n3. Địa điểm giao hàng : Tại kho bên bán, hoặc theo thỏa thuận.\n4. Hình Thức thanh toán : Bên mua thanh toán 30 % khi đã nhận đủ các chứng từ liên quan.\n5. Báo giá có hiệu lực trong vòng 30 ngày kể từ khi báo giá.'
  };

  const [quoteData, setQuoteData] = useCloudData('quote', defaultQuoteData, activeWorkspace?.id);

  // Dữ liệu Phiếu Xuất Kho (Mẫu QVN)
  const defaultDeliveryData = {
    id: 'HD215163/26',
    date: '2026-03-04',
    companyName: 'CÔNG TY TNHH QVN VIỆT NAM',
    companySubtitle: 'NHÀ PHÂN PHỐI BẢO HỘ LAO ĐỘNG',
    companyAddress: 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    companyTax: '0110990938',
    companyEmail: 'salesqvn@gmail.com',
    companyWeb: 'Baohoalaodongqvn.com.vn',
    companyPhone: '0912.5283.16',
    companySpecialty: '* Sản xuất kinh doanh, đại lý phân phối thiết bị\nan toàn lao động: giầy, mũ, ủng, quần áo...\n\n* Cung cấp thiết bị PCCC...\n* Cung cấp vật tư phụ, hàng kim khí tổng hợp',
    customerContact: 'Mr Vi Nguyễn Quang',
    customerName: 'KH001021 - CÔNG TY ĐỐI TÁC',
    customerAddress: 'Khu công nghiệp Vĩnh Tuy, Hoàng Mai, Hà Nội',
    deliveryReason: 'Xuất bán hàng',
    items: [
      { id: 1, warehouseCode: 'KHO1', productCode: '04030039', name: 'Giày Jogger Bestrun S3 cỡ 39', unit: 'Đôi', quantity: 1, price: 325000 }
    ]
  };

  const [deliveryData, setDeliveryData] = useCloudData('delivery', defaultDeliveryData, activeWorkspace?.id);

  // Dữ liệu Hợp đồng/Phụ lục mẫu (QVN là Bên A mặc định)
  const defaultContractData = {
    documentType: 'contract', // 'contract' | 'appendix'
    appendixForId: 'HD-2026-0304/QVN',
    appendixForDate: '2026-03-04',
    id: 'HD-2026-0305/QVN',
    date: '2026-03-05',
    location: 'trụ sở Công ty TNHH QVN Việt Nam',
    legalBases: '- Căn cứ Bộ Luật Dân sự 2015;\n- Căn cứ Luật Thương mại 2005;\n- Căn cứ vào nhu cầu và khả năng thực tế của hai bên ký kết hợp đồng.',
    generalTerms: '7.1. Hợp đồng có hiệu lực có hiệu lực từ ngày ký và tự động thanh lý sau khi hai bên hoàn thành đầy đủ các nghĩa vụ được nêu trong hợp đồng.\n7.2. Các phụ lục kèm theo là một phần cơ bản không thể tách rời của Hợp đồng này. Việc điều chỉnh, chuyển nhượng, thay đổi hay sửa đổi của Hợp đồng này phải được lập thành bằng văn bản và chỉ có hiệu lực khi được đại diện có đủ thẩm quyền của hai Bên ký kết.\n7.3. Hai bên cam kết thực hiện nghiêm chỉnh và đúng theo các điều khoản của hợp đồng này, chủ động thông tin cho nhau quá trình thực hiện nội dung của hợp đồng này và những vấn đề phát sinh để cùng nhau tìm biện pháp giải quyết đảm bảo lợi ích của hai bên. Trường hợp hai bên không tự giải quyết được thì việc giải quyết được đưa ra tòa án phán quyết.\n7.4. Hợp đồng được lập thành 04 bản có nội dung và giá trị pháp lý như nhau. Mỗi bên giữ 02 bản.',
    appendixContent: 'Hai bên cùng thống nhất ký kết Phụ lục Hợp đồng này để sửa đổi, bổ sung một số điều khoản của Hợp đồng nguyên tắc/Hợp đồng kinh tế đã ký kết với các nội dung sau:\n\nĐiều 1: Nội dung sửa đổi, bổ sung\n- Các bên thống nhất bổ sung thêm số lượng hàng hóa/dịch vụ như bảng phụ lục đính kèm bên dưới.\n\nĐiều 2: Điều khoản chung\n- Các điều khoản khác không được đề cập tại Phụ lục này vẫn giữ nguyên hiệu lực theo Hợp đồng gốc.\n- Phụ lục này là một phần không thể tách rời của Hợp đồng gốc.',
    partyAName: 'CÔNG TY TNHH QVN VIỆT NAM',
    partyAAddress: 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
    partyATax: '0110990938',
    partyARep: 'Ông Vi Nguyễn Quang',
    partyARole: 'Giám Đốc',
    partyAPhone: '0912.5283.16',
    partyABank: '3656866789',
    partyABankName: 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    partyBName: '',
    partyBAddress: '',
    partyBTax: '',
    partyBRep: '',
    partyBRole: '',
    partyBPhone: '',
    partyBBank: '',
    partyBBankName: '',
    items: [
      { id: 1, name: 'Quần áo BHLĐ', unit: 'Bộ', quantity: 38, price: 260000, image: '', note: 'L/20, M/8, XL/8, 2XL/2' },
      { id: 2, name: 'May chun đai lưng quần', unit: 'Cái', quantity: 50, price: 20000, image: '', note: '' }
    ],
    taxRate: 8,
    clauses: [
      {
        id: 'c1',
        title: 'THỜI GIAN VÀ ĐỊA ĐIỂM GIAO HÀNG',
        content: '2.1. Thời gian giao hàng: Trong vòng 20 - 25 ngày (không bao gồm ngày thứ 7, chủ nhật) kể từ ngày bên Bán nhận được tiền đặt cọc.\n2.2. Địa điểm giao hàng: Km 26 Khê Than, Xã Phú Nghĩa, Huyện Chương Mỹ, Thành phố Hà Nội (cũ)\n2.3. Thủ tục khi giao nhận hàng hóa gồm:\n- Biên bản giao nhận hàng hóa có chữ ký xác nhận của 2 bên.'
      },
      {
        id: 'c2',
        title: 'HÌNH THỨC THANH TOÁN',
        content: '3.1. Hình thức thanh toán: Thanh toán bằng hình thức chuyển khoản \n3.2. Phương thức thanh toán: \n- Thanh toán tạm ứng: Bên A tạm ứng cho bên B 50% giá trị hợp ngay sau khi ký hợp đồng và nhận được công văn đề nghị tạm ứng của bên B.\n- Thanh toán: Thanh toán giá trị còn lại của đơn hàng sau khi khấu trừ tỷ lệ tạm ứng trong kể từ ngày bên A nhận được toàn bộ hàng hóa và đầy đủ hồ sơ thanh toán quy định tại mục 3.3 hợp đồng này.\n3.3. Bộ chứng từ thanh toán: \n- Biên bản giao nhận hàng hóa có chữ ký xác nhận của 2 bên.\nHồ sơ thanh toán chuyển về 01 địa chỉ duy nhất:\nMs. Loan, phòng Mua hàng - Cty Tomexco - Số điện thoại: 0932.120.885'
      },
      {
        id: 'c3',
        title: 'TRÁCH NHIỆM CỦA HAI BÊN',
        content: '4.1. Trách nhiệm của bên A\n- Thanh toán cho bên B đúng, đủ theo quy định trong điều 3 của hợp đồng này.\n- Có quyền từ chối nhận hàng nếu hàng hóa không đúng với qui định tại Điều 1 của hợp đồng.\n- Có quyền đơn phương chấm dứt hợp đồng nếu bên B cấp hàng chậm trên 15 ngày hoặc/và hàng hóa không đúng với cam kết của hợp đồng.\n4.2. Trách nhiệm của bên B\n- Giao hàng đúng theo đúng cam kết như đã nêu trong điều 1 & điều 2 của hợp đồng này.\n- Giao hàng cho bên A theo đúng xuất xứ, số lượng, qui cách, tiến độ, chất lượng, tiêu chuẩn như qui định ở điều 1 của hợp đồng.\n- Chịu trách nhiệm vận chuyển giao hàng về công trường bên A.\n- Cung cấp cho bên A các hồ sơ thanh toán theo quy định tại điều 3 hợp đồng này.\n- Nếu chậm giao hàng theo tiến độ, Bên B sẽ chịu phạt như nêu tại Điều 5 nhưng không được chậm quá 15 ngày.'
      },
      {
        id: 'c4',
        title: 'XỬ LÝ VI PHẠM HỢP ĐỒNG',
        content: '5.1. Trường hợp Bên A thanh toán chậm cho Bên B, trừ các trường hợp bất khả kháng (thiên tai, khủng bố) thì Bên A sẽ chịu phạt 0,01% /ngày trên tổng giá trị Hợp đồng, tuy nhiên tổng mức phạt không vượt quá 5% trên tổng giá trị hợp đồng.\n5.2. Trong trường hợp Bên B cung cấp hàng hóa không theo đúng thời hạn như đã cam kết trong hợp đồng, trừ các trường hợp bất khả kháng thì Bên B sẽ phải chịu phạt 0,01% /ngày trên tổng giá trị hợp đồng, nhưng tổng mức phạt không quá 5% giá trị hợp đồng.\n5.3. Nếu bên B đơn phương hủy Hợp đồng thì Bên B sẽ trả lại tiền đặt cọc cho Bên A và chịu phí bồi thường là 5% trên tổng giá trị Hợp đồng.'
      },
      {
        id: 'c5',
        title: 'ĐIỀU KHOẢN CHUNG',
        content: '7.1. Hợp đồng có hiệu lực có hiệu lực từ ngày ký và tự động thanh lý sau khi hai bên hoàn thành đầy đủ các nghĩa vụ được nêu trong hợp đồng.\n7.2. Các phụ lục kèm theo là một phần cơ bản không thể tách rời của Hợp đồng này. Việc điều chỉnh, chuyển nhượng, thay đổi hay sửa đổi của Hợp đồng này phải được lập thành bằng văn bản và chỉ có hiệu lực khi được đại diện có đủ thẩm quyền của hai Bên ký kết.\n7.3. Hai bên cam kết thực hiện nghiêm chỉnh và đúng theo các điều khoản của hợp đồng này, chủ động thông tin cho nhau quá trình thực hiện nội dung của hợp đồng này và những vấn đề phát sinh để cùng nhau tìm biện pháp giải quyết đảm bảo lợi ích của hai bên. Trường hợp hai bên không tự giải quyết được thì việc giải quyết được đưa ra tòa án phán quyết.\n7.4. Hợp đồng được lập thành 04 bản có nội dung và giá trị pháp lý như nhau. Mỗi bên giữ 02 bản.'
      }
    ]
  };

  const [contractData, setContractData] = useCloudData('contract', defaultContractData, activeWorkspace?.id);

  // Dữ liệu Đề nghị thanh toán mẫu
  const defaultPaymentData = {
    id: 'TT-2026-001',
    date: '2026-03-10',
    companyName: 'CÔNG TY TNHH QVN VIỆT NAM',
    sendTo: 'CÔNG TY CỔ PHẦN TƯ VẤN VÀ XÂY DỰNG THÀNH SƠN',
    contractNumber: '.../2026/HĐKT/QVN - THANHSON',
    partyBName: 'công ty Cổ Phần tư vấn và xây dựng Thành Sơn',
    goodsDescription: 'mua các loại Bảo hộ lao động',
    paymentPercent: '100',
    totalContractValue: 26265600,
    paidAmount: 13132800,
    paymentAmount: 13132800,
    bankAccountName: 'QVN VN COM CO., LTD',
    bankAccountNumber: '3656866789',
    bankName: 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    requestLocation: 'Hà Nội'
  };

  const [paymentData, setPaymentData] = useCloudData('payment', defaultPaymentData, activeWorkspace?.id);

  // Dữ liệu Đề nghị tạm ứng (Mẫu mới theo hình ảnh)
  const defaultAdvanceData = {
    id: 'TU-2026-001',
    date: '2026-03-10',
    companyName: 'CÔNG TY TNHH QVN VIỆT NAM',
    sendTo: 'CÔNG TY CỔ PHẦN TƯ VẤN VÀ XÂY DỰNG THÀNH SƠN',
    contractNumber: '.../2026/HĐKT/QVN - THANHSON',
    partyBName: 'công ty Cổ Phần tư vấn và xây dựng Thành Sơn',
    goodsDescription: 'mua các loại Bảo hộ lao động',
    advancePercent: '50',
    totalContractValue: 26265600,
    advanceAmount: 13132800,
    bankAccountName: 'QVN VN COM CO., LTD',
    bankAccountNumber: '3656866789',
    bankName: 'Ngân hàng Thương mại cổ phần Kỹ Thương Việt Nam (Techcombank)',
    requestLocation: 'Hà Nội'
  };

  const [advanceData, setAdvanceData] = useCloudData('advance', defaultAdvanceData, activeWorkspace?.id);

  // Removed localStorage auto-save logic, now handled by useCloudData

  const getCurrentContextData = () => {
    switch (activeTab) {
      case 'quote': return { type: 'Báo Giá', data: quoteData };
      case 'contract': return { type: 'Hợp Đồng', data: contractData };
      case 'delivery': return { type: 'Phiếu Xuất Kho', data: deliveryData };
      case 'payment': return { type: 'Đề Nghị Thanh Toán', data: paymentData };
      case 'advance': return { type: 'Đề Nghị Tạm Ứng', data: advanceData };
      default: return { type: null, data: null };
    }
  };

  const currentContext = getCurrentContextData();
  const handleUpdateData = (field, value) => {
    setQuoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateItem = (id, field, value) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = () => {
    setQuoteData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: '', image: '', unit: '', quantity: 1, price: 0, basePrice: 0, discount: 0, useTiers: false, priceTiers: [] }
      ]
    }));
  };

  const handleRemoveItem = (id) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  // Các handler dùng chung hoặc update riêng cho Phiếu Xuất (bằng cách bind state)
  const handleUpdateDeliveryData = (field, value) => setDeliveryData(prev => ({ ...prev, [field]: value }));
  const handleUpdateDeliveryItem = (id, field, value) => setDeliveryData(prev => ({
    ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
  }));
  const handleAddDeliveryItem = () => setDeliveryData(prev => ({
    ...prev, items: [...prev.items, { id: Date.now(), warehouseCode: '', productCode: '', name: '', unit: '', quantity: 1, price: 0 }]
  }));
  const handleRemoveDeliveryItem = (id) => setDeliveryData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  // Các handler cho Hợp Đồng
  const handleUpdateContractData = (field, value) => setContractData(prev => ({ ...prev, [field]: value }));
  const handleUpdateContractItem = (id, field, value) => setContractData(prev => ({
    ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
  }));
  const handleAddContractItem = () => setContractData(prev => ({
    ...prev, items: [...prev.items, { id: Date.now(), name: '', unit: 'Cái', quantity: 1, price: 0, image: '', note: '' }]
  }));
  const handleRemoveContractItem = (id) => setContractData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const handleUpdateContractClause = (id, field, value) => setContractData(prev => ({
    ...prev, clauses: prev.clauses.map(c => c.id === id ? { ...c, [field]: value } : c)
  }));
  const handleAddContractClause = () => setContractData(prev => ({
    ...prev, clauses: [...prev.clauses, { id: `c${Date.now()}`, title: 'ĐIỀU MỚI', content: '' }]
  }));
  const handleRemoveContractClause = (id) => setContractData(prev => ({
    ...prev, clauses: prev.clauses.filter(c => c.id !== id)
  }));

  // Các handler cho Thanh toán
  const handleUpdatePaymentData = (field, value) => setPaymentData(prev => ({ ...prev, [field]: value }));
  const handleUpdatePaymentItem = (id, field, value) => setPaymentData(prev => ({
    ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i)
  }));
  const handleAddPaymentItem = () => setPaymentData(prev => ({
    ...prev, items: [...prev.items, { id: Date.now(), description: '', amount: 0, note: '' }]
  }));
  const handleRemovePaymentItem = (id) => setPaymentData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  // Các handler cho Tạm ứng
  const handleUpdateAdvanceData = (field, value) => setAdvanceData(prev => ({ ...prev, [field]: value }));

  const handlePrint = () => {
    window.print();
  };

  const handleCreateDocumentFromCustomer = (type, customer) => {
    setActiveTab(type);
    
    if (type === 'quote') {
      setQuoteData(prev => ({
        ...prev,
        customerName: customer.fullName,
        customerAddress: customer.address,
        customerContact: customer.representative,
      }));
    } else if (type === 'contract') {
      setContractData(prev => ({
        ...prev,
        partyB: customer.fullName,
        partyBAddress: customer.address,
        partyBTaxCode: customer.taxCode,
        partyBRep: customer.representative,
        partyBPosition: customer.position,
        partyBPhone: customer.phone,
        partyBAccount: customer.bankAccount,
      }));
    } else if (type === 'delivery') {
      setDeliveryData(prev => ({
        ...prev,
        customerName: customer.fullName,
        customerAddress: customer.address,
      }));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-slate-900 font-display">
      {/* Sidebar - Modern Premium UI */}
      <aside className="w-[280px] bg-[#0b0f19] text-slate-300 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-50 overflow-y-auto print:hidden border-r border-white/5 relative">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-500/10 blur-[40px] pointer-events-none"></div>
        
        <div className="p-6 pb-2 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2.5 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined block text-[24px]">description</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-[19px] leading-tight tracking-tight font-display">DocManager</h1>
              <p className="text-indigo-200/70 text-[11px] font-medium tracking-wider uppercase mt-0.5">Enterprise</p>
            </div>
          </div>
        </div>

          <nav className="flex flex-col gap-1.5 px-4 relative z-10">
            <button
              onClick={() => setActiveTab('document-sets')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'document-sets' ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-[inset_2px_0_0_#6366f1] border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'document-sets' ? 'text-indigo-400' : ''}`}>folder_copy</span>
              <span className="font-semibold text-sm tracking-wide">Bộ Chứng Từ</span>
            </button>
            <div className="h-px bg-white/5 my-3 mx-2"></div>
            
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' ? 'text-white' : ''}`}>dashboard</span>
              <span className="text-sm">Tổng quan</span>
            </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'quote' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('quote')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'quote' ? 'text-white' : ''}`}>request_quote</span>
            <span className="text-sm">Báo giá</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'contract' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('contract')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'contract' ? 'text-white' : ''}`}>history_edu</span>
            <span className="text-sm">Hợp đồng</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'delivery' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('delivery')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'delivery' ? 'text-white' : ''}`}>local_shipping</span>
            <span className="text-sm">Phiếu xuất kho</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'payment' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('payment')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'payment' ? 'text-white' : ''}`}>payments</span>
            <span className="text-sm">Thanh toán</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'advance' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('advance')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'advance' ? 'text-white' : ''}`}>account_balance_wallet</span>
            <span className="text-sm">Tạm ứng</span>
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'customer' ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('customer')}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeTab === 'customer' ? 'text-white' : ''}`}>group</span>
            <span className="text-sm">Khách hàng</span>
          </button>

          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Công cụ nâng cao</div>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${activeTab === 'ai-studio' ? 'text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setActiveTab('ai-studio')}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-opacity duration-300 ${activeTab === 'ai-studio' ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'}`}></div>
            <span className="material-symbols-outlined text-[20px] relative z-10 text-indigo-300">auto_awesome</span>
            <span className="text-sm font-semibold relative z-10">Soạn thảo AI</span>
            {activeTab !== 'ai-studio' && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === 'settings' ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm">Cài đặt</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto relative z-10">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left group">
            <div className="size-10 rounded-full bg-slate-300 bg-cover bg-center shrink-0 border border-white/10 shadow-inner" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpHFh1t7uY8Ktqo2sRKVjEKcy1U5mrF1VGD-GpEoHA10vmWrCiWN2lfqfgBRz-YI-vzM4Qxv9x_n4ewbL0SX08cniscXurt_DgBL7BlJ2_r1IqMKmriSqWuuvWJh0ZnJUzK0NJIlHMCNqee73ihp2SEAo54B0Rq3Oxh6rCMrPWV8x0g7MNwitywmLCh72q8LW7sURX-qQtbgINkyWx3eeu2lo1rprUWSTPLvQimJDOox2YdmtVSTNxQcN7EAFCuGh8P0VXyvxdO9M')" }}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">Quản trị viên</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">admin@company.vn</p>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-[18px] group-hover:text-white transition-colors">more_vert</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc]">
        {/* Global Top Search Bar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-40 print:hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] sticky top-0">
          <div className="flex items-center flex-1 max-w-lg">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-focus-within:text-indigo-500 transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border border-slate-200/80 rounded-full text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 shadow-sm"
                placeholder="Tìm kiếm tài liệu, khách hàng..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-400 bg-white shadow-sm">Ctrl K</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 mr-4 p-1 bg-slate-100/80 rounded-lg shadow-inner">
              {['dashboard', 'quote', 'contract', 'delivery', 'payment'].map((tabId) => {
                const labels = { dashboard: 'Tổng quan', quote: 'Báo giá', contract: 'Hợp đồng', delivery: 'Xuất kho', payment: 'Thanh toán' };
                return (
                  <button
                    key={tabId}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${activeTab === tabId ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
                    onClick={() => setActiveTab(tabId)}
                  >
                    {labels[tabId]}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full relative transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
        {activeTab === 'document-sets' ? (
          <motion.div key="sets" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <SetList />
          </motion.div>
        ) : activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <Dashboard />
          </motion.div>
        ) : activeTab === 'quote' ? (
          <motion.div 
            key="quote"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-72px)] w-full overflow-hidden"
          >
            <PanelGroup direction="horizontal">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-[#f8fafc] print:hidden">
                  <QuoteForm
                    data={quoteData}
                    onUpdate={handleUpdateData}
                    onUpdateItem={handleUpdateItem}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                  />
                </div>
              </Panel>

              {/* Resize Handle - Professional look */}
              <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-blue-500 hover:w-1.5 transition-all cursor-col-resize z-40 flex flex-col justify-center items-center group print:hidden">
                <div className="h-8 w-1 bg-slate-300 rounded-full group-hover:bg-white transition-colors" />
              </PanelResizeHandle>

              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('quote', quoteData)}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('quote-preview-content', `BaoGia_${quoteData.id}`)}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <QuotePreview data={quoteData} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>
        ) : activeTab === 'contract' ? (
          <motion.div key="contract" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full w-full">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative">
                  <ContractForm
                    data={contractData}
                    onUpdate={handleUpdateContractData}
                    onUpdateItem={handleUpdateContractItem}
                    onAddItem={handleAddContractItem}
                    onRemoveItem={handleRemoveContractItem}
                    onUpdateClause={handleUpdateContractClause}
                    onAddClause={handleAddContractClause}
                    onRemoveClause={handleRemoveContractClause}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
              
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('contract', contractData)}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('contract-preview-content', `${contractData.documentType === 'appendix' ? 'PhuLuc' : 'HopDong'}_${contractData.id.replace(/\//g, '_')}`)}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <ContractPreview data={contractData} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>
        ) : activeTab === 'delivery' ? (
          <motion.div key="delivery" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full w-full">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative">
                  <DeliveryReceiptForm
                    data={deliveryData}
                    onUpdate={handleUpdateDeliveryData}
                    onUpdateItem={handleUpdateDeliveryItem}
                    onAddItem={handleAddDeliveryItem}
                    onRemoveItem={handleRemoveDeliveryItem}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
              
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('delivery', deliveryData)}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('delivery-preview-content', `PhieuXuatKho_${deliveryData.id}`)}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <DeliveryReceiptPreview data={deliveryData} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>
        ) : activeTab === 'payment' ? (
          <motion.div key="payment" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full w-full">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative">
                  <PaymentRequestForm
                    data={paymentData}
                    onUpdate={handleUpdatePaymentData}
                    onUpdateItem={handleUpdatePaymentItem}
                    onAddItem={handleAddPaymentItem}
                    onRemoveItem={handleRemovePaymentItem}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
              
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('payment', paymentData)}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('payment-preview-content', `DeNghiThanhToan_${paymentData.id}`)}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <PaymentRequestPreview data={paymentData} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>
        ) : activeTab === 'advance' ? (
          <motion.div key="advance" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full w-full">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full overflow-y-auto bg-white/50 print:hidden custom-scrollbar-light relative">
                  <AdvanceRequestForm
                    data={advanceData}
                    onUpdate={handleUpdateAdvanceData}
                  />
                </div>
              </Panel>
              
              <PanelResizeHandle className="w-1.5 bg-slate-200/50 hover:bg-indigo-500/50 transition-colors cursor-col-resize active:bg-indigo-500" />
              
              <Panel defaultSize={45} minSize={30}>
                <div className="h-full bg-[#1e293b] p-6 lg:p-8 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:w-full custom-scrollbar-dark relative shadow-[inset_4px_0_12px_rgba(0,0,0,0.05)]">
                  <div className="absolute top-4 right-4 flex gap-3 text-slate-400 print:hidden z-10">
                    <button className="hover:text-white transition-colors" title="Phóng to"><span className="material-symbols-outlined">fullscreen</span></button>
                    <button className="hover:text-white transition-colors" title="In" onClick={handlePrint}><span className="material-symbols-outlined">print</span></button>
                    <button
                      className="hover:text-white transition-colors bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] hover:text-white shadow-sm"
                      title="Lưu vào Bộ Chứng từ"
                      onClick={() => handleOpenSaveModal('advance', advanceData)}
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span className="text-xs font-bold uppercase">Lưu Hồ Sơ</span>
                    </button>
                    <button
                      className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                      title="Tải xuống Word"
                      onClick={() => exportHTMLToWord('advance-preview-content', `DeNghiTamUng_${advanceData.id}`)}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#2bb4e1]">download</span>
                      <span className="text-xs font-bold text-[#2bb4e1] ml-1 uppercase">Doc</span>
                    </button>
                  </div>
                  <AdvanceRequestPreview data={advanceData} />
                </div>
              </Panel>
            </PanelGroup>
          </motion.div>
        ) : activeTab === 'customer' ? (
          <motion.div key="customer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
            <CustomerManager onCreateDocument={handleCreateDocumentFromCustomer} />
          </motion.div>
        ) : activeTab === 'ai-studio' ? (
          <motion.div key="ai-studio" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-72px)] w-full overflow-hidden">
            <AIDocumentStudio 
              onSaveToSet={(type, data) => handleOpenSaveModal(type, data)} 
            />
          </motion.div>
        ) : (
          <motion.div key="default" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-72px)] overflow-y-auto bg-slate-50">
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
              <span className="material-symbols-outlined text-[64px] text-slate-300 mb-6 block">construction</span>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Tính năng đang phát triển</h2>
              <p className="text-slate-500 text-sm">Vui lòng chọn "Tổng quan" hoặc "Báo Giá" ở menu bên trái để trải nghiệm công cụ làm chứng từ chuyên nghiệp.</p>
              <button
                className="mt-8 px-6 py-2.5 bg-[#0e7490] hover:bg-[#164e63] text-white font-medium rounded-lg shadow-sm transition-colors w-full"
                onClick={() => setActiveTab('quote')}
              >
                Trở về Bảng Báo Giá
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Modal Lưu Chứng Từ */}
      <SaveToSetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        documentType={saveModalType}
        documentData={saveModalData}
      />

      {/* Trợ lý AI toàn cầu */}
      <AICopilot contextType={currentContext.type} contextData={currentContext.data} />
    </div>
  )
}

export default App
