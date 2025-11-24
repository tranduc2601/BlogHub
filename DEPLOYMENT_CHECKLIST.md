# 📋 Deployment Checklist

## Trước khi Deploy

### 1. Code & Git
- [ ] Code đã test kỹ trên local
- [ ] Tất cả dependencies đã cài đặt (`npm install`)
- [ ] Build thành công local (`npm run build`)
- [ ] Git repository đã khởi tạo
- [ ] Code đã push lên GitHub

### 2. Tài Khoản
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Render (https://render.com)
- [ ] Đã có tài khoản Vercel (https://vercel.com)
- [ ] Đã có tài khoản Cloudinary (https://cloudinary.com)

### 3. Thông Tin Cần Thiết
- [ ] Đã tạo JWT_SECRET (chuỗi random >32 ký tự)
- [ ] Đã có Cloudinary credentials (Cloud Name, API Key, API Secret)
- [ ] Đã chuẩn bị file `schema.sql`

---

## Deploy Backend (Render)

### Database
- [ ] Tạo MySQL Database trên Render
- [ ] Lưu lại: hostname, port, username, password, database name
- [ ] Import `schema.sql` vào database (qua MySQL client hoặc tool)
- [ ] Verify database đã có các bảng (users, posts, comments, etc.)

### Web Service
- [ ] Tạo Web Service trên Render
- [ ] Connect với GitHub repository
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Region: Singapore (hoặc gần nhất)

### Environment Variables
Thêm tất cả các biến sau:
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `DB_HOST=...` (từ Render MySQL)
- [ ] `DB_USER=...`
- [ ] `DB_PASSWORD=...`
- [ ] `DB_NAME=bloghub_db`
- [ ] `DB_PORT=3306`
- [ ] `JWT_SECRET=...` (chuỗi mạnh >32 ký tự)
- [ ] `CLIENT_URL=http://localhost:5173` (tạm thời, sẽ update sau)
- [ ] `CLOUDINARY_CLOUD_NAME=...`
- [ ] `CLOUDINARY_API_KEY=...`
- [ ] `CLOUDINARY_API_SECRET=...`

### Verify
- [ ] Service đã deploy thành công (màu xanh)
- [ ] Copy Backend URL (vd: https://bloghub-backend.onrender.com)
- [ ] Test: truy cập `https://your-backend.onrender.com` → thấy JSON response
- [ ] Test API: `https://your-backend.onrender.com/api/...`

### Admin Account
- [ ] Vào Render Shell: `cd server && node setup-admin.js`
- [ ] Tạo tài khoản admin
- [ ] Lưu lại username/password

---

## Deploy Frontend (Vercel)

### Import Project
- [ ] Login Vercel
- [ ] Click "Add New Project"
- [ ] Import từ GitHub repository `bloghub-project`
- [ ] Framework: Vite
- [ ] Root Directory: `./` (mặc định)

### Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install` (auto)

### Environment Variables
- [ ] `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
  - ⚠️ Thay `your-backend` bằng URL thực từ Render
  - ⚠️ Nhớ thêm `/api` ở cuối

### Verify
- [ ] Deploy thành công
- [ ] Copy Frontend URL (vd: https://bloghub-project.vercel.app)
- [ ] Truy cập website, UI hiển thị đúng

---

## Cấu Hình Sau Deploy

### 1. Update CORS
- [ ] Vào Render → bloghub-backend → Environment
- [ ] Sửa `CLIENT_URL=https://your-frontend.vercel.app`
- [ ] Save (service tự restart)

### 2. Test Integration
- [ ] Truy cập frontend
- [ ] Thử đăng ký tài khoản mới → Thành công
- [ ] Thử đăng nhập → Thành công
- [ ] Thử tạo post → Thành công
- [ ] Thử upload ảnh → Thành công
- [ ] Check console không có lỗi CORS

### 3. Admin Functions
- [ ] Login bằng tài khoản admin
- [ ] Truy cập `/admin` → Dashboard hiển thị
- [ ] Test các chức năng admin

---

## Troubleshooting

### Nếu Backend không khởi động
- [ ] Check logs trên Render
- [ ] Verify tất cả ENV variables đã đủ
- [ ] Test database connection (check DB credentials)

### Nếu Frontend không gọi được API
- [ ] F12 → Console → xem error
- [ ] Verify `VITE_API_BASE_URL` đúng
- [ ] Test API trực tiếp bằng browser/Postman
- [ ] Check CORS error → update `CLIENT_URL` trên Render

### Nếu CORS Error
- [ ] `CLIENT_URL` trên Render = Frontend URL (chính xác)
- [ ] Không có trailing slash
- [ ] Service đã restart sau khi đổi ENV

### Nếu Database Error
- [ ] MySQL service trên Render đang chạy
- [ ] Schema đã import đúng
- [ ] Connection pool settings phù hợp với free tier

---

## Post-Deployment

### 1. Documentation
- [ ] Lưu lại URLs:
  - Frontend: `https://...`
  - Backend: `https://...`
  - Admin credentials: `username/password`
- [ ] Update README với production URLs

### 2. Monitoring
- [ ] Bookmark Render Dashboard
- [ ] Bookmark Vercel Dashboard
- [ ] Setup email notifications (optional)

### 3. Backup
- [ ] Export database backup từ Render
- [ ] Lưu trữ credentials an toàn

---

## 🎉 Hoàn Thành!

Khi tất cả checkbox đã tích:
- ✅ Backend running on Render
- ✅ Frontend running on Vercel  
- ✅ Database connected
- ✅ Admin account created
- ✅ CORS configured
- ✅ File upload working

→ **Production ready!** 🚀

---

## Auto-Deploy

Từ giờ, mỗi khi bạn:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

→ Vercel và Render sẽ tự động rebuild & deploy!

---

## Lưu Ý Free Tier

- **Render**: Service ngủ sau 15 phút không dùng (cold start ~30s)
- **MySQL**: Free tier: 1GB storage, giới hạn connections
- **Vercel**: 100GB bandwidth/month

Để nâng cấp: upgrade plan trên Dashboard.
