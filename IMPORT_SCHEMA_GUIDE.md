# 📋 Hướng Dẫn Import Schema vào Railway MySQL

## ✅ Schema đã được cập nhật hoàn chỉnh

File `server/schema.sql` đã được cập nhật với **TẤT CẢ** các table cần thiết:

### 📊 **Danh sách Tables (16 tables):**

1. ✅ **users** - Người dùng (có warningCount)
2. ✅ **posts** - Bài viết (có reactions, views, category, tags, privacy, pinnedCommentId)
3. ✅ **comments** - Bình luận & Replies (có parentId, reactions, anonymousId, reportCount)
4. ✅ **reactions** - React bài viết (like, love, haha, wow, sad, angry)
5. ✅ **likes** - Legacy likes (backward compatibility)
6. ✅ **post_views** - Lượt xem bài viết
7. ✅ **follows** - Quan hệ follow
8. ✅ **notifications** - Thông báo (hỗ trợ anonymous)
9. ✅ **user_sessions** - Phiên đăng nhập
10. ✅ **comment_reports** - Báo cáo bình luận
11. ✅ **comment_replies** - Trả lời bình luận (legacy)
12. ✅ **comment_reactions** - React bình luận
13. ✅ **comment_likes** - Like bình luận (legacy)
14. ✅ **reports** - Báo cáo bài viết
15. ✅ **bookmarks** - Lưu bài viết
16. ✅ **ALTER statements** - Thêm các cột mở rộng

---

## 🚀 **Cách Import Schema vào Railway**

### **Phương án 1: Sử dụng Railway CLI (Khuyến nghị)**

#### Bước 1: Cài Railway CLI
```powershell
# Cài qua npm
npm install -g @railway/cli

# Hoặc cài qua Scoop (Windows)
scoop install railway
```

#### Bước 2: Login Railway
```powershell
railway login
```

#### Bước 3: Link project
```powershell
cd "D:\OneDrive\Máy tính\BlogHub_GitHub"
railway link
# Chọn project BlogHub
```

#### Bước 4: Import schema
```powershell
# Lấy MySQL connection string
railway variables

# Copy MYSQL_URL hoặc tự tạo từ các biến:
# mysql://root:<MYSQLPASSWORD>@<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>

# Import schema
Get-Content server/schema.sql | railway run mysql -u root -p<password> -h <host> -P <port> <database>
```

---

### **Phương án 2: Sử dụng MySQL Workbench (Dễ nhất)**

#### Bước 1: Tải MySQL Workbench
- Download: https://dev.mysql.com/downloads/workbench/

#### Bước 2: Lấy thông tin kết nối từ Railway
1. Vào Railway Dashboard → MySQL service
2. Tab **Connect** hoặc **Variables**
3. Copy:
   - **MYSQLHOST**
   - **MYSQLPORT**
   - **MYSQLUSER** (thường là `root`)
   - **MYSQLPASSWORD**
   - **MYSQLDATABASE** (thường là `railway`)

#### Bước 3: Kết nối trong MySQL Workbench
1. Mở MySQL Workbench
2. Click **"+"** để tạo connection mới
3. Điền thông tin:
   - **Connection Name:** Railway BlogHub
   - **Hostname:** `<MYSQLHOST>`
   - **Port:** `<MYSQLPORT>`
   - **Username:** `root`
   - **Password:** Click "Store in Vault..." → Nhập `<MYSQLPASSWORD>`
4. Click **Test Connection**
5. Nếu thành công → Click **OK**

#### Bước 4: Import Schema
1. Double-click vào connection vừa tạo
2. Menu: **File** → **Open SQL Script...**
3. Chọn file: `D:\OneDrive\Máy tính\BlogHub_GitHub\server\schema.sql`
4. Click biểu tượng **⚡ Lightning** (Execute) hoặc Ctrl+Shift+Enter
5. Đợi các query chạy xong
6. Kiểm tra panel **Output** để xem có lỗi không

---

### **Phương án 3: Sử dụng phpMyAdmin (Online)**

#### Bước 1: Cài đặt phpMyAdmin container trên Railway (Optional)
- Hoặc dùng phpMyAdmin online tại: https://demo.phpmyadmin.net/

#### Bước 2: Kết nối với Railway MySQL
1. Nhập thông tin connection từ Railway
2. Login

#### Bước 3: Import
1. Tab **Import**
2. Choose file: `schema.sql`
3. Click **Go**

---

### **Phương án 4: Sử dụng DBeaver (Universal)**

#### Bước 1: Tải DBeaver
- Download: https://dbeaver.io/download/

#### Bước 2: Tạo connection
1. Database → New Database Connection
2. Chọn **MySQL**
3. Điền thông tin từ Railway
4. Test Connection → Finish

#### Bước 3: Execute SQL
1. SQL Editor → Open SQL Script
2. Chọn `schema.sql`
3. Execute SQL Script (Ctrl+Alt+X)

---

## 🛠️ **Phương án 5: Chạy từ Node.js (Automated)**

### Tạo file `import-schema.js`:

```javascript
import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function importSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    console.log('🔄 Reading schema.sql...');
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    
    console.log('🔄 Executing SQL statements...');
    await connection.query(schema);
    
    console.log('✅ Schema imported successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

importSchema();
```

### Chạy:
```powershell
cd "D:\OneDrive\Máy tính\BlogHub_GitHub\server"
node import-schema.js
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **1. ALTER TABLE Statements**
Các câu lệnh `ALTER TABLE` ở cuối schema.sql có thể gây lỗi nếu:
- Cột đã tồn tại
- Constraint đã tồn tại

**Giải pháp:** Bỏ qua lỗi hoặc comment các dòng `ALTER TABLE` nếu đã chạy lần đầu.

### **2. Database Name**
Schema bắt đầu với:
```sql
CREATE DATABASE IF NOT EXISTS bloghub_db;
USE bloghub_db;
```

Nếu Railway database tên khác (thường là `railway`), bạn có 2 cách:
- **Cách 1:** Đổi `bloghub_db` thành `railway` trong schema.sql
- **Cách 2:** Xóa 2 dòng đầu, chỉ chạy các CREATE TABLE

### **3. Order of Tables**
Schema đã được sắp xếp đúng thứ tự foreign key dependencies.

### **4. Kiểm tra sau khi import**
```sql
-- Xem tất cả tables
SHOW TABLES;

-- Đếm số tables (phải là 16)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'railway';

-- Kiểm tra structure của table users
DESCRIBE users;
```

---

## 📝 **Checklist sau khi Import**

- [ ] Tất cả 16 tables đã được tạo
- [ ] Users table có cột `warningCount`
- [ ] Comments table có cột `anonymousId`, `reportCount`, reactions
- [ ] Notifications table có cột `anonymousId`, `senderId` nullable
- [ ] Posts table có đủ reaction columns, `views`, `category`, `tags`, `privacy`
- [ ] Các foreign keys đã được tạo đúng
- [ ] Không có lỗi trong quá trình import

---

## 🆘 **Troubleshooting**

### Lỗi: "Table already exists"
- **Nguyên nhân:** Table đã tồn tại
- **Giải pháp:** Đổi `CREATE TABLE` thành `CREATE TABLE IF NOT EXISTS` (đã có sẵn)

### Lỗi: "Duplicate column name"
- **Nguyên nhân:** ALTER TABLE thêm cột đã tồn tại
- **Giải pháp:** Comment hoặc skip các dòng ALTER TABLE

### Lỗi: "Cannot add foreign key constraint"
- **Nguyên nhân:** Table tham chiếu chưa được tạo
- **Giải pháp:** Chạy theo đúng thứ tự trong schema.sql

### Lỗi: Connection timeout
- **Nguyên nhân:** Railway firewall hoặc IP bị chặn
- **Giải pháp:** 
  - Kiểm tra Railway status
  - Thử connect từ Railway CLI
  - Dùng Railway tunnel: `railway connect`

---

## ✅ **Sau khi import xong**

1. **Restart Railway backend service** để apply schema mới
2. **Xóa file `update-schema.js`** hoặc đảm bảo nó không chạy tự động
3. **Test ứng dụng** để đảm bảo tất cả tính năng hoạt động:
   - Đăng ký/Đăng nhập
   - Tạo bài viết
   - Comment/Reply
   - React (like, love, etc.)
   - Follow/Unfollow
   - Bookmark
   - Report post/comment
   - Admin functions
   - Notifications

---

**Thời gian ước tính:** 5-10 phút
**Độ khó:** ⭐⭐ (Trung bình)

**Khuyến nghị:** Sử dụng **MySQL Workbench** (Phương án 2) vì dễ nhất và có giao diện trực quan.
