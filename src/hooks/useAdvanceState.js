import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const defaultAdvanceData = {
  id: 'TU-2026-001',
  date: getTodayDateString(),
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

export function useAdvanceState(companyId) {
  const [advanceData, setAdvanceData] = useCloudData('advance', defaultAdvanceData, companyId);

  const updateData = (field, value) => {
    setAdvanceData(prev => ({ ...prev, [field]: value }));
  };

  return [
    advanceData,
    setAdvanceData,
    { updateData }
  ];
}
