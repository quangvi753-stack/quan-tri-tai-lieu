# Quản trị Tài liệu - Project Local

Ứng dụng quản trị tài liệu kết nối với cơ sở dữ liệu Google Cloud Firestore.

## ⚙️ Cấu hình Google Cloud (Firestore)

Dự án này được thiết lập kết nối trực tiếp với dự án Google Cloud của tài khoản:
*   **Tài khoản Google kết nối:** `quangvi7533@gmail.com`
*   **Project ID:** `project-900e00f8-bb89-49fa-aeb` (quan tri tai lieu)

### Các lệnh cài đặt môi trường đăng nhập:

Để chạy dự án local, máy tính cần được đăng nhập với tài khoản Google trên bằng lệnh:
```bash
# Đăng nhập gcloud SDK
gcloud auth login

# Đăng nhập Application Default Credentials (ADC) để Backend NodeJS nhận diện quyền truy cập
gcloud auth application-default login

# Đặt dự án hạn mức (quota project)
gcloud auth application-default set-quota-project project-900e00f8-bb89-49fa-aeb
```

## 🚀 Khởi chạy dự án

1. **Khởi chạy Frontend:**
   ```bash
   npm run dev
   ```
   *Giao diện chạy tại:* [http://localhost:5173/](http://localhost:5173/)

2. **Khởi chạy Backend:**
   ```bash
   npm run server
   ```
   *Backend chạy tại:* [http://localhost:8080](http://localhost:8080)
