import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const defaultPaymentData = {
  id: 'TT-2026-001',
  date: getTodayDateString(),
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

export function usePaymentState(companyId) {
  const [paymentData, setPaymentData] = useCloudData('payment', defaultPaymentData, companyId);

  const updateData = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setPaymentData(prev => ({
      ...prev,
      items: (prev.items || []).map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setPaymentData(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { id: Date.now(), description: '', amount: 0, note: '' }
      ]
    }));
  };

  const removeItem = (id) => {
    setPaymentData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id)
    }));
  };

  return [
    paymentData,
    setPaymentData,
    { updateData, updateItem, addItem, removeItem }
  ];
}
