import express from 'express';
import { db, hashPassword, logActivity } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { authenticateJWT } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/auth/login
// Đăng nhập hệ thống
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const userDoc = await db.collection('users').doc(cleanUsername).get();

    if (!userDoc.exists) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại trên hệ thống.' });
    }

    const userData = userDoc.data();
    const hashedPasswordInput = hashPassword(password);

    if (userData.passwordHash !== hashedPasswordInput) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác.' });
    }

    // Trả về thông tin user (loại bỏ mật khẩu)
    const { passwordHash, ...userResponse } = userData;

    // Ký JWT Token
    const token = jwt.sign(
      { 
        username: userResponse.username, 
        role: userResponse.role, 
        companyId: userResponse.companyId, 
        fullName: userResponse.fullName 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Ghi audit log
    await logActivity(
      userResponse.username, 
      userResponse.fullName, 
      userResponse.role, 
      'Đăng nhập hệ thống', 
      {}, 
      userResponse.companyId
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error(`❌ [POST Auth Login] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý đăng nhập.' });
  }
});

// GET /api/auth/me
// Lấy thông tin tài khoản hiện tại từ JWT token thông qua middleware
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const cleanUsername = req.user.username.trim().toLowerCase();
    const userDoc = await db.collection('users').doc(cleanUsername).get();

    if (!userDoc.exists) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
    }

    const { passwordHash, ...userResponse } = userDoc.data();
    return res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.error(`❌ [GET Auth Me] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực phiên.' });
  }
});

// PUT /api/auth/change-password
// Thay đổi mật khẩu cho tài khoản hiện tại
router.put('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }

    const cleanUsername = req.user.username.trim().toLowerCase();
    const userDocRef = db.collection('users').doc(cleanUsername);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại.' });
    }

    const userData = userDoc.data();
    const hashedCurrentInput = hashPassword(currentPassword);

    if (userData.passwordHash !== hashedCurrentInput) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
    }

    await userDocRef.update({
      passwordHash: hashPassword(newPassword),
      updatedAt: new Date().toISOString()
    });

    // Ghi audit log
    await logActivity(
      userData.username,
      userData.fullName,
      userData.role,
      'Đổi mật khẩu tài khoản',
      {},
      userData.companyId
    );

    return res.status(200).json({ success: true, message: 'Thay đổi mật khẩu thành công!' });
  } catch (error) {
    console.error(`❌ [PUT Auth ChangePassword] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thay đổi mật khẩu.' });
  }
});

export default router;
