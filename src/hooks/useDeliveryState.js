import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const defaultDeliveryData = {
  id: 'HD215163/26',
  date: getTodayDateString(),
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

export function useDeliveryState(companyId) {
  const [deliveryData, setDeliveryData] = useCloudData('delivery', defaultDeliveryData, companyId);

  const updateData = (field, value) => {
    setDeliveryData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setDeliveryData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setDeliveryData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), warehouseCode: '', productCode: '', name: '', unit: '', quantity: 1, price: 0 }
      ]
    }));
  };

  const removeItem = (id) => {
    setDeliveryData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return [
    deliveryData,
    setDeliveryData,
    { updateData, updateItem, addItem, removeItem }
  ];
}
