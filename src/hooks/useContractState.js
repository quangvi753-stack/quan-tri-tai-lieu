import { useCloudData } from './useCloudData';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const defaultContractData = {
  documentType: 'contract', // 'contract' | 'appendix'
  appendixForId: 'HD-2026-0304/QVN',
  appendixForDate: getTodayDateString(),
  id: 'HD-2026-0305/QVN',
  date: getTodayDateString(),
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

export function useContractState(companyId) {
  const [contractData, setContractData] = useCloudData('contract', defaultContractData, companyId);

  const updateData = (field, value) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setContractData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setContractData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: '', unit: 'Cái', quantity: 1, price: 0, image: '', note: '' }
      ]
    }));
  };

  const removeItem = (id) => {
    setContractData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateClause = (id, field, value) => {
    setContractData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addClause = () => {
    setContractData(prev => ({
      ...prev,
      clauses: [...prev.clauses, { id: `c${Date.now()}`, title: 'ĐIỀU MỚI', content: '' }]
    }));
  };

  const removeClause = (id) => {
    setContractData(prev => ({
      ...prev,
      clauses: prev.clauses.filter(c => c.id !== id)
    }));
  };

  return [
    contractData,
    setContractData,
    { updateData, updateItem, addItem, removeItem, updateClause, addClause, removeClause }
  ];
}
