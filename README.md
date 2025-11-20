# BlogHub Project

Nền tảng blog hiện đại với đầy đủ tính năng quản lý nội dung, tương tác người dùng và hệ thống quản trị.

## Giới thiệu

**BlogHub** là ứng dụng blog được xây dựng với React + TypeScript (frontend) và Node.js + Express (backend). Dự án hỗ trợ đăng bài, bình luận, phản hồi, quản lý người dùng và trang quản trị dành cho admin.

## Tính năng chính

- 🔐 Đăng ký, đăng nhập với JWT authentication
- 📝 Tạo, sửa, xóa bài viết với Rich Text Editor
- 💬 Bình luận đa cấp, thả cảm xúc, ghim bình luận
- 👥 Quản lý hồ sơ cá nhân, theo dõi người dùng
- 🛡️ Trang quản trị: quản lý users, posts, comments, reports
- 📷 Upload ảnh qua Cloudinary
- 🔔 Hệ thống thông báo
- 📱 Responsive design với TailwindCSS

## Công nghệ sử dụng

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Axios, React Router

**Backend:** Node.js, Express, SQLite3, JWT, bcryptjs, Cloudinary

## Cài đặt và chạy

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
PORT=3000
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

### 3. Khởi tạo database và admin

```bash
cd server
node setup-admin.js
```

**Tài khoản admin mặc định:**

- Username: `admin`
- Password: `admin123`

### 4. Chạy ứng dụng

**Backend:**

```bash
cd server
npm start
```

**Frontend:**

```bash
npm run dev
```

**Truy cập:**

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:3000>
- Admin: <http://localhost:5173/admin>

## Cấu trúc thư mục

```text
bloghub-project/
├── src/                    # Frontend
│   ├── core/              # Core (auth, config, routing)
│   ├── modules/           # Feature modules
│   ├── layout/            # Layout components
│   └── shared/            # Shared components & utils
├── server/                # Backend
│   ├── config/           # Configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Middleware
│   ├── routes/           # API routes
│   └── server.js         # Entry point
└── README.md
```

## API Endpoints chính

```text
POST   /api/auth/register          - Đăng ký
POST   /api/auth/login             - Đăng nhập
GET    /api/posts                  - Lấy danh sách bài viết
POST   /api/posts                  - Tạo bài viết (Auth)
GET    /api/posts/:id              - Chi tiết bài viết
POST   /api/posts/:postId/comments - Tạo bình luận (Auth)
GET    /api/admin/stats            - Thống kê (Admin)
```

## Build

```bash
# Frontend
npm run build

# Backend
cd server
npm install --production
```

## Nhóm phát triển

- **Trần Hoàng Duy** - Full-stack Developer
- **Trần Minh Đức** - Backend Developer
- **Đoàn Nhật Cường** - Frontend Developer
- **Nguyễn Gia Huy** - UI/UX Designer

---

© 2025 BlogHub - Made by Group 4
