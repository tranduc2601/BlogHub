# 📝 BlogHub

Nền tảng blog hiện đại với React + TypeScript (Frontend) và Node.js + Express (Backend).

## 🎯 Giới thiệu

**BlogHub** là ứng dụng blog full-stack với tính năng quản lý nội dung, tương tác người dùng và hệ thống quản trị.

## ✨ Tính năng chính

- 🔐 Đăng ký, đăng nhập với JWT authentication
- 📝 Tạo, sửa, xóa bài viết với Rich Text Editor (TinyMCE)
- 💬 Bình luận đa cấp, bình luận ẩn danh với ID ngẫu nhiên
- 👍 Thả biểu cảm (6 loại: Like, Love, Haha, Wow, Sad, Angry)
- 👥 Theo dõi người dùng, quản lý hồ sơ cá nhân
- 🔔 Hệ thống thông báo real-time
- 📷 Upload ảnh qua Cloudinary
- 🛡️ Trang quản trị: quản lý users, posts, comments, reports
- 📱 Responsive design với Tailwind CSS

## 🛠️ Công nghệ sử dụng

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, TinyMCE

**Backend:** Node.js, Express.js, MySQL 8.0, JWT, bcryptjs, Cloudinary

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Cấu hình môi trường

Tạo file `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bloghub
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

### 3. Khởi tạo database

```bash
cd server

# Tạo database và tables
mysql -u root -p < schema.sql

# Tạo tài khoản admin
node setup-admin.js
```

**Tài khoản admin mặc định:**

- Email: `admin@bloghub.com`
- Password: `admin123`

### 4. Chạy ứng dụng

**Backend:**

```bash
cd server
npm start
# Server chạy tại: http://localhost:5000
```

**Frontend:**

```bash
npm run dev
# Frontend chạy tại: http://localhost:5173
```

**Truy cập:**

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:5000>
- Admin: <http://localhost:5173/admin>

**Tài khoản admin mặc định:**

- Email: `admin@bloghub.com`
- Password: `admin123`

## 🌐 Triển khai (Deployment)

### 📚 Tài liệu đầy đủ

Chi tiết cách deploy lên production, xem:

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Hướng dẫn chi tiết từng bước
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Checklist đầy đủ
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Hướng dẫn nhanh 5 bước
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Tham khảo environment variables

### 🚀 Tóm tắt nhanh

**1. Frontend → Vercel:**
- Import project từ GitHub
- Set `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- Deploy

**2. Backend → Render:**
- Tạo MySQL Database
- Import `schema.sql`
- Deploy Web Service (root: `server`)
- Thêm environment variables
- Update `CLIENT_URL=https://your-frontend.vercel.app`

**3. Cloudinary:**
- Đăng ký tại [cloudinary.com](https://cloudinary.com)
- Thêm credentials vào Render ENV

**Chi tiết xem [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 👥 Nhóm phát triển

| Thành viên | Vai trò | GitHub |
|------------|---------|--------|
| **Trần Hoàng Duy** | Full-stack Developer | [@duyhoangtran2006](https://github.com/duyhoangtran2006) |
| **Trần Minh Đức** | Backend Developer | - |
| **Đoàn Nhật Cường** | Frontend Developer | - |
| **Nguyễn Gia Huy** | UI/UX Designer | - |

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Express](https://expressjs.com/) - Backend Framework
- [MySQL](https://www.mysql.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Image hosting
- [TinyMCE](https://www.tiny.cloud/) - Rich text editor

## 📞 Contact

- Email: <duyhoangtran2006@gmail.com>
- Project Link: [https://github.com/duyhoangtran2006/bloghub-project](https://github.com/duyhoangtran2006/bloghub-project)

---

**⭐ Star this repo if you find it helpful!**

© 2025 BlogHub - Made with ❤️ by Group 4
