import express from 'express';
import { db } from '../config/db.js';

const router = express.Router();

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
  try {
    const adminUsername = req.headers['x-username'];
    if (!adminUsername) {
      return res.status(401).json({ success: false, message: 'Quyền truy cập bị từ chối. Vui lòng đăng nhập.' });
    }
    const userDoc = await db.collection('users').doc(adminUsername.toLowerCase()).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Yêu cầu quyền Quản trị viên.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi xác thực quyền hạn.' });
  }
};

// GET /api/audit-logs
// Lấy danh sách lịch sử thao tác hệ thống (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('audit_logs').get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sắp xếp theo timestamp giảm dần
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error(`❌ [GET Audit Logs] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải nhật ký hoạt động.' });
  }
});

export default router;
