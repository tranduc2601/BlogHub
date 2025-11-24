# Quick Deploy Guide

## 🚀 Deploy trong 5 bước

### 1️⃣ Push code lên GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Deploy Backend (Render)
1. Tạo MySQL Database trên Render
2. Import `server/schema.sql` vào database
3. Tạo Web Service, trỏ đến folder `server`
4. Thêm environment variables (xem DEPLOYMENT_GUIDE.md)
5. Deploy và lấy URL backend

### 3️⃣ Deploy Frontend (Vercel)
1. Import project từ GitHub
2. Thêm biến: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
3. Deploy

### 4️⃣ Cập nhật CORS
1. Vào Render → Environment
2. Update `CLIENT_URL=https://your-frontend.vercel.app`
3. Save (service auto restart)

### 5️⃣ Tạo Admin Account
Render Shell:
```bash
cd server
node setup-admin.js
```

## 📝 Thông tin cần có

✅ Tài khoản GitHub  
✅ Tài khoản Render  
✅ Tài khoản Vercel  
✅ Tài khoản Cloudinary (cho upload ảnh)  

## 🔗 URLs sau khi deploy

- Frontend: `https://[your-project].vercel.app`
- Backend: `https://[your-service].onrender.com`
- API: `https://[your-service].onrender.com/api`

Chi tiết đầy đủ: xem **DEPLOYMENT_GUIDE.md**
