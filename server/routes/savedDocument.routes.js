import express from 'express';
import { db, logActivity } from '../config/db.js';

const router = express.Router();

// GET /api/saved-documents/next-id
// Lấy mã số chứng từ tiếp theo theo thứ tự tự tăng
router.get('/next-id', async (req, res) => {
  try {
    const { companyId, type } = req.query;
    if (!companyId || !type) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId hoặc type' });
    }
    
    // Lấy danh sách tất cả chứng từ cùng loại của công ty
    const snapshot = await db.collection('saved_documents')
      .where('companyId', '==', companyId)
      .where('type', '==', type)
      .get();
      
    const existingIds = snapshot.docs.map(doc => {
      const docData = doc.data();
      return docData && docData.data ? docData.data.id : null;
    }).filter(Boolean);
    
    // Kiểm tra thêm chứng từ nháp hiện tại của công ty
    const activeDocSnap = await db.collection('documents').doc(`${type}_${companyId}`).get();
    if (activeDocSnap.exists) {
      const activeData = activeDocSnap.data();
      if (activeData && activeData.id) {
        existingIds.push(activeData.id);
      }
    }
    
    // Xác định prefix và suffix tương ứng từng loại
    const year = new Date().getFullYear();
    let prefix = '';
    let suffix = '';
    
    switch (type) {
      case 'quote':
        prefix = 'BG';
        break;
      case 'contract':
        prefix = 'HD';
        suffix = '/QVN';
        break;
      case 'order_confirm':
        prefix = 'XN';
        suffix = '/QVN';
        break;
      case 'advance':
        prefix = 'TU';
        break;
      case 'payment':
        prefix = 'TT';
        break;
      case 'delivery':
        prefix = 'XK';
        break;
      default:
        prefix = 'DOC';
    }

    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}[-–/](\\d{4})[-–/](\\d+)`);
    
    for (const id of existingIds) {
      const match = id.match(regex);
      if (match) {
        const idYear = parseInt(match[1], 10);
        if (idYear === year) {
          const seq = parseInt(match[2], 10);
          if (seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    }
    
    let nextSeq = maxSeq + 1;
    if (maxSeq === 0) {
      if (type === 'quote') nextSeq = 43; // Bắt đầu sau BG-2023-0042
      else nextSeq = 1;
    }
    
    const paddedSeq = String(nextSeq).padStart(4, '0');
    const nextId = `${prefix}-${year}-${paddedSeq}${suffix}`;
    
    return res.status(200).json({ success: true, nextId });
  } catch (error) {
    console.error(`❌ [GET Next ID] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tính mã tài liệu tiếp theo.' });
  }
});

// GET /api/saved-documents/dashboard-stats
// Lấy thống kê cho trang Dashboard Tổng quan
// GET /api/saved-documents/dashboard-stats
// Lấy thống kê cho trang Dashboard Tổng quan
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu companyId' });
    }

    const snapshot = await db.collection('saved_documents')
      .where('companyId', '==', companyId)
      .get();

    let totalQuotes = 0;
    let totalContracts = 0;
    let pendingCount = 0;
    let monthlyRevenue = 0;
    const allDocs = [];

    const currentYearMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"

    snapshot.forEach(doc => {
      const docData = doc.data();
      const type = docData.type;
      const data = docData.data || {};
      
      // Xác định trạng thái thực tế hoặc dùng giá trị mặc định tương thích ngược
      let status = docData.status;
      if (!status) {
        if (type === 'contract') status = 'Đã ký';
        else if (type === 'quote') status = 'Đã gửi';
        else if (type === 'delivery') status = 'Đã xuất';
        else if (type === 'order_confirm') status = 'Chờ xác nhận';
        else if (type === 'payment') status = 'Đã trả';
        else if (type === 'advance') status = 'Tạm ứng';
        else status = 'Nháp';
      }

      allDocs.push({
        id: doc.id,
        ...docData,
        status // Ghi đè trạng thái đã tính
      });

      if (type === 'quote') {
        totalQuotes++;
      } else if (type === 'contract' && status === 'Đã ký') {
        totalContracts++;
      } else if (type === 'order_confirm' && status === 'Chờ xác nhận') {
        pendingCount++;
      }

      // Tính doanh thu tháng từ các Hợp đồng ĐÃ KÝ trong tháng này
      if (type === 'contract' && status === 'Đã ký') {
        const docDate = docData.createdAt || docData.updatedAt || '';
        if (docDate.startsWith(currentYearMonth)) {
          const items = data.items || [];
          const taxRate = Number(data.taxRate || 0);
          const subtotal = items.reduce((sum, item) => {
            const qty = Number(item.quantity || 0);
            const price = Number(item.price || 0);
            const disc = Number(item.discount || 0);
            return sum + (qty * price * (1 - disc / 100));
          }, 0);
          const totalVal = subtotal * (1 + taxRate / 100);
          monthlyRevenue += totalVal;
        }
      }
    });

    // Sắp xếp in-memory theo ngày tạo giảm dần
    allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Lấy 5 hoạt động gần đây
    const recentDocs = allDocs.slice(0, 5);
    const recentActivities = recentDocs.map(doc => {
      const data = doc.data || {};
      let customerName = 'Khách hàng lẻ';
      
      if (doc.type === 'quote' || doc.type === 'delivery') {
        customerName = data.customerName || 'Khách hàng lẻ';
      } else if (doc.type === 'contract' || doc.type === 'order_confirm' || doc.type === 'advance' || doc.type === 'payment') {
        customerName = data.partyBName || data.customerName || data.sendTo || 'Khách hàng lẻ';
      }

      return {
        id: doc.id,
        docCode: data.id || 'N/A',
        documentName: doc.documentName || 'Chứng từ chưa đặt tên',
        type: doc.type,
        customerName,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        status: doc.status,
        data: doc.data || {},
        setId: doc.setId
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalQuotes,
        totalContracts,
        pendingCount,
        monthlyRevenue,
        recentActivities
      }
    });
  } catch (error) {
    console.error(`❌ [GET Dashboard Stats] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tổng hợp số liệu Dashboard.' });
  }
});

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

    const docs = snapshot.docs.map(doc => {
      const docData = doc.data();
      const type = docData.type;
      
      // Fallback cho status của dữ liệu cũ
      let status = docData.status;
      if (!status) {
        if (type === 'contract') status = 'Đã ký';
        else if (type === 'quote') status = 'Đã gửi';
        else if (type === 'delivery') status = 'Đã xuất';
        else if (type === 'order_confirm') status = 'Chờ xác nhận';
        else if (type === 'payment') status = 'Đã trả';
        else if (type === 'advance') status = 'Tạm ứng';
        else status = 'Nháp';
      }

      return { id: doc.id, ...docData, status };
    });
    
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
    const { setId, companyId, type, documentName, data, orderNumber, status } = req.body;

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
      orderNumber: typeof orderNumber === 'number' ? orderNumber : 1,
      status: status || (
        type === 'contract' ? 'Đang soạn' :
        type === 'quote' ? 'Đang soạn' :
        type === 'order_confirm' ? 'Chờ xác nhận' :
        type === 'delivery' ? 'Nháp' :
        type === 'payment' ? 'Chờ duyệt' :
        type === 'advance' ? 'Chờ duyệt' : 'Nháp'
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await newDocRef.set(newDocData);

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      '',
      '',
      `Tạo chứng từ: ${newDocData.documentName} (${type})`,
      { setId, type, companyId, docId: newDocRef.id },
      companyId
    );

    return res.status(201).json({ success: true, message: 'Lưu chứng từ thành công!', data: { id: newDocRef.id, ...newDocData } });
  } catch (error) {
    console.error(`❌ [POST Saved Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu chứng từ.' });
  }
});

// PUT /api/saved-documents/:id
// Cập nhật chứng từ đã lưu (tên, dữ liệu, hoặc chuyển sang bộ khác)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { documentName, data, setId, orderNumber, status } = req.body;

    const docRef = db.collection('saved_documents').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng từ cần cập nhật.' });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };
    if (documentName !== undefined) updateData.documentName = documentName;
    if (data !== undefined) updateData.data = data;
    if (setId !== undefined) updateData.setId = setId;
    if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
    if (status !== undefined) updateData.status = status;

    await docRef.update(updateData);

    const oldData = doc.data() || {};
    // Check if status changed
    let logMsg = `Cập nhật chứng từ: ${updateData.documentName || oldData.documentName} (${oldData.type})`;
    if (updateData.status && updateData.status !== oldData.status) {
      logMsg = `Chuyển trạng thái chứng từ ${oldData.documentName || oldData.id} (${oldData.type}) thành: ${updateData.status}`;
    }

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      '',
      '',
      logMsg,
      { id, updatedFields: Object.keys(updateData) },
      oldData.companyId
    );

    return res.status(200).json({ success: true, message: 'Cập nhật chứng từ thành công!', data: { id, ...oldData, ...updateData } });
  } catch (error) {
    console.error(`❌ [PUT Saved Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật chứng từ.' });
  }
});

// PATCH /api/saved-documents/batch-move
// Di chuyển nhiều chứng từ sang Bộ chứng từ khác
router.patch('/batch-move', async (req, res) => {
  try {
    const { docIds, targetSetId } = req.body;

    if (!docIds || !Array.isArray(docIds) || docIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu danh sách chứng từ (docIds)' });
    }
    if (!targetSetId) {
      return res.status(400).json({ success: false, message: 'Thiếu targetSetId (Bộ chứng từ đích)' });
    }

    // Kiểm tra bộ đích tồn tại
    const targetSetDoc = await db.collection('document_sets').doc(targetSetId).get();
    if (!targetSetDoc.exists) {
      return res.status(404).json({ success: false, message: 'Bộ chứng từ đích không tồn tại.' });
    }

    // Thực hiện batch update
    const batch = db.batch();
    const now = new Date().toISOString();

    for (const docId of docIds) {
      const docRef = db.collection('saved_documents').doc(docId);
      batch.update(docRef, { setId: targetSetId, updatedAt: now });
    }

    await batch.commit();

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      '',
      '',
      `Di chuyển ${docIds.length} chứng từ sang bộ "${targetSetDoc.data().title}"`,
      { docIds, targetSetId },
      targetSetDoc.data().companyId
    );

    return res.status(200).json({
      success: true,
      message: `Đã di chuyển ${docIds.length} chứng từ sang bộ "${targetSetDoc.data().title}" thành công!`,
      movedCount: docIds.length,
      targetSetTitle: targetSetDoc.data().title
    });
  } catch (error) {
    console.error(`❌ [PATCH Batch Move] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi di chuyển chứng từ.' });
  }
});

// DELETE /api/saved-documents/:id
// Xóa một chứng từ đã lưu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('saved_documents').doc(id);
    const docSnapshot = await docRef.get();
    
    if (docSnapshot.exists) {
      const docData = docSnapshot.data() || {};
      await docRef.delete();
      
      // Ghi audit log
      await logActivity(
        req.headers['x-username'],
        '',
        '',
        `Xóa chứng từ: ${docData.documentName} (${docData.type})`,
        { id, setId: docData.setId },
        docData.companyId
      );
    } else {
      await docRef.delete();
    }
    
    return res.status(200).json({ success: true, message: 'Đã xóa chứng từ.' });
  } catch (error) {
    console.error(`❌ [DELETE Saved Document] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa chứng từ.' });
  }
});

// POST /api/saved-documents/:id/send-email
// Gửi Email chứng từ trực tiếp (Mô phỏng và lưu nhật ký)
router.post('/:id/send-email', async (req, res) => {
  try {
    const { id } = req.params;
    const { toEmail, subject, messageBody } = req.body;
    
    if (!toEmail || !subject || !messageBody) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin gửi thư.' });
    }

    const docSnapshot = await db.collection('saved_documents').doc(id).get();
    if (!docSnapshot.exists) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng từ để gửi email.' });
    }

    const docData = docSnapshot.data() || {};

    // Lưu thông tin log gửi email vào collection email_logs
    const emailLogData = {
      documentId: id,
      documentName: docData.documentName,
      type: docData.type,
      toEmail,
      subject,
      messageBody,
      sender: req.headers['x-username'] || 'system',
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };

    await db.collection('email_logs').add(emailLogData);

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      '',
      '',
      `Gửi Email chứng từ: ${docData.documentName} tới ${toEmail}`,
      { toEmail, subject },
      docData.companyId
    );

    return res.status(200).json({ success: true, message: 'Đã gửi email thành công (mô phỏng)!' });
  } catch (error) {
    console.error(`❌ [POST Send Email] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi email.' });
  }
});

// GET /api/saved-documents/:id/email-logs
// Tải lịch sử gửi email của chứng từ
router.get('/:id/email-logs', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('email_logs')
      .where('documentId', '==', id)
      .get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logs.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(`❌ [GET Email Logs] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải nhật ký gửi email.' });
  }
});

export default router;
