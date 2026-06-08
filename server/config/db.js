import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Khởi tạo Firestore
const firestoreOptions = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'project-900e00f8-bb89-49fa-aeb',
};
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firestoreOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
console.log('🔥 [Firestore Init] options:', JSON.stringify(firestoreOptions, null, 2));
const db = new Firestore(firestoreOptions);

export const hashPassword = (password) => {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
};

const seedUsers = async () => {
  try {
    const usersCol = db.collection('users');
    const snapshot = await usersCol.get();
    
    if (snapshot.empty) {
      console.log('🌱 [Database] Seeding default administrator account...');
      const adminData = {
        username: 'admin',
        passwordHash: hashPassword('admin123'),
        fullName: 'Quản trị viên',
        role: 'admin',
        companyId: 'comp_qvn_hanoi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Sử dụng username làm doc ID để tìm kiếm nhanh và tránh trùng lặp
      await usersCol.doc('admin').set(adminData);
      console.log('🌱 [Database] Seeding completed: Username = admin, Password = admin123');
    }
  } catch (err) {
    console.error('❌ [Database] Seeding failed:', err);
  }
};

export const logActivity = async (username, fullName, role, action, details = {}, companyId = '') => {
  try {
    await db.collection('audit_logs').add({
      username: username || 'system',
      fullName: fullName || username || 'Hệ thống',
      role: role || 'system',
      action,
      details,
      companyId: companyId || '',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ [Database] Failed to write audit log:', err);
  }
};

export const connectDB = async () => {
  try {
    // Kiểm tra kết nối bằng cách đọc thử collection users
    await db.collection('users').get();
    console.log('✅ [Database] Google Cloud Firestore Native Connected Successfully');
    
    // Tạo tài khoản admin mặc định nếu chưa có
    await seedUsers();
    
    return true;
  } catch (error) {
    console.error('❌ [Database] Connection Error:', error);
    return false;
  }
};

export { db };
