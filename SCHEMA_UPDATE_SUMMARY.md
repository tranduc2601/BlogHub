# 🎉 Schema.sql Đã Được Cập Nhật Hoàn Chỉnh

## ✅ Tóm Tắt Thay Đổi

### **📊 Tổng quan:**
- ✅ **16 tables** đầy đủ cho toàn bộ tính năng
- ✅ Thêm các cột thiếu vào bảng hiện có
- ✅ Thêm các bảng mới: `comment_reactions`, `comment_likes`, `reports`
- ✅ Hỗ trợ tất cả tính năng: reactions, anonymous comments, warnings, bookmarks

---

## 📋 **Danh Sách Tables Hoàn Chỉnh**

### **Core Tables (3)**
1. ✅ **users** 
   - ➕ Thêm cột: `warningCount INT DEFAULT 0`
   - Hỗ trợ: Admin warning system (3 warnings → lock account)

2. ✅ **posts**
   - ➕ Các cột mở rộng: `category`, `tags`, `views`, `privacy`
   - ➕ Reaction counters: `reaction_like`, `reaction_love`, `reaction_haha`, `reaction_wow`, `reaction_sad`, `reaction_angry`, `total_reactions`
   - ➕ `pinnedCommentId` - Ghim comment lên đầu

3. ✅ **comments**
   - ➕ `parentId` - Hỗ trợ replies trực tiếp trong table comments
   - ➕ `anonymousId` - ID cho anonymous comments
   - ➕ `reportCount` - Đếm số lần bị báo cáo
   - ➕ Reaction counters tương tự posts
   - ➕ `isAnonymous` - Đánh dấu comment ẩn danh

### **Reaction System (3)**
4. ✅ **reactions** - Reactions cho posts (6 loại: like, love, haha, wow, sad, angry)
5. ✅ **comment_reactions** - Reactions cho comments (6 loại tương tự)
6. ✅ **likes** - Legacy table cho backward compatibility

### **Social Features (3)**
7. ✅ **follows** - Quan hệ follow giữa users
8. ✅ **post_views** - Tracking lượt xem bài viết (unique by user/session)
9. ✅ **bookmarks** - Lưu bài viết yêu thích

### **Comment System (2)**
10. ✅ **comment_replies** - Legacy table cho replies (khuyến nghị dùng comments.parentId)
11. ✅ **comment_likes** - Legacy table cho comment likes

### **Notification & Reports (3)**
12. ✅ **notifications**
    - ➕ `senderId` nullable - Hỗ trợ anonymous notifications
    - ➕ `anonymousId` - ID người gửi ẩn danh

13. ✅ **comment_reports** - Báo cáo bình luận vi phạm
14. ✅ **reports** - Báo cáo bài viết vi phạm

### **Auth & Security (1)**
15. ✅ **user_sessions** - Quản lý phiên đăng nhập (single device enforcement)

---

## 🆕 **Các Thay Đổi Chi Tiết**

### **1. Users Table**
```sql
-- THÊM MỚI
warningCount INT DEFAULT 0
INDEX idx_warning (warningCount)
```
**Tác dụng:** Admin có thể cảnh cáo user, sau 3 lần → tự động khóa tài khoản

### **2. Posts Table**
```sql
-- THÊM MỚI
category VARCHAR(100) DEFAULT NULL
tags TEXT DEFAULT NULL
views INT DEFAULT 0
privacy ENUM('public', 'private', 'followers') DEFAULT 'public'
reaction_like INT DEFAULT 0
reaction_love INT DEFAULT 0
reaction_haha INT DEFAULT 0
reaction_wow INT DEFAULT 0
reaction_sad INT DEFAULT 0
reaction_angry INT DEFAULT 0
total_reactions INT DEFAULT 0
pinnedCommentId INT DEFAULT NULL
```
**Tác dụng:** 
- Phân loại bài viết
- Đếm reactions chi tiết
- Kiểm soát quyền riêng tư
- Ghim comment quan trọng

### **3. Comments Table**
```sql
-- THÊM MỚI
anonymousId VARCHAR(255) DEFAULT NULL
reportCount INT DEFAULT 0
reaction_like INT DEFAULT 0
reaction_love INT DEFAULT 0
reaction_haha INT DEFAULT 0
reaction_wow INT DEFAULT 0
reaction_sad INT DEFAULT 0
reaction_angry INT DEFAULT 0
total_reactions INT DEFAULT 0
```
**Tác dụng:**
- Hỗ trợ bình luận ẩn danh
- Đếm số lần bị báo cáo
- React chi tiết cho từng comment

### **4. Notifications Table**
```sql
-- THAY ĐỔI
senderId INT DEFAULT NULL  -- Trước đây: NOT NULL
-- THÊM MỚI
anonymousId VARCHAR(255) DEFAULT NULL
```
**Tác dụng:** Hỗ trợ thông báo từ người dùng ẩn danh

### **5. Tables Mới**
- ✅ `comment_reactions` - Reaction system cho comments
- ✅ `comment_likes` - Legacy likes cho comments
- ✅ `reports` - Báo cáo bài viết

---

## 🚀 **Cách Sử Dụng**

### **Option 1: Import thủ công vào Railway**
Xem file: [`IMPORT_SCHEMA_GUIDE.md`](./IMPORT_SCHEMA_GUIDE.md)

### **Option 2: Chạy script tự động**
```powershell
cd "D:\OneDrive\Máy tính\BlogHub_GitHub\server"
node import-schema.js
```

Script sẽ:
- ✅ Tự động kết nối Railway MySQL
- ✅ Import tất cả tables
- ✅ Bỏ qua lỗi duplicate (table/column đã tồn tại)
- ✅ Hiển thị báo cáo chi tiết
- ✅ Verify tất cả tables

---

## ⚠️ **Lưu Ý Quan Trọng**

### **1. Về ALTER TABLE Statements**
File schema.sql có các câu lệnh `ALTER TABLE` để thêm cột mới:
- Nếu chạy lần đầu → OK
- Nếu chạy lại → Sẽ có lỗi "Duplicate column" (bình thường, có thể bỏ qua)

### **2. Về Database Name**
- Schema sử dụng database name: `bloghub_db`
- Railway mặc định: `railway`
- Script `import-schema.js` tự động xử lý khác biệt này

### **3. Về Foreign Keys**
- Tất cả foreign keys đã được thiết lập ON DELETE CASCADE
- Khi xóa user/post → tự động xóa dữ liệu liên quan

### **4. Về Legacy Tables**
Một số tables được giữ lại để backward compatibility:
- `likes` → Khuyến nghị dùng `reactions`
- `comment_replies` → Khuyến nghị dùng `comments.parentId`
- `comment_likes` → Khuyến nghị dùng `comment_reactions`

---

## 📝 **Migration Plan (Nếu DB đã có dữ liệu)**

Nếu database production đã có dữ liệu, **KHÔNG nên** xóa và import lại. Thay vào đó:

### **Step 1: Backup dữ liệu hiện tại**
```sql
-- Export từ Railway
mysqldump -h <host> -P <port> -u root -p railway > backup.sql
```

### **Step 2: Chỉ chạy các ALTER TABLE**
```sql
-- Chỉ chạy các dòng ALTER TABLE trong schema.sql
-- hoặc dùng update-schema.js (đã có sẵn)
node update-schema.js
```

### **Step 3: Tạo các table mới thiếu**
```sql
-- comment_reactions
-- reports
-- comment_likes
-- (xem trong schema.sql)
```

---

## ✅ **Kiểm Tra Sau Khi Import**

### **1. Verify table count**
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'railway';
-- Expected: >= 15
```

### **2. Verify columns**
```sql
-- Check users.warningCount
DESCRIBE users;

-- Check comments.anonymousId, reportCount
DESCRIBE comments;

-- Check posts reactions columns
DESCRIBE posts;
```

### **3. Test application**
- ✅ Đăng ký/Đăng nhập
- ✅ Tạo bài viết (public, private, followers)
- ✅ Comment & Reply
- ✅ React posts & comments (all 6 types)
- ✅ Follow/Unfollow
- ✅ Bookmark
- ✅ Report post/comment
- ✅ Admin: Approve/Reject posts, Warning users
- ✅ Anonymous comments

---

## 🎯 **Next Steps**

1. ✅ Import schema vào Railway MySQL
2. ✅ Cập nhật Railway environment variables (xem QUICK_FIX_GUIDE.md)
3. ✅ Redeploy backend trên Railway
4. ✅ Cấu hình Vercel frontend (VITE_API_BASE_URL)
5. ✅ Test toàn bộ tính năng

---

## 📚 **Related Files**

- `server/schema.sql` - Schema hoàn chỉnh (16 tables)
- `server/import-schema.js` - Script tự động import
- `server/update-schema.js` - Script cập nhật từng phần (legacy)
- `IMPORT_SCHEMA_GUIDE.md` - Hướng dẫn chi tiết import
- `QUICK_FIX_GUIDE.md` - Fix lỗi production
- `FIX_PRODUCTION_ERRORS.md` - Troubleshooting

---

**Cập nhật:** 25/11/2025
**Version:** 2.0 (Complete Schema)
**Status:** ✅ Ready for Production
