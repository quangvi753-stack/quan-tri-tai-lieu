import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getFutureDateString = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const defaultQuoteData = {
  id: 'BG-2023-0042',
  date: getTodayDateString(),
  expiryDate: getFutureDateString(30),
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
  representative: 'Quý Khách Hàng',
  preparedBy: 'Mr Vi Nguyễn Quang',
  repPhone: '0912.528.316',
  repEmail: 'Salesqvn@gmail.com',
  customerPhone: '',
  customerTax: '',
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
  templateType: 'standard',
  terms: 'Điều Khoản Thương Mại:\n1. Giá trên đã bao gồm chi phí in ấn may thêm đai lưng.\n2.Giao hàng: Thời gian giao hàng từ 7-15 ngày đối với hàng có sẵn và 20-25 ngày với hàng đặt may riêng\n3. Địa điểm giao hàng : Tại kho bên bán, hoặc theo thỏa thuận.\n4. Hình Thức thanh toán : Bên mua thanh toán 30 % khi đã nhận đủ các chứng từ liên quan.\n5. Báo giá có hiệu lực trong vòng 30 ngày kể từ khi báo giá.'
};

export function useQuoteState(companyId) {
  const [quoteData, setQuoteData] = useCloudData('quote', defaultQuoteData, companyId);

  const updateData = (field, value) => {
    setQuoteData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setQuoteData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: '', image: '', unit: '', quantity: 1, price: 0, basePrice: 0, discount: 0, useTiers: false, priceTiers: [] }
      ]
    }));
  };

  const removeItem = (id) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return [
    quoteData,
    setQuoteData,
    { updateData, updateItem, addItem, removeItem }
  ];
}
