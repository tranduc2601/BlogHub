# 🚀 HƯỚNG DẪN SỬA LỖI NHANH - BlogHub Production

## 📌 Thông tin của bạn:
- **Railway Backend:** https://zonal-illumination-production-a714.up.railway.app
- **Vercel Frontend:** https://blog-hub-chi-five.vercel.app

---

## ⚡ BƯỚC 1: CẤU HÌNH RAILWAY (5 phút)

### 1. Truy cập Railway Variables
```
https://railway.app/project/73cb1f3a-8af3-4b23-972e-c0e750bd1f63
```
→ Chọn service **zonal-illumination** → Tab **Variables**

### 2. Thêm các biến sau (nếu chưa có):

#### ✅ Kiểm tra Database Variables (từ MySQL service):
- Nhấn vào **MySQL service** trong project
- Copy các giá trị từ tab **Variables**:
  - `MYSQLHOST` → dùng cho `DB_HOST`
  - `MYSQLPORT` → dùng cho `DB_PORT`  
  - `MYSQLUSER` → dùng cho `DB_USER`
  - `MYSQLPASSWORD` → dùng cho `DB_PASSWORD`
  - `MYSQLDATABASE` → dùng cho `DB_NAME`

#### ✅ Thêm vào zonal-illumination service:

```bash
# Database (copy từ MySQL service)
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=xxxx
DB_USER=root
DB_PASSWORD=<password-from-mysql-service>
DB_NAME=railway

# Server
NODE_ENV=production
PORT=5000

# Frontend URL (URL Vercel của bạn - KHÔNG có "/" ở cuối)
FRONTEND_URL=https://blog-hub-chi-five.vercel.app
CLIENT_URL=https://blog-hub-chi-five.vercel.app

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Cloudinary (giữ nguyên)
CLOUDINARY_CLOUD_NAME=dawmynd1u
CLOUDINARY_API_KEY=577255341421261
CLOUDINARY_API_SECRET=l0rF2YJtdJN8c9wsMkyYUGW-5DI
```

#### ⚠️ Tạo JWT_SECRET mạnh hơn:
```powershell
# Chạy trong VS Code Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy kết quả và thay thế `JWT_SECRET`

### 3. Deploy Railway
- Sau khi thêm variables → Railway tự động redeploy
- Hoặc nhấn nút **Deploy** ở góc trên bên phải

### 4. Kiểm tra Logs
- Tab **Logs** → Xem có lỗi không
- Đợi deploy xong (30-60 giây)

---

## ⚡ BƯỚC 2: CẤU HÌNH VERCEL (3 phút)

### 1. Truy cập Vercel Settings
```
https://vercel.com/dashboard
```
→ Chọn project **blog-hub-chi-five** → **Settings** → **Environment Variables**

### 2. Thêm biến mới

**Nhấn "Add New":**

```
Name: VITE_API_BASE_URL
Value: https://zonal-illumination-production-a714.up.railway.app/api
Environment: Production (và Preview nếu muốn)
```

⚠️ **QUAN TRỌNG:** Phải có `/api` ở cuối URL!

### 3. Redeploy Vercel

**Cách 1: Trigger từ Git (Khuyến nghị)**
```powershell
cd "D:\OneDrive\Máy tính\BlogHub_GitHub"
git add .
git commit -m "Fix: Add production API URL" --allow-empty
git push origin master
```

**Cách 2: Manual Redeploy**
- Tab **Deployments** → Click vào deployment mới nhất
- Click **...** (3 chấm) → **Redeploy**
- ✅ Chọn: **Use existing Build Cache** (BỎ chọn)
- Click **Redeploy**

---

## ✅ BƯỚC 3: KIỂM TRA

### 1. Đợi Vercel deploy xong (2-3 phút)
- Xem progress tại: https://vercel.com/dashboard

### 2. Mở website production
```
https://blog-hub-chi-five.vercel.app
```

### 3. Kiểm tra Console (F12)
- **Trước:** Lỗi `localhost:5000` 
- **Sau:** Request gọi đến `zonal-illumination-production-a714.up.railway.app`

### 4. Test đăng nhập
- Thử đăng nhập/đăng ký
- Nếu thành công = ✅ ĐÃ FIX!

---

## 🔴 NẾU VẪN LỖI

### Lỗi CORS (Access-Control-Allow-Origin)
**Nguyên nhân:** `FRONTEND_URL` trên Railway chưa đúng

**Giải pháp:**
1. Kiểm tra lại `FRONTEND_URL` và `CLIENT_URL` trên Railway
2. Phải là URL Vercel chính xác: `https://blog-hub-chi-five.vercel.app`
3. KHÔNG có `/` ở cuối
4. Redeploy Railway

### Lỗi 500 Internal Server Error
**Nguyên nhân:** Database không kết nối được hoặc thiếu variables

**Giải pháp:**
1. Kiểm tra Railway Logs
2. Đảm bảo MySQL service đang chạy
3. Kiểm tra lại DB_HOST, DB_PORT, DB_PASSWORD
4. Test connection trong Railway Logs

### Lỗi 404 Not Found
**Nguyên nhân:** URL không đúng format

**Giải pháp:**
1. `VITE_API_BASE_URL` phải có `/api` ở cuối
2. Đúng: `https://...railway.app/api`
3. Sai: `https://...railway.app`

---

## 📝 CHECKLIST

### Railway Backend:
- [ ] Đã thêm `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Đã thêm `FRONTEND_URL` và `CLIENT_URL` (URL Vercel)
- [ ] Đã thêm `JWT_SECRET` (>32 ký tự)
- [ ] Đã thêm `JWT_EXPIRES_IN=7d`
- [ ] Đã thêm `NODE_ENV=production`
- [ ] Cloudinary variables đã có
- [ ] Deploy thành công, không có lỗi trong Logs

### Vercel Frontend:
- [ ] Đã thêm `VITE_API_BASE_URL` với `/api` ở cuối
- [ ] Đã redeploy
- [ ] Build thành công

### Test:
- [ ] Website mở được
- [ ] Không còn lỗi `localhost` trong Console
- [ ] Đăng nhập/Đăng ký hoạt động
- [ ] Các tính năng (post, comment, like) hoạt động

---

## 🆘 Support

Nếu vẫn gặp lỗi, gửi cho tôi:
1. Screenshot Railway Logs (tab Logs)
2. Screenshot Vercel Build Logs
3. Screenshot Console errors (F12)

---

**Thời gian ước tính:** 8-10 phút
**Độ khó:** ⭐⭐ (Trung bình)
