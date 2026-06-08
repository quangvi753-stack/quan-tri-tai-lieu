import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const defaultOrderConfirmData = {
  id: 'XN-2026-0001/QVN',
  date: getTodayDateString(),
  location: 'trụ sở Công ty TNHH QVN Việt Nam',
  basisType: 'Báo giá',
  basisNumber: 'BG-2026-0042',
  partyAName: 'CÔNG TY TNHH QVN VIỆT NAM',
  partyAAddress: 'D20-tt14, KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội',
  partyATax: '0110990938',
  partyARep: 'Ông Vi Nguyễn Quang',
  partyBName: '',
  partyBAddress: '',
  partyBTax: '',
  partyBRep: '',
  partyBRole: '',
  partyBPhone: '',
  deliveryLocation: 'Bà Rịa – Vũng Tàu',
  deliveryTime: 'Theo thỏa thuận (dự kiến trong vòng 7 - 10 ngày)',
  advancePercent: '50',
  taxRate: 8,
  items: [
    { id: 'item-1', name: 'Quần áo', unit: 'Bộ', quantity: 1130, price: 199000, image: '', note: '' }
  ],
  clauses: [
    {
      id: 'c1',
      title: 'Thời gian và Địa điểm giao hàng',
      content: '1. Thời gian giao nhận: Dự kiến trong vòng 7 - 10 ngày kể từ ngày Bên A nhận được khoản tạm ứng đợt 1 và duyệt sản phẩm mẫu.\n2. Địa điểm giao hàng: Giao hàng tận nơi tại địa điểm do Bên B chỉ định tại Bà Rịa – Vũng Tàu.'
    },
    {
      id: 'c2',
      title: 'Thanh toán và Tạm ứng đặt cọc',
      content: '1. Phương thức thanh toán: Chuyển khoản qua ngân hàng.\n2. Tiến độ thanh toán:\n- Đợt 1: Bên B tạm ứng đặt cọc 50% giá trị đơn hàng ngay sau khi ký biên bản này.\n- Đợt 2: Bên B thanh toán 50% giá trị còn lại ngay sau khi nhận đầy đủ hàng hóa kèm biên bản giao nhận và hóa đơn tài chính hợp lệ.'
    }
  ]
};

export function useOrderConfirmState(companyId) {
  const [orderConfirmData, setOrderConfirmData] = useCloudData('order_confirm', defaultOrderConfirmData, companyId);

  const updateData = (field, value) => {
    setOrderConfirmData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setOrderConfirmData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setOrderConfirmData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: '', unit: 'Bộ', quantity: 1, price: 0, image: '', note: '' }
      ]
    }));
  };

  const removeItem = (id) => {
    setOrderConfirmData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateClause = (id, field, value) => {
    setOrderConfirmData(prev => ({
      ...prev,
      clauses: (prev.clauses || []).map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addClause = () => {
    setOrderConfirmData(prev => ({
      ...prev,
      clauses: [...(prev.clauses || []), { id: `c${Date.now()}`, title: 'Mục Mới', content: '' }]
    }));
  };

  const removeClause = (id) => {
    setOrderConfirmData(prev => ({
      ...prev,
      clauses: (prev.clauses || []).filter(c => c.id !== id)
    }));
  };

  return [
    orderConfirmData,
    setOrderConfirmData,
    { updateData, updateItem, addItem, removeItem, updateClause, addClause, removeClause }
  ];
}
