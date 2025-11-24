# 🎬 Video Script: Deploy BlogHub lên Vercel & Render

## Intro (30s)
"Xin chào! Hôm nay mình sẽ hướng dẫn deploy một full-stack blog application lên production. Frontend chạy trên Vercel, Backend chạy trên Render, Database dùng MySQL. Tất cả hoàn toàn MIỄN PHÍ!"

---

## Part 1: Chuẩn Bị (2 phút)

### 1.1 Các Tài Khoản Cần Có
- GitHub (để lưu code)
- Render (backend + database)
- Vercel (frontend)
- Cloudinary (upload ảnh)

### 1.2 Push Code Lên GitHub
```bash
cd bloghub-project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/bloghub.git
git push -u origin main
```

### 1.3 Chuẩn Bị Credentials
- Tạo JWT secret (32+ ký tự)
- Lấy Cloudinary credentials từ dashboard

---

## Part 2: Deploy Backend (8 phút)

### 2.1 Tạo MySQL Database (2 phút)
1. Vào render.com → New MySQL
2. Đặt tên: bloghub-database
3. Region: Singapore
4. Plan: Free
5. Create Database
6. **Copy thông tin**: hostname, port, username, password

### 2.2 Import Database Schema (2 phút)
**Cách 1: MySQL Client**
```bash
mysql -h [hostname] -P [port] -u [username] -p
USE bloghub_db;
source server/schema.sql;
```

**Cách 2: MySQL Workbench**
- Connect với credentials từ Render
- Import file schema.sql

### 2.3 Deploy Backend Service (3 phút)
1. Render → New Web Service
2. Connect GitHub repository
3. Settings:
   - Name: bloghub-backend
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
   - Region: Singapore

### 2.4 Add Environment Variables (1 phút)
Copy-paste tất cả từ file ENV_VARIABLES.md:
- NODE_ENV=production
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
- JWT_SECRET
- CLOUDINARY_*
- CLIENT_URL (tạm thời để localhost)

Click "Create Web Service" → Đợi deploy

### 2.5 Verify Backend (30s)
- Truy cập: https://bloghub-backend.onrender.com
- Thấy JSON: "BlogHub API Server đang hoạt động"
- **Copy URL này để dùng cho frontend!**

---

## Part 3: Deploy Frontend (5 phút)

### 3.1 Import Project vào Vercel (1 phút)
1. Vào vercel.com
2. New Project → Import từ GitHub
3. Select repository: bloghub-project

### 3.2 Configure Build (1 phút)
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install` (auto)

### 3.3 Add Environment Variable (1 phút)
```
VITE_API_BASE_URL=https://bloghub-backend.onrender.com/api
```
⚠️ Thay URL backend thực tế!
⚠️ Nhớ thêm `/api` ở cuối!

### 3.4 Deploy (2 phút)
- Click "Deploy"
- Đợi 2-3 phút
- Lấy URL: https://bloghub-project.vercel.app

---

## Part 4: Connect Frontend & Backend (3 phút)

### 4.1 Update CORS (1 phút)
1. Vào Render → bloghub-backend
2. Environment → Edit `CLIENT_URL`
3. Đổi thành: `https://bloghub-project.vercel.app`
4. Save → Service auto restart

### 4.2 Test Integration (2 phút)
1. Truy cập frontend URL
2. F12 → Console (check không có lỗi)
3. Thử register account mới
4. Thử login
5. Thử tạo post
6. Thử upload ảnh

Nếu tất cả OK → Thành công! 🎉

---

## Part 5: Tạo Admin Account (2 phút)

### Option 1: Render Shell
1. Render → bloghub-backend → Shell
2. Run:
```bash
cd server
node setup-admin.js
```
3. Nhập username, email, password

### Option 2: Trực Tiếp Database
```sql
INSERT INTO users (username, email, password, role, created_at)
VALUES ('admin', 'admin@bloghub.com', '[hashed_password]', 'admin', NOW());
```

---

## Part 6: Verify Everything (2 phút)

### Checklist:
- ✅ Backend API responding
- ✅ Frontend loading
- ✅ Register/Login working
- ✅ Create post working
- ✅ Upload image working
- ✅ Admin panel accessible
- ✅ No CORS errors
- ✅ No console errors

---

## Outro (1 phút)

"Vậy là xong! Bây giờ bạn đã có một blog application chạy trên production, hoàn toàn miễn phí. Mỗi lần push code lên GitHub, Vercel và Render sẽ tự động deploy."

### Lưu ý quan trọng:
- Free tier của Render: service ngủ sau 15 phút
- Cold start mất ~30 giây
- MySQL free: 1GB storage
- Vercel free: 100GB bandwidth/month

### Tài liệu:
- DEPLOYMENT_GUIDE.md: Hướng dẫn chi tiết
- DEPLOYMENT_CHECKLIST.md: Checklist đầy đủ
- ENV_VARIABLES.md: Tham khảo ENV vars

"Chúc các bạn deploy thành công! Có thắc mắc gì comment bên dưới nhé!"

---

## 📊 Timeline

| Time | Topic |
|------|-------|
| 0:00 - 0:30 | Intro |
| 0:30 - 2:30 | Chuẩn bị |
| 2:30 - 10:30 | Deploy Backend |
| 10:30 - 15:30 | Deploy Frontend |
| 15:30 - 18:30 | Connect & Test |
| 18:30 - 20:30 | Admin Account |
| 20:30 - 22:30 | Verify |
| 22:30 - 23:30 | Outro |

**Total**: ~23 phút

---

## 🎯 Key Points to Emphasize

1. **MIỄN PHÍ hoàn toàn** với Free tiers
2. **Tự động deploy** khi push code
3. **Production-ready** sau 20 phút
4. **Chi tiết trong docs** (link description)
5. **Troubleshooting guide** có sẵn

---

## 📸 Screenshots Needed

1. Render Dashboard - New MySQL
2. Render - MySQL Info tab
3. Render - New Web Service
4. Render - Environment Variables
5. Render - Deployment logs
6. Vercel - Import project
7. Vercel - Build settings
8. Vercel - Environment Variables
9. Vercel - Deployment success
10. Final app - Homepage
11. Final app - Login
12. Final app - Create post
13. Final app - Admin dashboard

---

## 🎤 B-Roll Suggestions

- Typing code
- Terminal commands
- Browser tabs switching
- Loading spinners
- Success checkmarks
- Dashboard navigation
- Clicking deploy buttons

---

## 💬 Common Questions to Address

Q: "Có tốn tiền không?"
A: "Không, hoàn toàn miễn phí với Free tier!"

Q: "Render service bị ngủ thì sao?"
A: "Free tier ngủ sau 15 phút không dùng, request đầu tiên mất ~30s wake up. Muốn 24/7 thì upgrade paid plan."

Q: "Có custom domain được không?"
A: "Được! Vercel hỗ trợ custom domain miễn phí."

Q: "Database có giới hạn gì không?"
A: "Free tier: 1GB storage, 10 connections. Đủ cho project nhỏ/trung bình."

---

## 📝 Video Description Template

```
🚀 DEPLOY FULL-STACK BLOG APPLICATION - MIỄN PHÍ 100%

Trong video này mình hướng dẫn deploy một full-stack blog app lên production:
- Frontend (React + Vite) → Vercel
- Backend (Node.js + Express) → Render  
- Database (MySQL) → Render
- File Upload → Cloudinary

✅ Hoàn toàn MIỄN PHÍ với Free tiers
✅ Auto-deploy khi push code
✅ Production-ready sau 20 phút

⏰ TIMELINE:
0:00 Intro
0:30 Chuẩn bị tài khoản
2:30 Deploy Backend
10:30 Deploy Frontend  
15:30 Kết nối & Test
18:30 Tạo Admin
20:30 Verify
22:30 Outro

📚 TÀI LIỆU:
- Full guide: [link GitHub]
- Checklist: [link]
- ENV variables: [link]
- Source code: [link GitHub]

🔗 LINKS:
- Render: https://render.com
- Vercel: https://vercel.com
- Cloudinary: https://cloudinary.com
- GitHub repo: [your repo]

💬 Có thắc mắc? Comment bên dưới!
👍 Đừng quên like & subscribe nếu video hữu ích!

#deployment #fullstack #react #nodejs #vercel #render #tutorial
```

---

## 🎬 Editing Notes

- Speed up: installation/build processes (2-3x)
- Add text overlays: commands, URLs, important notes
- Highlight: cursor for important clicks
- Zoom in: when showing small text
- Add chapters: for each major section
- Background music: calm, upbeat (low volume)
- End screen: subscribe button, related videos
