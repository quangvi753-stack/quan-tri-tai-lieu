import express from 'express';
import { db, hashPassword, logActivity } from '../config/db.js';

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

// GET /api/users
// Lấy danh sách tài khoản
router.get('/', requireAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const { passwordHash, ...userInfo } = doc.data();
      return userInfo;
    });
    
    // Sắp xếp theo ngày tạo
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(`❌ [GET Users] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải danh sách tài khoản.' });
  }
});

// POST /api/users
// Cấp tài khoản mới
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, password, fullName, role, companyId } = req.body;

    if (!username || !password || !fullName || !role || !companyId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc để cấp tài khoản.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Kiểm tra tài khoản đã tồn tại chưa
    const userDoc = await db.collection('users').doc(cleanUsername).get();
    if (userDoc.exists) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã tồn tại trên hệ thống.' });
    }

    const newUserData = {
      username: cleanUsername,
      passwordHash: hashPassword(password),
      fullName: fullName.trim(),
      role,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(cleanUsername).set(newUserData);

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      'Quản trị viên',
      'admin',
      `Cấp tài khoản mới: ${cleanUsername}`,
      { role, companyId }
    );

    const { passwordHash, ...userResponse } = newUserData;
    return res.status(201).json({
      success: true,
      message: `Cấp tài khoản "${cleanUsername}" thành công!`,
      data: userResponse
    });
  } catch (error) {
    console.error(`❌ [POST User] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cấp tài khoản.' });
  }
});

// PUT /api/users/:username
// Cập nhật tài khoản
router.put('/:username', requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const { password, fullName, role, companyId } = req.body;

    const userDocRef = db.collection('users').doc(username.toLowerCase());
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (role !== undefined) updateData.role = role;
    if (companyId !== undefined) updateData.companyId = companyId;
    if (password && password.trim() !== '') {
      updateData.passwordHash = hashPassword(password);
    }

    await userDocRef.update(updateData);

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      'Quản trị viên',
      'admin',
      `Cập nhật tài khoản: ${username}`,
      { updatedFields: Object.keys(updateData) }
    );

    return res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    console.error(`❌ [PUT User] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật tài khoản.' });
  }
});

// DELETE /api/users/:username
// Xóa tài khoản
router.delete('/:username', requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.toLowerCase();

    if (cleanUsername === 'admin') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên tối cao.' });
    }

    const userDocRef = db.collection('users').doc(cleanUsername);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    await userDocRef.delete();

    // Ghi audit log
    await logActivity(
      req.headers['x-username'],
      'Quản trị viên',
      'admin',
      `Xóa tài khoản: ${cleanUsername}`,
      {}
    );

    return res.status(200).json({ success: true, message: 'Đã xóa tài khoản thành công.' });
  } catch (error) {
    console.error(`❌ [DELETE User] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa tài khoản.' });
  }
});

export default router;
