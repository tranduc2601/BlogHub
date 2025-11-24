# Hướng Dẫn Triển Khai BlogHub

## 📋 Mục Lục
1. [Chuẩn Bị](#chuẩn-bị)
2. [Triển Khai Backend trên Render](#triển-khai-backend-trên-render)
3. [Triển Khai Frontend trên Vercel](#triển-khai-frontend-trên-vercel)
4. [Cấu Hình Sau Khi Triển Khai](#cấu-hình-sau-khi-triển-khai)
5. [Xử Lý Sự Cố](#xử-lý-sự-cố)

---

## 🚀 Chuẩn Bị

### 1. Tài Khoản Cần Thiết
- ✅ Tài khoản GitHub (để lưu code)
- ✅ Tài khoản Vercel (https://vercel.com)
- ✅ Tài khoản Render (https://render.com)
- ✅ Tài khoản Cloudinary (https://cloudinary.com) - để upload ảnh

### 2. Đẩy Code Lên GitHub

```bash
# Nếu chưa có Git repository
cd c:\Users\duyho\Downloads\Project\bloghub-project
git init
git add .
git commit -m "Initial commit for deployment"

# Tạo repository mới trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/bloghub-project.git
git branch -M main
git push -u origin main
```

### 3. Tạo File .gitignore

Đảm bảo file `.gitignore` có nội dung sau:

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.cache/
```

---

## 🖥️ Triển Khai Backend trên Render

### Bước 1: Tạo Database MySQL

1. **Đăng nhập Render**: https://dashboard.render.com
2. **Tạo MySQL Database**:
   - Click **"New +"** → Chọn **"MySQL"**
   - Điền thông tin:
     - **Name**: `bloghub-database`
     - **Database**: `bloghub_db`
     - **User**: `bloghub_user` (hoặc để mặc định)
     - **Region**: Chọn gần Việt Nam nhất (Singapore)
     - **Plan**: Free (hoặc Starter nếu cần)
   - Click **"Create Database"**

3. **Lưu Thông Tin Database**:
   Sau khi tạo xong, copy các thông tin sau (từ tab "Info"):
   - **Internal Database URL** hoặc **External Database URL**
   - **Hostname**
   - **Port**
   - **Database**
   - **Username**
   - **Password**

### Bước 2: Thiết Lập Schema Database

**Cách 1: Sử dụng MySQL Client**
```bash
# Kết nối đến database của bạn
mysql -h [HOSTNAME] -P [PORT] -u [USERNAME] -p

# Nhập password khi được yêu cầu
# Sau đó chạy:
USE bloghub_db;
source c:/Users/duyho/Downloads/Project/bloghub-project/server/schema.sql;
```

**Cách 2: Sử dụng Tool Online**
- Truy cập: https://www.phpmyadmin.net/ hoặc MySQL Workbench
- Kết nối với thông tin database từ Render
- Import file `server/schema.sql`

### Bước 3: Tạo Web Service cho Backend

1. Trở lại **Render Dashboard** → Click **"New +"** → **"Web Service"**

2. **Connect Repository**:
   - Chọn **"Connect GitHub"**
   - Authorize Render truy cập GitHub
   - Chọn repository `bloghub-project`

3. **Cấu Hình Service**:
   ```
   Name: bloghub-backend
   Region: Singapore (hoặc gần nhất)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Thêm Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"**, thêm các biến sau:

   ```
   NODE_ENV=production
   PORT=5000
   
   # Database (lấy từ Render MySQL)
   DB_HOST=[MySQL hostname from Render]
   DB_USER=[MySQL username]
   DB_PASSWORD=[MySQL password]
   DB_NAME=bloghub_db
   DB_PORT=3306
   
   # JWT Secret (tạo chuỗi random mạnh)
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
   
   # Client URL (sẽ cập nhật sau khi deploy Vercel)
   CLIENT_URL=http://localhost:5173
   
   # Cloudinary (đăng ký tại cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Deploy**:
   - Click **"Create Web Service"**
   - Đợi quá trình build và deploy (5-10 phút)
   - Sau khi xong, bạn sẽ có URL kiểu: `https://bloghub-backend.onrender.com`

### Bước 4: Kiểm Tra Backend

Truy cập: `https://bloghub-backend.onrender.com`

Bạn sẽ thấy response JSON:
```json
{
  "success": true,
  "message": "BlogHub API Server đang hoạt động",
  "version": "1.0.0"
}
```

### Bước 5: Tạo Tài Khoản Admin

1. Trong Render Dashboard, vào service **bloghub-backend**
2. Click tab **"Shell"**
3. Chạy lệnh:
   ```bash
   cd server
   node setup-admin.js
   ```
4. Làm theo hướng dẫn để tạo tài khoản admin

**Hoặc** sử dụng MySQL client:
```sql
-- Kết nối vào database và chạy:
INSERT INTO users (username, email, password, bio, role, created_at) 
VALUES ('admin', 'admin@bloghub.com', '[bcrypt_hashed_password]', 'Admin của BlogHub', 'admin', NOW());
```

---

## 🌐 Triển Khai Frontend trên Vercel

### Bước 1: Chuẩn Bị Frontend

1. **Cập nhật package.json** (đã có sẵn, kiểm tra lại):
   ```json
   {
     "scripts": {
       "build": "tsc -b && vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **Tạo file vercel.json** (đã tạo ở trên)

### Bước 2: Deploy lên Vercel

1. **Đăng nhập Vercel**: https://vercel.com
2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import repository `bloghub-project` từ GitHub

3. **Cấu Hình Project**:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**:
   Click **"Environment Variables"**, thêm:
   ```
   VITE_API_BASE_URL=https://bloghub-backend.onrender.com/api
   ```
   ⚠️ **Quan trọng**: Thay `bloghub-backend.onrender.com` bằng URL backend thực tế từ Render

5. **Deploy**:
   - Click **"Deploy"**
   - Đợi 2-5 phút
   - Sau khi xong, bạn sẽ có URL: `https://bloghub-project.vercel.app`

### Bước 3: Cấu Hình Domain (Tùy Chọn)

Nếu có domain riêng:
1. Trong Vercel, vào **Settings** → **Domains**
2. Thêm domain của bạn
3. Cập nhật DNS records theo hướng dẫn của Vercel

---

## ⚙️ Cấu Hình Sau Khi Triển Khai

### 1. Cập Nhật CLIENT_URL trên Render

1. Vào **Render Dashboard** → **bloghub-backend**
2. Tab **"Environment"** → Edit biến `CLIENT_URL`
3. Thay đổi từ:
   ```
   CLIENT_URL=http://localhost:5173
   ```
   Thành:
   ```
   CLIENT_URL=https://bloghub-project.vercel.app
   ```
4. Click **"Save Changes"**
5. Service sẽ tự động restart

### 2. Kiểm Tra CORS

Đảm bảo file `server/server.js` có cấu hình CORS đúng:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3. Cấu Hình Cloudinary

1. Đăng nhập **Cloudinary**: https://cloudinary.com
2. Copy thông tin từ Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Cập nhật lại Environment Variables trên Render

---

## 🔧 Xử Lý Sự Cố

### Lỗi: "Cannot connect to database"

**Giải pháp**:
1. Kiểm tra MySQL database trên Render có đang chạy
2. Verify các biến môi trường `DB_*` đúng
3. Kiểm tra IP whitelist (Render thường cho phép mọi IP)

### Lỗi: "CORS policy blocked"

**Giải pháp**:
1. Đảm bảo `CLIENT_URL` trên Render = URL Vercel chính xác
2. Xóa `https://` nếu có khi set biến môi trường
3. Restart backend service trên Render

### Lỗi: Frontend không gọi được API

**Giải pháp**:
1. Mở DevTools (F12) → Console để xem lỗi
2. Kiểm tra `VITE_API_BASE_URL` trên Vercel
3. Test API trực tiếp: `https://your-backend.onrender.com/api/auth/test`

### Lỗi: Build failed on Vercel

**Giải pháp**:
1. Kiểm tra TypeScript errors: `npm run build` locally
2. Xem logs chi tiết trên Vercel Dashboard
3. Đảm bảo tất cả dependencies có trong `package.json`

### Lỗi: Database connection pool exhausted

**Giải pháp**:
1. Upgrade plan MySQL trên Render (Free plan có giới hạn)
2. Tối ưu connection pool trong `config/database.js`:
   ```javascript
   const pool = mysql.createPool({
     connectionLimit: 5, // giảm nếu cần
     // ... other config
   });
   ```

---

## 📊 Monitoring & Maintenance

### 1. Theo Dõi Logs

**Render**:
- Vào service → Tab **"Logs"**
- Xem real-time logs

**Vercel**:
- Vào deployment → Tab **"Functions"** → View logs

### 2. Auto-Deploy

- Mỗi khi push code lên GitHub branch `main`:
  - Vercel tự động rebuild frontend
  - Render tự động rebuild backend

### 3. Database Backup

**Render**:
1. Vào MySQL service → Tab **"Backups"**
2. Tạo manual backup hoặc setup automatic backups

### 4. Environment Variables Update

Khi cần update biến môi trường:
1. Update trên Render/Vercel Dashboard
2. Service sẽ tự restart
3. Không cần redeploy code

---

## ✅ Checklist Triển Khai

### Backend (Render):
- [ ] MySQL database đã tạo
- [ ] Schema.sql đã import
- [ ] Web service đã deploy thành công
- [ ] Environment variables đã cấu hình đầy đủ
- [ ] Backend URL đã test và hoạt động
- [ ] Tài khoản admin đã tạo

### Frontend (Vercel):
- [ ] Project đã import từ GitHub
- [ ] Build command đúng
- [ ] Environment variables đã set
- [ ] Deploy thành công
- [ ] Frontend URL đã test

### Integration:
- [ ] VITE_API_BASE_URL trên Vercel = Backend URL
- [ ] CLIENT_URL trên Render = Frontend URL
- [ ] CORS đã cấu hình đúng
- [ ] Có thể đăng nhập/đăng ký
- [ ] Upload ảnh hoạt động (Cloudinary)

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:

1. **Check logs**: Xem logs trên Render/Vercel
2. **Test API**: Dùng Postman/Thunder Client test endpoints
3. **Database**: Kiểm tra kết nối MySQL
4. **Environment**: Verify tất cả biến môi trường

---

## 📝 Ghi Chú Quan Trọng

1. **Free Tier Limitations**:
   - Render Free: Service ngủ sau 15 phút không hoạt động
   - MySQL Free: Giới hạn 1GB storage, 10 connections
   - Vercel Free: 100GB bandwidth/month

2. **First Request Slow**: 
   - Render free tier cần ~30s để "đánh thức" service
   - Giải pháp: Upgrade plan hoặc dùng UptimeRobot ping service

3. **Database Migration**:
   - Khi update schema, chạy migration scripts trong Render Shell
   - Backup database trước khi migrate

4. **Security**:
   - Không commit file `.env`
   - JWT_SECRET phải mạnh (>32 ký tự)
   - Sử dụng HTTPS cho production

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành các bước trên, bạn đã có:
- ✅ Backend API chạy trên Render
- ✅ Frontend chạy trên Vercel
- ✅ Database MySQL hoạt động
- ✅ Hệ thống upload ảnh với Cloudinary
- ✅ Tự động deploy khi push code

**URLs của bạn**:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`
- API Docs: `https://your-backend.onrender.com/api`

Chúc bạn triển khai thành công! 🚀
