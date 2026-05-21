import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/customers
// Lấy danh sách khách hàng theo CompanyId
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query; 
    
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId' });
    }

    // Cô lập dữ liệu: Chỉ lấy khách hàng của công ty đang chọn
    // Bỏ .orderBy('createdAt', 'desc') để tránh lỗi thiếu Composite Index trên Firestore
    const snapshot = await db.collection('customers')
      .where('companyId', '==', companyId)
      .get();

    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp giảm dần theo thời gian tạo
    customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error(`❌ [GET Customers] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu khách hàng.' });
  }
});

// POST /api/customers
// Tạo mới một Khách hàng
router.post('/', async (req, res) => {
  try {
    const { companyId, shortName, fullName, taxCode, address, representative, position, phone, email, bankAccount } = req.body;

    if (!companyId || !fullName) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (companyId, fullName)' });
    }

    const newCustomerRef = db.collection('customers').doc();
    
    const newCustomerData = {
      companyId,
      shortName: shortName || fullName,
      fullName,
      taxCode: taxCode || '',
      address: address || '',
      representative: representative || '',
      position: position || '',
      phone: phone || '',
      email: email || '',
      bankAccount: bankAccount || '',
      createdAt: new Date().toISOString()
    };

    await newCustomerRef.set(newCustomerData);

    return res.status(201).json({ success: true, message: 'Tạo Khách hàng thành công!', data: { id: newCustomerRef.id, ...newCustomerData } });
  } catch (error) {
    console.error(`❌ [POST Customer] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu khách hàng.' });
  }
});

// PUT /api/customers/:id
// Cập nhật Khách hàng
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Xóa companyId khỏi updateData để tránh trường hợp đổi công ty nhầm
    if (updateData.companyId) {
      delete updateData.companyId;
    }

    await db.collection('customers').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Cập nhật thành công.' });
  } catch (error) {
    console.error(`❌ [PUT Customer] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật khách hàng.' });
  }
});

// DELETE /api/customers/:id
// Xóa một Khách hàng
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('customers').doc(id).delete();
    return res.status(200).json({ success: true, message: 'Đã xóa thành công.' });
  } catch (error) {
    console.error(`❌ [DELETE Customer] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa khách hàng.' });
  }
});

export default router;
