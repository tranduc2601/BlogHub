# 🚀 Hướng Dẫn Deployment & Đồng Bộ Dữ Liệu Cho Team

## 📌 Tổng Quan

Dự án BlogHub hiện đã được cấu hình để **đồng bộ dữ liệu thực qua API** giữa nhiều máy/thành viên trong team. Không còn sử dụng mock data fallback.

### ✅ Đã Hoàn Thành:
- ✅ Backend API với Node.js/Express đầy đủ CRUD operations
- ✅ MySQL Database làm nguồn dữ liệu duy nhất
- ✅ Frontend hooks loại bỏ mock data, bắt buộc dùng API
- ✅ Admin dashboard lấy thống kê thực từ database

---

## 🔧 Cách 1: Làm Việc Trên Mạng LAN (Nội Bộ)

### 📍 Phù hợp cho team làm việc cùng văn phòng/mạng WiFi

### A. Cấu hình máy làm Server (1 máy trong team)

#### 1. Kiểm tra IP của máy server
```powershell
ipconfig
```
Tìm dòng **IPv4 Address** (VD: `192.168.1.100`)

#### 2. Cấu hình MySQL cho Remote Access

**Bước 1:** Mở MySQL Workbench hoặc terminal MySQL:
```sql
-- Tạo user cho remote access
CREATE USER 'bloghub_team'@'%' IDENTIFIED BY 'your_secure_password';

-- Cấp quyền truy cập
GRANT ALL PRIVILEGES ON bloghub.* TO 'bloghub_team'@'%';
FLUSH PRIVILEGES;
```

**Bước 2:** Chỉnh sửa file cấu hình MySQL `my.ini` (Windows) hoặc `my.cnf` (Linux/Mac):

Tìm dòng:
```ini
bind-address = 127.0.0.1
```

Đổi thành:
```ini
bind-address = 0.0.0.0
```

**Bước 3:** Restart MySQL service:
```powershell
# Windows
net stop MySQL80
net start MySQL80

# Hoặc dùng Services app (services.msc)
```

#### 3. Cấu hình Backend Server

File `.env` trên máy server:
```env
# Database
DB_HOST=localhost
DB_USER=bloghub_team
DB_PASSWORD=your_secure_password
DB_NAME=bloghub

# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

#### 4. Mở Port cho Backend API

**Windows Firewall:**
```powershell
# Mở port 5000 cho Node.js server
New-NetFirewallRule -DisplayName "BlogHub API Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

#### 5. Chạy Backend Server
```powershell
cd server
npm install
npm start
```

Server sẽ chạy tại: `http://192.168.1.100:5000`

---

### B. Cấu hình máy Client (các thành viên khác)

#### 1. Update file `.env` trong frontend

Tạo/chỉnh sửa file `.env` tại root project:
```env
VITE_API_URL=http://192.168.1.100:5000/api
```

#### 2. Update file `axios.ts`

File: `src/config/axios.ts`
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### 3. Chạy Frontend
```powershell
npm install
npm run dev
```

---

## ☁️ Cách 2: Deploy Database Lên Cloud (Khuyến Nghị Cho Team Từ Xa)

### 📍 Phù hợp cho team làm việc từ xa hoặc nhiều địa điểm

### 🚂 Option A: Railway.app - MySQL Database (KHUYẾN NGHỊ)

**Ưu điểm:**
- ✅ Miễn phí (500 hours/month, 1GB storage)
- ✅ Setup trong 15 phút
- ✅ Tự động backup
- ✅ Không cần credit card
- ✅ Đủ cho team 5-10 người development

**📖 Hướng dẫn chi tiết:** Xem file `RAILWAY_DATABASE_SETUP.md`

**Quick Setup:**

1. **Team Lead - Setup 1 lần:**
   ```bash
   # 1. Truy cập https://railway.app
   # 2. Login với GitHub
   # 3. New Project → Provision MySQL
   # 4. Copy credentials từ Variables tab
   
   # 5. Import schema
   mysql -h railway-host.railway.app -P 3306 -u root -pPASSWORD railway < server/schema.sql
   
   # 6. Setup admin
   # (Update server/.env với Railway credentials trước)
   cd server
   node setup-admin.js
   
   # 7. Share credentials cho team (private message)
   ```

2. **Tất cả members (kể cả Team Lead):**
   ```bash
   # Tạo file server/.env từ .env.example
   cp server/.env.example server/.env
   
   # Edit server/.env với Railway credentials
   # DB_HOST=xxx.railway.app
   # DB_PASSWORD=xxx
   # JWT_SECRET=bloghub-team-secret-2025 (PHẢI GIỐNG NHAU!)
   
   # Verify connection
   cd server
   node verify-railway.js
   
   # Chạy app
   npm start  # Terminal 1
   cd .. && npm run dev  # Terminal 2
   ```

3. **Test đồng bộ:**
   - Máy A: Tạo 1 post
   - Máy B: Refresh → Thấy post mới ✅

### Option B: PlanetScale (MySQL Compatible - Miễn Phí Tier)

1. Truy cập: https://planetscale.com
2. Tạo database mới
3. Lấy connection string
4. Update `.env`

### Option C: AWS RDS / Google Cloud SQL (Có Phí)

Cho production app chính thức.

---

## 🚀 Cách 3: Deploy Full Stack Lên Cloud

### Deploy Backend API

**Render.com (Khuyến nghị - Miễn phí):**

1. Push code lên GitHub
2. Tạo Web Service trên Render.com
3. Connect GitHub repo
4. Build Command: `cd server && npm install`
5. Start Command: `cd server && npm start`
6. Thêm Environment Variables từ `.env`
7. Deploy!

URL backend sẽ là: `https://your-app.onrender.com`

### Deploy Frontend

**Vercel (Khuyến nghị - Miễn phí):**

1. Push code lên GitHub
2. Import project từ Vercel
3. Set Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy!

**Netlify:**
Tương tự Vercel.

---

## 🧪 Test Đồng Bộ Dữ Liệu

### Test Case 1: Nhiều Trình Duyệt
1. Mở 2 cửa sổ browser khác nhau
2. Đăng nhập admin trên cả 2
3. Thực hiện thay đổi (ẩn/hiện post) trên Browser 1
4. Refresh Browser 2
5. ✅ Dữ liệu phải giống nhau

### Test Case 2: Nhiều Máy
1. Máy A: Admin ẩn 1 bài viết
2. Máy B: Refresh trang admin
3. ✅ Bài viết phải bị ẩn trên Máy B

### Test Case 3: Thống Kê Realtime
1. Máy A: Tạo bài viết mới
2. Máy B: Refresh admin dashboard
3. ✅ Số lượng bài viết tăng lên

---

## 🔐 Bảo Mật

### 1. Đổi JWT Secret
File `.env`:
```env
JWT_SECRET=random_string_at_least_32_characters_long_abc123xyz
```

### 2. Đổi MySQL Password
```sql
ALTER USER 'bloghub_team'@'%' IDENTIFIED BY 'new_strong_password_here';
```

### 3. CORS Configuration
File `server/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

---

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối đến server"
✅ Kiểm tra:
- Backend server có đang chạy không? (`http://localhost:5000`)
- Firewall có block port không?
- IP address có đúng không?

### Lỗi: "Failed to load admin data"
✅ Kiểm tra:
- Database có running không?
- Schema đã import chưa? (`server/schema.sql`)
- User có quyền truy cập database không?

### Lỗi: "Authentication failed"
✅ Kiểm tra:
- Token có hết hạn không? (Đăng xuất và đăng nhập lại)
- User có role `admin` không?

---

## 📊 Kiểm Tra Kết Nối

### Test Database Connection
```powershell
cd server
node -e "import('./config/database.js').then(m => m.testConnection())"
```

### Test API Endpoints
```powershell
# Health check
curl http://localhost:5000

# Get admin posts (cần token)
curl http://localhost:5000/api/admin/posts -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Checklist Cho Team Lead

- [ ] Cài đặt MySQL server trên 1 máy hoặc cloud
- [ ] Import schema từ `server/schema.sql`
- [ ] Tạo admin user: `node server/setup-admin.js`
- [ ] Chạy backend server: `npm start` trong folder `server`
- [ ] Share IP address + credentials cho team
- [ ] Hướng dẫn team update `VITE_API_URL` trong `.env`
- [ ] Test sync bằng cách tạo/sửa/xóa data từ 2 máy khác nhau

---

## 🎯 Kết Luận

Sau khi hoàn thành setup:
- ✅ Tất cả thành viên trong team sẽ thấy **cùng 1 dữ liệu**
- ✅ Thay đổi từ máy A sẽ **hiện ngay trên máy B** khi refresh
- ✅ Không còn vấn đề dữ liệu khác nhau giữa các máy
- ✅ Admin dashboard hiển thị **thống kê thực** từ database

**Lưu ý:** Dữ liệu hiện được lưu trong **MySQL database duy nhất**. Không sử dụng localStorage hay mock data nữa.
