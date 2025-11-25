# 🚨 Khắc Phục Lỗi Production - ERR_CONNECTION_REFUSED

## ❌ Vấn đề hiện tại:
Frontend trên Vercel đang cố kết nối tới `localhost:5000` thay vì Railway backend URL.

Lỗi hiện tại: **Request failed with status code 500** - Backend Railway có lỗi hoặc thiếu environment variables.

---

## ✅ Giải pháp: Cấu hình Environment Variables

### **🎯 Railway Backend URL của bạn:**
```
https://zonal-illumination-production-a714.up.railway.app
```

---

## **BƯỚC 1: Cấu hình Railway Backend (QUAN TRỌNG NHẤT)**

### 1.1. Truy cập Railway Variables
1. Vào https://railway.app/dashboard
2. Chọn project **BlogHub** → Service **zonal-illumination**
3. Tab **Variables**

### 1.2. Thêm/Kiểm tra các biến sau:

**⚠️ QUAN TRỌNG - Copy chính xác:**

```bash
# Database Configuration (từ Railway MySQL service)
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=6379
DB_USER=root
DB_PASSWORD=<your-railway-mysql-password>
DB_NAME=railway

# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URLs (Thay bằng URL Vercel thực tế của bạn)
FRONTEND_URL=https://blog-hub-chi-five.vercel.app
CLIENT_URL=https://blog-hub-chi-five.vercel.app

# Authentication
JWT_SECRET=<generate-secure-random-string-min-32-chars>
JWT_EXPIRES_IN=7d

# Cloudinary (từ tài khoản Cloudinary của bạn)
CLOUDINARY_CLOUD_NAME=dawmynd1u
CLOUDINARY_API_KEY=577255341421261
CLOUDINARY_API_SECRET=l0rF2YJtdJN8c9wsMkyYUGW-5DI
```

### 1.3. Lấy Database Credentials từ Railway MySQL
- Click vào **MySQL service** trong cùng project
- Tab **Variables** hoặc **Connect**
- Copy: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### 1.4. Tạo JWT_SECRET mạnh
```powershell
# Chạy trong PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.5. Sau khi thêm xong
- Click **Deploy** hoặc đợi Railway auto-redeploy
- Kiểm tra Logs để đảm bảo không có lỗi

---

## **BƯỚC 2: Cấu hình Vercel Frontend**

### 2.1. Truy cập Vercel Variables
1. Vào https://vercel.com/dashboard
2. Chọn project **blog-hub-chi-five** (hoặc tên project của bạn)
3. **Settings** → **Environment Variables**

### 2.2. Thêm biến môi trường

**Variable Name:**
```
VITE_API_BASE_URL
```

**Value:** (Copy chính xác)
```
https://zonal-illumination-production-a714.up.railway.app/api
```

⚠️ **LƯU Ý:** Phải có `/api` ở cuối!

**Environment:** Chọn `Production` (và `Preview` nếu cần)

### 2.3. Save và Redeploy

---

### **Bước 3: Redeploy Frontend trên Vercel**

Có 2 cách:

**Cách 1: Trigger Redeploy từ Vercel Dashboard**
1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click nút 3 chấm (...) → **Redeploy**
4. Chọn **Use existing Build Cache** (KHÔNG chọn)
5. Click **Redeploy**

**Cách 2: Push code mới từ Git** (Khuyến nghị)
```powershell
# Trong thư mục BlogHub_GitHub
git add .
git commit -m "Fix: Add production API URL configuration" --allow-empty
git push origin master
```

Vercel sẽ tự động detect và deploy lại với environment variables mới.

---

### **Bước 4: Kiểm tra CORS trên Railway Backend**

Đảm bảo Railway backend có các biến sau:

1. Vào Railway Dashboard → Backend service → **Variables**
2. Kiểm tra có các biến này:

   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

   **Thay thế bằng URL Vercel thực tế của bạn**

3. Nếu chưa có, thêm vào và save
4. Railway sẽ tự động redeploy

---

## 🔍 Cách Kiểm Tra Đã Fix Chưa

### **1. Mở DevTools của trình duyệt (F12)**
- Tab **Console** → Không còn lỗi `ERR_CONNECTION_REFUSED`
- Tab **Network** → Request gọi đến Railway URL thay vì localhost

### **2. Test đăng nhập/đăng ký**
- Thử đăng nhập → Nếu thành công là đã fix

### **3. Kiểm tra URL trong Network tab**
- Các API call phải có dạng: `https://your-railway-url.up.railway.app/api/...`
- KHÔNG phải: `http://localhost:5000/api/...`

---

## 📝 Checklist

- [ ] Đã copy Railway Backend URL
- [ ] Đã thêm `VITE_API_BASE_URL` vào Vercel
- [ ] Đã redeploy Vercel
- [ ] Đã kiểm tra `FRONTEND_URL` và `CLIENT_URL` trên Railway
- [ ] Đã test đăng nhập/đăng ký thành công

---

## 🆘 Nếu Vẫn Lỗi

### Lỗi CORS (CORS Policy Error)
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Giải pháp:**
- Kiểm tra lại `FRONTEND_URL` và `CLIENT_URL` trên Railway
- Đảm bảo URL Vercel chính xác (không có `/` ở cuối)

### Lỗi 500 Internal Server Error
```
Failed to load resource: the server responded with a status of 500
```

**Giải pháp:**
- Kiểm tra logs trên Railway Dashboard
- Có thể thiếu environment variables: `JWT_SECRET`, `JWT_EXPIRES_IN`, database credentials

### Lỗi 404 Not Found
```
Failed to load resource: the server responded with a status of 404
```

**Giải pháp:**
- Kiểm tra `VITE_API_BASE_URL` có đúng format: `https://domain.com/api` (có `/api` ở cuối)
- Railway backend phải đang chạy (check status)

---

## 📌 Lưu ý quan trọng

1. **Luôn có `/api` ở cuối** trong `VITE_API_BASE_URL`
2. **Không có `/` ở cuối** trong `FRONTEND_URL`/`CLIENT_URL`
3. Sau khi thay đổi environment variables, **phải redeploy**
4. Cache của trình duyệt có thể gây lỗi → **Clear cache** (Ctrl+Shift+Delete)

---

## 🎯 URL Mẫu Đúng Format

### Vercel Environment Variable:
```
VITE_API_BASE_URL=https://bloghub-production.up.railway.app/api
```

### Railway Environment Variables:
```
FRONTEND_URL=https://blog-hub-frontend.vercel.app
CLIENT_URL=https://blog-hub-frontend.vercel.app
```

*Thay thế bằng URL thực tế của bạn*
