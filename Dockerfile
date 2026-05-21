# Sử dụng Node.js bản chính thức mới nhất
FROM node:20-alpine

# Cài đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các thư viện Node.js (bao gồm dev để build Vite)
RUN npm install --legacy-peer-deps

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Xây dựng (build) giao diện Frontend bằng Vite
RUN npm run build

# Xóa bớt các thư viện dev để giảm dung lượng container
RUN npm prune --production --legacy-peer-deps

# Khai báo cổng chạy ứng dụng
EXPOSE 8080

# Chạy server
CMD [ "npm", "run", "server" ]
