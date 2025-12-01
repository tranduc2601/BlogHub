# 📝 BlogHub

Nền tảng chia sẻ blog hiện đại với đầy đủ tính năng quản lý bài viết, người dùng và tương tác cộng đồng.

## 🌟 Tính năng chính

### Người dùng
- ✍️ Tạo và quản lý bài viết với trình soạn thảo Rich Text (React Quill)
- 🖼️ Upload ảnh đại diện và ảnh bài viết (Cloudinary)
- 👥 Theo dõi/Bỏ theo dõi người dùng khác
- 💬 Bình luận và trả lời bình luận (có hỗ trợ bình luận ẩn danh)
- 😊 Thả cảm xúc (Like, Love, Haha, Wow, Sad, Angry) cho bài viết và bình luận
- 🔖 Lưu bài viết yêu thích
- 📤 Xuất bài viết sang PDF hoặc Markdown
- 🔔 Nhận thông báo real-time
- 🚨 Báo cáo vi phạm bài viết/bình luận
- 🔒 Quản lý quyền riêng tư bài viết (Public, Followers, Private)

### Quản trị viên
- 👨‍💼 Dashboard thống kê tổng quan
- 📊 Biểu đồ thống kê theo tháng
- ✅ Duyệt/Từ chối bài viết chờ duyệt
- 🔨 Quản lý người dùng (khóa/mở khóa tài khoản)
- 🗑️ Xóa bài viết/bình luận vi phạm
- 📝 Xử lý báo cáo từ người dùng
- 📌 Ghim bình luận quan trọng

## 🛠️ Công nghệ sử dụng

### Frontend
- ⚛️ **React 18** + **TypeScript**
- 🎨 **Tailwind CSS 4** - Styling
- 🚀 **Vite** - Build tool
- 🌐 **React Router v6** - Routing
- 📡 **Axios** - HTTP client
- 🔥 **React Hot Toast** - Thông báo
- 📝 **React Quill** - Rich text editor
- 📊 **Recharts** - Biểu đồ thống kê
- 📄 **jsPDF** + **html2canvas** - Xuất PDF
- 🔄 **Turndown** - Convert HTML to Markdown

### Backend
- 🟢 **Node.js** + **Express.js**
- 🗄️ **MySQL** - Database
- 🔐 **JWT** - Authentication
- 🔒 **bcrypt** - Password hashing
- ☁️ **Cloudinary** - Lưu trữ ảnh
- 📤 **Multer** - Upload file

## 🚀 Deployment

- **Frontend**: [Vercel](https://vercel.com) ⚡
- **Backend**: [Railway](https://railway.app) 🚂
- **Database**: MySQL trên Railway
- **Storage**: Cloudinary

## 📦 Cài đặt và chạy local

### 1. Clone repository
```bash
git clone https://github.com/tranduc2601/BlogHub.git
cd BlogHub
```

### 2. Cài đặt Frontend
```bash
npm install
```

Tạo file `.env` trong thư mục gốc:
```env
VITE_API_URL=http://localhost:3001
```

Chạy development server:
```bash
npm run dev
```

### 3. Cài đặt Backend
```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bloghub_db
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3001
```

Khởi tạo database:
```bash
npm run setup-db
```

Chạy server:
```bash
npm start
```

## 📁 Cấu trúc dự án

```
BlogHub/
├── src/                      # Frontend source code
│   ├── core/                 # Core utilities (auth, routing, config)
│   ├── layout/               # Layout components (Navbar, Footer)
│   ├── modules/              # Feature modules
│   │   ├── admin/            # Admin dashboard
│   │   ├── auth/             # Authentication
│   │   ├── notifications/    # Notifications
│   │   ├── posts/            # Posts management
│   │   └── users/            # User profiles
│   └── shared/               # Shared components & utilities
│
├── server/                   # Backend source code
│   ├── config/               # Database & service configs
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Custom middleware
│   ├── routes/               # API routes
│   ├── migrations/           # Database migrations
│   └── server.js             # Entry point
│
└── package.json
```

## 🔑 Tài khoản mặc định

Sau khi setup database, tài khoản admin mặc định:
- **Email**: duyhoangtran2006@gmail.com
- **Password**: Duy1tran!?2006

## 📝 Script commands

### Frontend
```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Kiểm tra code
```

### Backend
```bash
npm start            # Chạy production server
npm run dev          # Chạy development với nodemon
npm run setup-admin  # Tạo tài khoản admin
npm run update-schema # Cập nhật schema database
npm run reset-db     # Reset database
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /auth/me` - Lấy thông tin user hiện tại

### Posts
- `GET /posts` - Lấy danh sách bài viết
- `POST /posts` - Tạo bài viết mới
- `PUT /posts/:id` - Cập nhật bài viết
- `DELETE /posts/:id` - Xóa bài viết
- `POST /posts/:id/react` - Thả cảm xúc
- `POST /posts/:id/view` - Tăng lượt xem

### Comments
- `GET /posts/:id/comments` - Lấy bình luận
- `POST /posts/:id/comments` - Tạo bình luận
- `POST /posts/comments/:id/react` - Thả cảm xúc bình luận

### Admin
- `GET /admin/stats` - Thống kê tổng quan
- `GET /admin/reports` - Danh sách báo cáo
- `PUT /admin/posts/:id/approve` - Duyệt bài viết

## 🙏 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc Issues nếu bạn có ý tưởng cải thiện dự án.

---

⭐ Nếu bạn thấy dự án hữu ích, đừng quên cho một star nhé!
