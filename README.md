
# BlogHub

BlogHub là một nền tảng blog hiện đại, nơi mọi người có thể chia sẻ câu chuyện, ý tưởng và kinh nghiệm với cộng đồng. Dự án được xây dựng với [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) và [Tailwind CSS](https://tailwindcss.com/).

## 🌟 Tính năng nổi bật

- ✅ Đăng ký, đăng nhập, quản lý hồ sơ người dùng
- ✅ Tạo, chỉnh sửa, xem chi tiết và duyệt danh sách bài viết
- ✅ Bình luận, thích bài viết, thống kê lượt xem, lượt thích, bình luận
- ✅ Tìm kiếm, lọc và sắp xếp tác giả
- ✅ **Admin Dashboard** - Quản lý posts, users, comments, reports
- ✅ **Data Sync** - Đồng bộ dữ liệu realtime cho team (MySQL database)
- ✅ Giao diện responsive, hiệu ứng hiện đại với Tailwind CSS
- ✅ Backend API với Node.js/Express
- ✅ MySQL Database với schema đầy đủ

## 🛠️ Công nghệ sử dụng

**Frontend:**
- React 18, React Router DOM
- TypeScript
- Vite
- Tailwind CSS v4
- Axios, React Hot Toast

**Backend:**
- Node.js, Express.js
- MySQL2 (Promise-based)
- JWT Authentication
- Bcrypt, Multer
- CORS, Dotenv

## 🚀 Setup Nhanh

### Option 1: Local Development (1 máy)

```bash
# 1. Clone & Install
git clone <repo-url>
cd bloghub-project
npm install
cd server && npm install && cd ..

# 2. Setup MySQL Database
mysql -u root -p < server/schema.sql

# 3. Config server/.env
cp server/.env.example server/.env
# Edit DB_* credentials

# 4. Setup admin
cd server && node setup-admin.js

# 5. Run
# Terminal 1: cd server && npm start
# Terminal 2: npm run dev
```

### Option 2: Team Development (Railway Database) ⭐

**Dành cho team làm việc từ xa, không cùng mạng LAN**

📖 **Xem hướng dẫn đầy đủ:** [`RAILWAY_DATABASE_SETUP.md`](./RAILWAY_DATABASE_SETUP.md)

**Quick Summary:**

1. **Team Lead:**
   - Tạo Railway account: https://railway.app
   - Provision MySQL
   - Import schema: `mysql -h railway-host ... < server/schema.sql`
   - Share credentials cho team

2. **All Members:**
   - Clone project
   - Update `server/.env` với Railway credentials
   - Run: `node server/verify-railway.js` để test
   - Start: `cd server && npm start` + `npm run dev`

3. **Test Sync:**
   - Máy A tạo post → Máy B refresh → Thấy ngay ✅

## 📁 Cấu trúc thư mục

```
bloghub-project/
├── src/                          # Frontend React
│   ├── components/               # UI Components
│   │   ├── admin/               # Admin Dashboard components
│   │   ├── Navbar.tsx
│   │   ├── PostCard.tsx
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── AdminPage.tsx
│   │   ├── HomePage.tsx
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useAdminData.ts     # Admin data (NO mock fallback)
│   │   ├── usePosts.ts
│   │   └── ...
│   ├── config/
│   │   └── axios.ts            # Axios instance với interceptors
│   └── ...
├── server/                      # Backend API
│   ├── controllers/            # Route controllers
│   │   ├── adminController.js  # Admin CRUD operations
│   │   ├── authController.js
│   │   └── ...
│   ├── routes/                 # API routes
│   ├── middleware/            # Auth middleware
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── schema.sql             # Database schema
│   ├── setup-admin.js         # Admin setup script
│   ├── verify-railway.js      # Railway connection test
│   └── .env.example           # Environment template
├── RAILWAY_DATABASE_SETUP.md  # Railway setup guide
├── DEPLOYMENT_GUIDE.md        # Full deployment options
└── DATA_SYNC_TEST.md          # Data sync test cases
```
## 🔑 Thông Tin Đăng Nhập

### Admin Account
- **Email:** `admin@bloghub.com`
- **Password:** (Tự đặt khi chạy `setup-admin.js`)

### Test User Account (từ seed data)
- **Email:** `user@example.com`
- **Password:** `password123`

## 📚 Documentation

- 📖 [Railway Database Setup](./RAILWAY_DATABASE_SETUP.md) - Hướng dẫn team từ xa
- 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - 3 cách deploy khác nhau
- 📖 [Data Sync Testing](./DATA_SYNC_TEST.md) - Test cases đồng bộ dữ liệu

## 🧪 Testing

### Test Database Connection
```bash
cd server
node test-api.js
```

### Test Railway Connection
```bash
cd server
node verify-railway.js
```

### Test Data Synchronization
1. Mở 2 browsers
2. Đăng nhập admin trên cả 2
3. Browser 1: Tạo/Sửa/Xóa data
4. Browser 2: Refresh → Thấy thay đổi ✅

## 🚢 Deployment

### Local Network (LAN)
- 1 máy làm server host
- Team members connect qua IP
- Xem: `DEPLOYMENT_GUIDE.md` → Cách 1

### Cloud Database (Railway) ⭐
- Team Lead setup Railway MySQL
- All members kết nối đến cloud DB
- Xem: `RAILWAY_DATABASE_SETUP.md`

### Full Cloud (Production)
- Backend → Render.com
- Frontend → Vercel
- Database → Railway/PlanetScale
- Xem: `DEPLOYMENT_GUIDE.md` → Cách 3

## 🤝 Team Workflow

```bash
# Mỗi ngày bắt đầu làm việc:
git pull origin main
cd server && npm start      # Terminal 1
npm run dev                 # Terminal 2 (từ root)

# Kết thúc: Ctrl+C cả 2 terminals
# Data đã tự động lưu trên database
```

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check .env file
cat server/.env

# Test connection
cd server
node verify-railway.js  # Nếu dùng Railway
# hoặc
node test-api.js        # Nếu dùng local MySQL
```

### "Authentication failed"
- Đảm bảo `JWT_SECRET` giống nhau cho tất cả team members
- Token có thể hết hạn → Đăng xuất và đăng nhập lại

### Data không đồng bộ
- Kiểm tra tất cả members dùng cùng `DB_*` credentials
- Verify bằng `node server/verify-railway.js`

## 👨‍💻 Nhóm phát triển

**Made By Group 4:**
- Trần Hoàng Duy
- Trần Minh Đức  
- Đoàn Nhật Cường
- Nguyễn Gia Huy

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MySQL 8.0 |
| Auth | JWT + Bcrypt |
| Hosting | Railway (DB) + Render (API) + Vercel (Frontend) |

## 📄 License

MIT License - Dự án sử dụng cho mục đích học tập và phát triển.

---

**🚀 Happy Coding!**

For questions or support, check the documentation files or contact team members.
