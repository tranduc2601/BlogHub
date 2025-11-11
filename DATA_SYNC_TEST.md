# ✅ DATA SYNCHRONIZATION - Test Đồng Bộ Dữ Liệu

Branch: `DataSynchronization`

## 🎯 Mục Đích

Giải quyết vấn đề **dữ liệu không đồng nhất giữa các máy** bằng cách:
- ✅ Loại bỏ mock data fallback
- ✅ Bắt buộc sử dụng API backend
- ✅ Tất cả dữ liệu lưu trong MySQL database duy nhất
- ✅ Đồng bộ realtime khi refresh

---

## 📋 Các Thay Đổi Đã Thực Hiện

### 1. Backend API (Server)
- ✅ Đã có đầy đủ endpoints: `/admin/posts`, `/admin/comments`, `/admin/users`, `/admin/stats`
- ✅ Endpoint `/admin/stats` trả về thống kê thực từ database (không dùng mock)
- ✅ CRUD operations cho posts, comments, users hoạt động hoàn chỉnh
- ✅ Bảng `reports` đã được tạo cho hệ thống báo cáo vi phạm

### 2. Frontend Hooks
- ✅ **useAdminData.ts**: Loại bỏ fallback về mock data, hiển thị lỗi rõ ràng nếu API fail
- ✅ **useComments.ts**: Loại bỏ fallback về `getCommentsByPostId` mock function
- ✅ **usePosts.ts**: Đã dùng API từ trước
- ✅ **useUsers.ts**: Đã dùng API từ trước

### 3. Documentation
- ✅ **DEPLOYMENT_GUIDE.md**: Hướng dẫn đầy đủ 3 cách deploy cho team
  - Cách 1: LAN (cùng văn phòng/WiFi)
  - Cách 2: Cloud Database (Railway, PlanetScale)
  - Cách 3: Full Stack Cloud (Render + Vercel)

---

## 🧪 Test Đồng Bộ Dữ Liệu

### Chuẩn Bị:
```powershell
# Terminal 1: Chạy Backend
cd server
npm start

# Terminal 2: Chạy Frontend
npm run dev
```

### Test Case 1: Đồng bộ trên nhiều trình duyệt (cùng 1 máy)

1. **Mở Chrome**: Truy cập `http://localhost:5173`
2. **Mở Edge/Firefox**: Truy cập `http://localhost:5173`
3. **Đăng nhập admin** trên cả 2 trình duyệt:
   - Email: `admin@bloghub.com`
   - Password: `admin123`

4. **Thực hiện thay đổi trên Chrome:**
   - Vào Admin Dashboard → Post Management
   - Ẩn 1 bài viết (toggle status)
   - Xem bài viết biến mất

5. **Kiểm tra trên Edge/Firefox:**
   - Nhấn F5 (refresh)
   - ✅ **PASS**: Bài viết cũng bị ẩn trên trình duyệt này
   - ❌ **FAIL**: Bài viết vẫn hiển thị → Kiểm tra lại API

### Test Case 2: Thống kê realtime

1. **Chrome - Tab 1**: Vào Admin Dashboard, xem số lượng bài viết
2. **Chrome - Tab 2**: Tạo bài viết mới
3. **Quay lại Tab 1**: Refresh trang
4. ✅ **PASS**: Số lượng bài viết tăng lên

### Test Case 3: Delete data sync

1. **Browser 1**: Xóa 1 user
2. **Browser 2**: Refresh User Management
3. ✅ **PASS**: User không còn xuất hiện

### Test Case 4: Comment sync

1. **Browser 1**: Vào 1 bài viết, thêm comment
2. **Browser 2**: Vào cùng bài viết đó, refresh
3. ✅ **PASS**: Comment mới xuất hiện

---

## 🔧 Test Trên Nhiều Máy (Team)

### Setup:

**Máy A (Server Host):**
```powershell
# 1. Kiểm tra IP
ipconfig
# Ghi nhớ IPv4 Address (VD: 192.168.1.100)

# 2. Mở port cho backend
New-NetFirewallRule -DisplayName "BlogHub API" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# 3. Chạy backend
cd server
npm start
```

**Máy B, C, D... (Clients):**
```powershell
# 1. Tạo file .env tại root project
echo "VITE_API_URL=http://192.168.1.100:5000/api" > .env

# 2. Update axios.ts để dùng env
# (Đã có sẵn trong code)

# 3. Chạy frontend
npm run dev
```

### Test:
1. **Máy A**: Đăng nhập admin, ẩn 1 bài viết
2. **Máy B**: Đăng nhập admin, refresh
3. ✅ **PASS**: Bài viết cũng bị ẩn trên Máy B

---

## 📊 Kiểm Tra Database Trực Tiếp

```powershell
# Chạy test script
cd server
node test-api.js
```

Kết quả mong đợi:
```
✅ PASS: Kết nối database thành công
✅ Bảng 'users': X records
✅ Bảng 'posts': X records
✅ Bảng 'comments': X records
✅ Bảng 'reports': X records
✅ Đã có admin user
```

---

## 🐛 Troubleshooting

### Lỗi: "Không thể tải dữ liệu từ server"

**Nguyên nhân:** Backend không chạy hoặc không kết nối được

**Khắc phục:**
1. Kiểm tra backend có chạy: `http://localhost:5000`
2. Check console log trong browser DevTools
3. Verify token trong localStorage chưa hết hạn

### Lỗi: "Access denied for user"

**Nguyên nhân:** MySQL credentials không đúng

**Khắc phục:**
1. Kiểm tra file `server/.env`
2. Verify username/password MySQL
3. Test connection: `node server/test-api.js`

### Lỗi: "Table 'reports' doesn't exist"

**Khắc phục:**
```powershell
node server/create-reports-table.js
```

### Dữ liệu không đồng bộ giữa 2 máy

**Kiểm tra:**
1. 2 máy có kết nối đến cùng 1 database không?
2. API URL có đúng không? (check file `.env`)
3. Firewall có block port 5000 không?

---

## 📈 Monitoring & Logs

### Backend Logs
Mỗi request sẽ log ra console:
```
2025-11-11T10:30:00.000Z - GET /api/admin/posts
2025-11-11T10:30:01.000Z - PUT /api/admin/posts/5/status
```

### Frontend Errors
Nếu API fail, toast message sẽ hiện:
```
Lỗi tải dữ liệu: [error message]

Vui lòng kiểm tra:
1. Server backend đang chạy (localhost:5000)
2. Đăng nhập với tài khoản admin
3. Kết nối MySQL database
```

---

## ✅ Checklist Hoàn Thành

- [x] Backend API có đầy đủ endpoints
- [x] Database schema đầy đủ (users, posts, comments, reports)
- [x] Frontend hooks loại bỏ mock data fallback
- [x] Test script `test-api.js` hoạt động
- [x] DEPLOYMENT_GUIDE.md hoàn chỉnh
- [x] Test đồng bộ trên nhiều browser thành công
- [ ] Test đồng bộ trên nhiều máy (cần 2+ máy để test)

---

## 🚀 Bước Tiếp Theo

Để team có thể làm việc cùng nhau:

### Option 1: LAN (Đơn giản nhất)
1. Team ngồi cùng văn phòng/WiFi
2. 1 người làm server host
3. Các người khác kết nối qua IP LAN
4. **Chi tiết:** Xem `DEPLOYMENT_GUIDE.md` → Cách 1

### Option 2: Cloud Database (Khuyến nghị)
1. Deploy MySQL lên Railway.app (free)
2. Tất cả mọi người kết nối đến cloud database
3. Mỗi người chạy backend local
4. **Chi tiết:** Xem `DEPLOYMENT_GUIDE.md` → Cách 2

### Option 3: Full Cloud (Production)
1. Deploy backend lên Render.com
2. Deploy frontend lên Vercel
3. Toàn bộ team truy cập qua URL public
4. **Chi tiết:** Xem `DEPLOYMENT_GUIDE.md` → Cách 3

---

## 📞 Support

Nếu gặp vấn đề trong quá trình test, kiểm tra:
1. Console logs trong browser DevTools (F12)
2. Terminal logs của backend server
3. MySQL logs
4. Network tab để xem API requests

---

**Branch:** `DataSynchronization`  
**Status:** ✅ Ready for Testing  
**Last Updated:** 2025-11-11
