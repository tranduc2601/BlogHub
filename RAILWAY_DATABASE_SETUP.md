# 🚂 Hướng Dẫn Setup Railway Database - Team Làm Việc Từ Xa

## 📌 Tổng Quan

Hướng dẫn này giúp team làm việc từ xa (không cùng mạng LAN) đồng bộ dữ liệu qua **Railway MySQL Database** - miễn phí và dễ setup.

**Ai nên đọc:** Tất cả thành viên trong team (kể cả Team Lead)

**Thời gian setup:** ~15 phút

---

## 🎯 Kết Quả Sau Khi Hoàn Thành

- ✅ Tất cả thành viên kết nối đến **cùng 1 MySQL database trên cloud**
- ✅ Mỗi người chạy backend + frontend trên máy local
- ✅ Dữ liệu đồng bộ realtime: Máy A tạo post → Máy B refresh thấy ngay
- ✅ Không cần VPN, không cần cùng mạng LAN

---

## 👥 PHẦN 1: TEAM LEAD - Setup Database (1 lần duy nhất)

### Bước 1: Tạo Railway Account & MySQL Database

1. **Truy cập:** https://railway.app
2. **Đăng ký/Đăng nhập:** Dùng GitHub account (khuyến nghị)
3. **Create New Project:**
   - Click "New Project"
   - Chọn "Provision MySQL"
   - Đợi ~30 giây để Railway tạo database

### Bước 2: Lấy Thông Tin Kết Nối

Trong Railway Dashboard:

1. Click vào **MySQL service**
2. Tab **Variables** → Sao chép các thông tin sau:

```env
MYSQLHOST=xxxx.railway.app
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=AbCdEfGh123456
MYSQLDATABASE=railway
```

### Bước 3: Kết Nối & Import Schema

**Option A: Dùng MySQL Workbench (Khuyến nghị)**

1. Mở MySQL Workbench
2. Tạo kết nối mới:
   - **Connection Name:** Railway BlogHub
   - **Hostname:** `xxxx.railway.app` (từ MYSQLHOST)
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** (từ MYSQLPASSWORD)
3. Test Connection → OK
4. Mở connection
5. File → Open SQL Script → Chọn `server/schema.sql`
6. Click Execute (⚡ icon)

**Option B: Dùng Command Line**

```powershell
# Windows PowerShell
# Thay thế thông tin từ Railway Variables
mysql -h xxxx.railway.app -P 3306 -u root -p'AbCdEfGh123456' railway < server/schema.sql
```

✅ Kiểm tra: Trong Railway Dashboard → Data tab → Phải thấy các bảng: `users`, `posts`, `comments`, `reports`

### Bước 4: Tạo Admin User

```powershell
# Tạm thời update .env để chạy setup script
cd server
# Edit file .env với thông tin Railway (xem Bước 5)

# Chạy script tạo admin
node setup-admin.js

# Nhập thông tin admin khi được hỏi
```

### Bước 5: Share Thông Tin Cho Team

**Tạo file `RAILWAY_CREDENTIALS.txt`** (KHÔNG commit lên Git):

```env
# RAILWAY DATABASE CREDENTIALS
# Share cho team qua Slack/Discord/Email - KHÔNG commit lên Git!

DB_HOST=xxxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=AbCdEfGh123456
DB_NAME=railway

# Admin Login (để test)
Admin Email: admin@bloghub.com
Admin Password: (mật khẩu bạn đã tạo)
```

**Share qua:**
- Slack/Discord (private message)
- Email
- Google Drive (private share)

⚠️ **LƯU Ý BẢO MẬT:**
- KHÔNG commit file này lên GitHub
- KHÔNG share public
- Chỉ share cho thành viên trong team

---

## 👨‍💻 PHẦN 2: TẤT CẢ THÀNH VIÊN - Setup Local Environment

### Bước 1: Clone Project (nếu chưa có)

```powershell
git clone https://github.com/your-team/bloghub-project.git
cd bloghub-project
```

### Bước 2: Update Backend Configuration

**File: `server/.env`**

Thay thế toàn bộ nội dung bằng:

```env
# Railway MySQL Database (Shared)
DB_HOST=xxxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=AbCdEfGh123456
DB_NAME=railway

# Server Settings (Local)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secret (Same for all team members)
JWT_SECRET=bloghub-team-secret-key-2025
JWT_EXPIRES_IN=7d
```

⚠️ **QUAN TRỌNG:**
- `DB_*` credentials phải **GIỐNG NHAU** cho tất cả thành viên
- `JWT_SECRET` phải **GIỐNG NHAU** để token hoạt động đúng
- `PORT` có thể khác nhau nếu cần (5000, 5001, 5002...)

### Bước 3: Install Dependencies

```powershell
# Install backend dependencies
cd server
npm install

# Quay lại root và install frontend dependencies
cd ..
npm install
```

### Bước 4: Test Database Connection

```powershell
# Từ root project
cd server
node test-api.js
```

**Kết quả mong đợi:**
```
✅ PASS: Kết nối database thành công
✅ Bảng 'users': X records
✅ Bảng 'posts': X records
✅ Bảng 'comments': X records
✅ Bảng 'reports': X records
✅ Đã có admin user
```

❌ **Nếu thất bại:**
- Kiểm tra lại thông tin trong `.env`
- Kiểm tra internet connection
- Hỏi Team Lead xác nhận credentials

### Bước 5: Chạy Application

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
# Từ root project
npm run dev
```

**Mở browser:** http://localhost:5173

---

## 🧪 PHẦN 3: TEST ĐỒNG BỘ Dữ LIỆU

### Test 1: Đăng Nhập Admin

Mỗi thành viên thử:
1. Vào http://localhost:5173
2. Đăng nhập với admin account (Team Lead đã share)
3. Vào Admin Dashboard

✅ Tất cả mọi người phải thấy **cùng 1 số liệu**: số posts, users, comments

### Test 2: Tạo Dữ Liệu

**Thành viên A:**
1. Vào Admin Dashboard
2. Tạo 1 bài viết mới với title: `Test from [Tên bạn]`
3. Xem số lượng posts tăng lên

**Thành viên B, C, D:**
1. Refresh trang Admin Dashboard
2. ✅ **PASS:** Thấy bài viết mới từ A
3. ✅ **PASS:** Số lượng posts tăng

### Test 3: Update Dữ Liệu

**Thành viên B:**
1. Ẩn bài viết của A (Toggle status)

**Thành viên A:**
1. Refresh trang
2. ✅ **PASS:** Bài viết của A đã bị ẩn

### Test 4: Delete Dữ Liệu

**Thành viên C:**
1. Xóa 1 bài viết

**Tất cả thành viên khác:**
1. Refresh
2. ✅ **PASS:** Bài viết không còn

---

## 🔧 TROUBLESHOOTING

### Lỗi 1: "Cannot connect to database"

**Nguyên nhân:** Sai thông tin kết nối

**Giải pháp:**
```powershell
# Kiểm tra từng dòng trong .env
cat server/.env

# So sánh với credentials Team Lead share
# Đảm bảo KHÔNG có khoảng trắng thừa
```

### Lỗi 2: "Authentication failed" khi login

**Nguyên nhân:** `JWT_SECRET` khác nhau giữa các thành viên

**Giải pháp:**
- Tất cả thành viên phải dùng **CÙNG** `JWT_SECRET`
- Team Lead share 1 secret chung
- Ví dụ: `JWT_SECRET=bloghub-team-secret-key-2025`

### Lỗi 3: "Table doesn't exist"

**Nguyên nhân:** Team Lead chưa import schema

**Giải pháp:**
- Team Lead chạy lại: `mysql ... < server/schema.sql`
- Hoặc dùng MySQL Workbench import `schema.sql`

### Lỗi 4: Data không đồng bộ

**Kiểm tra:**
```powershell
# Mỗi thành viên chạy
cd server
node -e "import('./config/database.js').then(async (m) => { const [rows] = await m.default.query('SELECT DATABASE()'); console.log('Connected to:', rows[0]); process.exit(0); })"
```

✅ Tất cả phải thấy: `Connected to: { 'DATABASE()': 'railway' }`

❌ Nếu khác nhau → Kiểm tra lại `DB_NAME` trong `.env`

---

## 💡 BEST PRACTICES

### 1. Quản Lý Git

**File `.gitignore` đã có:**
```gitignore
server/.env
.env
RAILWAY_CREDENTIALS.txt
```

✅ **ĐÚNG:**
- Mỗi người tự tạo file `.env` local
- KHÔNG commit `.env` lên GitHub

❌ **SAI:**
- Commit `.env` với credentials lên Git
- Share credentials qua GitHub Issues/Comments

### 2. Backup Data

**Team Lead nên:**
```powershell
# Backup database hàng tuần
mysqldump -h xxxx.railway.app -P 3306 -u root -p'password' railway > backup_$(date +%Y%m%d).sql
```

### 3. Security

- Đổi `JWT_SECRET` định kỳ (1 tháng/lần)
- Không share Railway credentials công khai
- Dùng Railway's built-in IP whitelist nếu cần

---

## 📊 Railway Free Tier Limits

✅ **Được miễn phí:**
- 500 hours/month execution time
- 512 MB RAM
- 1 GB Disk
- Shared CPU

⚠️ **Giới hạn:**
- Database size: 1GB
- Bandwidth: 100GB/month

**Đủ cho:**
- Team 5-10 người
- ~5000 posts
- ~50000 comments
- Development & testing

---

## 🎓 WORKFLOW HÀNG NGÀY

### Khi Bắt Đầu Làm Việc:

```powershell
# Terminal 1
cd server
npm start

# Terminal 2 (new terminal)
npm run dev
```

### Khi Kết Thúc:

```powershell
# Ctrl+C để stop cả 2 terminals
# Không cần làm gì thêm - data đã lưu trên cloud
```

### Khi Pull Code Mới Từ Git:

```powershell
git pull origin main

# Nếu có thay đổi dependencies
npm install
cd server && npm install

# Chạy lại
cd server && npm start  # Terminal 1
npm run dev             # Terminal 2
```

---

## ✅ CHECKLIST

### Team Lead:
- [ ] Tạo Railway account
- [ ] Provision MySQL database
- [ ] Import schema.sql
- [ ] Chạy setup-admin.js
- [ ] Share credentials cho team (qua private channel)
- [ ] Test connection từ máy mình
- [ ] Hướng dẫn team nếu gặp vấn đề

### Tất Cả Thành Viên:
- [ ] Clone project
- [ ] Tạo file `server/.env` với credentials đã được share
- [ ] `npm install` cho cả root và server
- [ ] Chạy `node server/test-api.js` → Pass
- [ ] Chạy backend (`npm start` trong folder server)
- [ ] Chạy frontend (`npm run dev` ở root)
- [ ] Test đăng nhập admin
- [ ] Test tạo/sửa/xóa data
- [ ] Xác nhận data đồng bộ với team khác

---

## 🆘 SUPPORT

Nếu gặp vấn đề:

1. **Đọc lại phần Troubleshooting**
2. **Chạy test script:**
   ```powershell
   cd server
   node test-api.js
   ```
3. **Hỏi Team Lead** với thông tin:
   - Error message đầy đủ
   - Output của `test-api.js`
   - Screenshot nếu có

---

## 🎉 KẾT LUẬN

Sau khi setup xong:
- ✅ Team làm việc với **cùng 1 database trên cloud**
- ✅ Không cần VPN hay cùng mạng LAN
- ✅ Dữ liệu đồng bộ realtime
- ✅ Mỗi người dev trên máy local
- ✅ Railway free tier đủ dùng cho development

**Happy Coding! 🚀**
