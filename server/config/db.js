import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo Firestore. 
// Chú ý: Cần thiết lập biến môi trường GOOGLE_APPLICATION_CREDENTIALS trỏ tới file JSON key của service account,
// Hoặc điền projectId và credentials trực tiếp nếu cần thiết.
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'project-900e00f8-bb89-49fa-aeb',
});

export const connectDB = async () => {
  try {
    // Kiểm tra kết nối đơn giản bằng cách lấy danh sách collections
    const collections = await db.listCollections();
    console.log('✅ [Database] Google Cloud Firestore Native Connected Successfully');
    return true;
  } catch (error) {
    console.error('❌ [Database] Connection Error:', error);
    return false;
  }
};

export { db };
