import { db } from './server/config/db.js';

async function testFirestore() {
  try {
    console.log('🔄 Bắt đầu kiểm tra kết nối Firestore...');
    
    // Tạo tham chiếu đến một Collection test
    const testDocRef = db.collection('test_connection').doc('hello_world');
    
    // Ghi dữ liệu
    await testDocRef.set({
      message: 'Xin chào! Backend của bạn đã kết nối thành công với Google Cloud Firestore.',
      timestamp: new Date().toISOString(),
      project: 'Quản trị tài liệu'
    });
    
    console.log('✅ Đã ghi thành công một bản ghi thử nghiệm vào collection "test_connection".');
    
    // Đọc lại dữ liệu để xác nhận
    const doc = await testDocRef.get();
    if (doc.exists) {
      console.log('✅ Đã đọc lại dữ liệu thành công:');
      console.log(doc.data());
    } else {
      console.log('❌ Không tìm thấy dữ liệu vừa ghi.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra Firestore:', error);
    process.exit(1);
  }
}

testFirestore();
