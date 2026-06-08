import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// GET /api/document-sets
// Lấy danh sách Bộ chứng từ theo CompanyId
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query; // Tạm thời lấy companyId từ query string thay vì token
    
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId (Workspace)' });
    }

    // Cô lập dữ liệu: Chỉ lấy các bộ chứng từ thuộc về công ty đang chọn
    // Bỏ .orderBy('createdAt', 'desc') để tránh lỗi thiếu Composite Index
    const snapshot = await db.collection('document_sets')
      .where('companyId', '==', companyId)
      .get();

    const documentSets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp in-memory
    documentSets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, data: documentSets });
  } catch (error) {
    console.error(`❌ [GET Document Sets] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu.' });
  }
});

// POST /api/document-sets
// Tạo mới một Bộ chứng từ
router.post('/', async (req, res) => {
  try {
    const { companyId, title, metadata, tags } = req.body;

    if (!companyId || !title) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (companyId, title)' });
    }

    const newSetRef = db.collection('document_sets').doc();
    
    const newSetData = {
      companyId,
      title,
      metadata: metadata || {},
      tags: tags || [],
      createdAt: new Date().toISOString()
    };

    await newSetRef.set(newSetData);

    return res.status(201).json({ success: true, message: 'Tạo Bộ chứng từ thành công!', data: { id: newSetRef.id, ...newSetData } });
  } catch (error) {
    console.error(`❌ [POST Document Set] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu dữ liệu.' });
  }
});

// PUT /api/document-sets/:id
// Cập nhật thông tin Bộ chứng từ (tiêu đề, thông tin đối tác, tags...)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, customerInfo, tags, metadata } = req.body;

    const setRef = db.collection('document_sets').doc(id);
    const setDoc = await setRef.get();
    if (!setDoc.exists) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Bộ chứng từ.' });
    }

    const updateData = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (customerInfo !== undefined) updateData.customerInfo = customerInfo;
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = metadata;

    await setRef.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật Bộ chứng từ thành công!',
      data: { id, ...setDoc.data(), ...updateData }
    });
  } catch (error) {
    console.error(`❌ [PUT Document Set] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bộ.' });
  }
});

// DELETE /api/document-sets/:id
// Xóa một Bộ chứng từ
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('document_sets').doc(id).delete();
    return res.status(200).json({ success: true, message: 'Đã xóa thành công.' });
  } catch (error) {
    console.error(`❌ [DELETE Document Set] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa dữ liệu.' });
  }
});

export default router;

