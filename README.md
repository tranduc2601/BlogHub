# BlogHub Project

BlogHub là một nền tảng blog hiện đại, cho phép người dùng đăng bài, bình luận, tương tác và quản trị nội dung. Dự án gồm hai phần: frontend (React + Vite + TailwindCSS) và backend (Node.js + Express).

## Chức năng đã hoàn thiện

- Đăng ký, đăng nhập, xác thực người dùng
- Quản lý bài viết: tạo, sửa, xóa, xem chi tiết
- Quản lý bình luận, phản hồi lồng nhau, ghim bình luận
- Hệ thống phân quyền: Quản trị viên, Tác giả, Người dùng thường
- Trang quản trị: quản lý user, bài viết, bình luận, báo cáo
- Tương tác: thả cảm xúc, trả lời, chỉnh sửa, xóa bình luận
- Responsive UI cho desktop, tablet, mobile
- Tìm kiếm, lọc bài viết, phân trang
- Đăng xuất, đổi mật khẩu, cập nhật thông tin cá nhân
- Hỗ trợ upload ảnh bài viết qua Cloudinary
- Chính sách bảo mật, điều khoản sử dụng

## Cách chạy dự án

### 1. Cài đặt

```bash
npm install
cd server && npm install
```

### 2. Khởi động backend

```bash
cd server
node server.js
```

### 3. Khởi động frontend

```bash
npm run dev
```

- Truy cập giao diện: <http://localhost:5173>
- API backend mặc định: <http://localhost:3000>

### 4. Thiết lập tài khoản admin (tùy chọn)

```bash
cd server
node setup-admin.js
```

## Cấu trúc thư mục chính

- `/src`: mã nguồn frontend (React)
- `/server`: mã nguồn backend (Node.js/Express)
- `public/`, `index.html`, `vite.config.ts`: cấu hình frontend

## Công nghệ sử dụng

- React, TypeScript, Vite, TailwindCSS
- Node.js, Express, SQLite
- Cloudinary (upload ảnh)
- JWT, bcrypt (xác thực, bảo mật)

## Đóng góp & phát triển

- Fork repo, tạo branch mới, gửi pull request
- Báo lỗi hoặc đề xuất chức năng qua Issues

---

© 2025 BlogHub Made By Group 4 - Trần Hoàng Duy, Trần Minh Đức, Đoàn Nhật Cường và Nguyễ Gia Huy
