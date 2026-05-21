import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/documents/:type
// Lấy dữ liệu tài liệu theo loại (quote, delivery, contract, payment, advance)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { companyId } = req.query;
    
    const allowedTypes = ['quote', 'delivery', 'contract', 'payment', 'advance'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại tài liệu không hợp lệ.' });
    }

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId' });
    }

    // Tạo ID duy nhất cho mỗi công ty và loại tài liệu, ví dụ: quote_comp_qvn_hanoi
    const docId = `${type}_${companyId}`;
    const docRef = db.collection('documents').doc(docId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return res.status(200).json({ success: true, data: docSnap.data() });
    } else {
      // Trả về null để Frontend biết là chưa có dữ liệu và dùng defaultData
      return res.status(200).json({ success: true, data: null });
    }
  } catch (error) {
    console.error(`❌ [GET Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu.' });
  }
});

// POST /api/documents/:type
// Cập nhật dữ liệu tài liệu theo loại
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { companyId, ...documentData } = req.body;

    const allowedTypes = ['quote', 'delivery', 'contract', 'payment', 'advance'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Loại tài liệu không hợp lệ.' });
    }

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId' });
    }

    const docId = `${type}_${companyId}`;
    const docRef = db.collection('documents').doc(docId);
    
    // Ghi đè hoặc cập nhật dữ liệu
    await docRef.set({
      ...documentData,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Đã lưu thành công lên Cloud.' });
  } catch (error) {
    console.error(`❌ [POST Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu dữ liệu.' });
  }
});

export default router;
