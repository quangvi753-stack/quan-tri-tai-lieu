import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/saved-documents
// Lấy danh sách các chứng từ đã lưu thuộc về một Bộ chứng từ
router.get('/', async (req, res) => {
  try {
    const { setId } = req.query;
    
    if (!setId) {
      return res.status(400).json({ success: false, message: 'Thiếu setId' });
    }

    // Không dùng orderBy để tránh lỗi thiếu Composite Index của Firestore
    const snapshot = await db.collection('saved_documents')
      .where('setId', '==', setId)
      .get();

    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in-memory
    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error(`❌ [GET Saved Documents] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu chứng từ đã lưu.' });
  }
});

// POST /api/saved-documents
// Lưu một chứng từ mới vào Bộ chứng từ
router.post('/', async (req, res) => {
  try {
    const { setId, companyId, type, documentName, data } = req.body;

    if (!setId || !companyId || !type || !data) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (setId, companyId, type, data)' });
    }

    const newDocRef = db.collection('saved_documents').doc();
    
    const newDocData = {
      setId,
      companyId,
      type,
      documentName: documentName || 'Chứng từ chưa đặt tên',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await newDocRef.set(newDocData);

    return res.status(201).json({ success: true, message: 'Lưu chứng từ thành công!', data: { id: newDocRef.id, ...newDocData } });
  } catch (error) {
    console.error(`❌ [POST Saved Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu chứng từ.' });
  }
});

// DELETE /api/saved-documents/:id
// Xóa một chứng từ đã lưu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('saved_documents').doc(id).delete();
    return res.status(200).json({ success: true, message: 'Đã xóa chứng từ.' });
  } catch (error) {
    console.error(`❌ [DELETE Saved Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa chứng từ.' });
  }
});

export default router;
