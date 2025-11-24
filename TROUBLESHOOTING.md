# 🔧 Troubleshooting Guide - Xử Lý Lỗi Thường Gặp

## 📋 Mục Lục
- [Backend Errors](#backend-errors)
- [Frontend Errors](#frontend-errors)
- [Database Errors](#database-errors)
- [CORS Errors](#cors-errors)
- [Upload Errors](#upload-errors)
- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)

---

## 🖥️ Backend Errors

### ❌ Error: "Cannot connect to database"

**Triệu chứng:**
```
Error: connect ETIMEDOUT
ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Nguyên nhân:**
- Database credentials sai
- Database chưa khởi tạo
- Network/firewall block

**Giải pháp:**

1. **Kiểm tra ENV variables:**
```bash
# Trong Render Shell
echo $DB_HOST
echo $DB_USER
echo $DB_NAME
# Phải có giá trị, không được empty
```

2. **Test connection trực tiếp:**
```bash
mysql -h [DB_HOST] -P [DB_PORT] -u [DB_USER] -p
# Nhập password
# Nếu connect được → credentials đúng
```

3. **Verify database tồn tại:**
```sql
SHOW DATABASES;
USE bloghub_db;
SHOW TABLES;
# Phải thấy: users, posts, comments, etc.
```

4. **Check IP whitelist:**
- Render thường allow all IPs
- Nếu dùng external DB → add Render IPs

---

### ❌ Error: "JWT malformed" / "Invalid token"

**Triệu chứng:**
```
JsonWebTokenError: jwt malformed
Error: Invalid token
```

**Nguyên nhân:**
- JWT_SECRET không khớp giữa sign và verify
- Token expired
- Token format sai

**Giải pháp:**

1. **Check JWT_SECRET:**
```bash
# Backend phải có JWT_SECRET trong ENV
echo $JWT_SECRET
# Phải >32 ký tự
```

2. **Clear cookies/localStorage:**
```javascript
// Browser console
localStorage.clear();
// Reload page
```

3. **Test JWT generation:**
```javascript
// Trong server
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
console.log('Token:', token);
const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log('Decoded:', decoded);
```

---

### ❌ Error: "Port already in use"

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Giải pháp:**

**Windows:**
```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID)
taskkill /PID [PID] /F
```

**Render:** Không xảy ra (auto assign port)

---

## 🌐 Frontend Errors

### ❌ Error: "Network Error" / API không response

**Triệu chứng:**
```
Network Error
AxiosError: Request failed
```

**Nguyên nhân:**
- `VITE_API_BASE_URL` sai
- Backend chưa chạy
- CORS block

**Giải pháp:**

1. **Check ENV variable:**
```javascript
// Browser console (F12)
console.log(import.meta.env.VITE_API_BASE_URL);
// Phải là: https://your-backend.onrender.com/api
```

2. **Test backend trực tiếp:**
```bash
# Mở browser
https://your-backend.onrender.com
# Phải thấy JSON response
```

3. **Check Network tab:**
- F12 → Network
- Reload page
- Xem request nào bị failed
- Check URL có đúng không

---

### ❌ Error: "Module not found" / Import error

**Triệu chứng:**
```
Error: Cannot find module '@/components/...'
Module not found: Error: Can't resolve '...'
```

**Nguyên nhân:**
- Path alias không đúng
- File không tồn tại
- Case sensitivity (Windows vs Linux)

**Giải pháp:**

1. **Check vite.config.ts:**
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@/core": path.resolve(__dirname, "./src/core"),
    // ...
  }
}
```

2. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"]
    }
  }
}
```

3. **Verify file tồn tại:**
```bash
ls src/components/YourComponent.tsx
```

---

## 🗄️ Database Errors

### ❌ Error: "Table doesn't exist"

**Triệu chứng:**
```
ER_NO_SUCH_TABLE: Table 'bloghub_db.users' doesn't exist
```

**Nguyên nhân:**
- Chưa import schema.sql
- Database name sai
- Schema import failed

**Giải pháp:**

1. **Verify database:**
```sql
USE bloghub_db;
SHOW TABLES;
```

2. **Re-import schema:**
```bash
mysql -h [HOST] -P [PORT] -u [USER] -p bloghub_db < schema.sql
```

3. **Check table structure:**
```sql
DESCRIBE users;
# Phải thấy columns: id, username, email, password, etc.
```

---

### ❌ Error: "Too many connections"

**Triệu chứng:**
```
ER_CON_COUNT_ERROR: Too many connections
Error: Connection pool exhausted
```

**Nguyên nhân:**
- Free tier có giới hạn connections (10)
- Connection leak (không close)
- Quá nhiều requests

**Giải pháp:**

1. **Giảm connection pool:**
```javascript
// config/database.js
const pool = mysql.createPool({
  connectionLimit: 5, // giảm xuống 5
  // ...
});
```

2. **Đảm bảo release connections:**
```javascript
// Good
const connection = await pool.getConnection();
try {
  await connection.query(...);
} finally {
  connection.release(); // QUAN TRỌNG!
}
```

3. **Upgrade database plan:** (nếu cần nhiều connections)

---

### ❌ Error: "Foreign key constraint fails"

**Triệu chứng:**
```
ER_ROW_IS_REFERENCED: Cannot delete or update a parent row
```

**Nguyên nhân:**
- Xóa record có foreign key references
- Schema constraints

**Giải pháp:**

1. **Soft delete thay vì hard delete:**
```sql
-- Thay vì DELETE
UPDATE users SET deleted_at = NOW() WHERE id = ?;
```

2. **Xóa dependencies trước:**
```javascript
// Xóa comments trước
await pool.query('DELETE FROM comments WHERE user_id = ?', [userId]);
// Xóa posts
await pool.query('DELETE FROM posts WHERE user_id = ?', [userId]);
// Cuối cùng xóa user
await pool.query('DELETE FROM users WHERE id = ?', [userId]);
```

---

## 🚫 CORS Errors

### ❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Triệu chứng:**
```
Access to XMLHttpRequest blocked by CORS policy
No 'Access-Control-Allow-Origin' header is present
```

**Nguyên nhân:**
- `CLIENT_URL` sai hoặc thiếu
- CORS middleware chưa config đúng
- Request từ domain không được phép

**Giải pháp:**

1. **Check CLIENT_URL trên Render:**
```bash
# Phải = Frontend URL chính xác
CLIENT_URL=https://bloghub-project.vercel.app
# Không có trailing slash!
```

2. **Verify CORS config:**
```javascript
// server.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

3. **Restart service sau khi đổi ENV:**
- Render auto restart khi save ENV

4. **Test CORS:**
```javascript
// Browser console
fetch('https://your-backend.onrender.com/api/auth/check', {
  method: 'GET',
  credentials: 'include'
})
.then(r => console.log('OK'))
.catch(e => console.error('CORS error:', e));
```

---

### ❌ Error: "CORS preflight request failed"

**Triệu chứng:**
```
OPTIONS request failed
Preflight response is not successful
```

**Giải pháp:**

1. **Thêm OPTIONS handler:**
```javascript
app.options('*', cors());
```

2. **Check headers:**
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

---

## 📷 Upload Errors

### ❌ Error: "Cloudinary upload failed"

**Triệu chứng:**
```
Error: Upload failed
Invalid API key
```

**Nguyên nhân:**
- Cloudinary credentials sai
- Network timeout
- File quá lớn

**Giải pháp:**

1. **Verify credentials:**
```bash
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
# Check với dashboard Cloudinary
```

2. **Test Cloudinary:**
```javascript
// Trong Render Shell hoặc local
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test upload
cloudinary.uploader.upload('test.jpg', (error, result) => {
  console.log(error || result);
});
```

3. **Check upload limits:**
- Free tier: 25 credits/month
- Max file size: 10MB (default)

---

## 🏗️ Build Errors

### ❌ Error: "Build failed" trên Vercel

**Triệu chứng:**
```
Error: Build failed
TypeScript errors
Module not found
```

**Giải pháp:**

1. **Test build locally:**
```bash
npm run build
# Xem lỗi cụ thể
```

2. **Fix TypeScript errors:**
```bash
# Check types
npm run build
# Fix từng lỗi
```

3. **Check dependencies:**
```bash
# Đảm bảo tất cả deps có trong package.json
npm install
```

4. **Xem logs chi tiết trên Vercel:**
- Deployments → Click deployment → View logs

---

### ❌ Error: "npm ERR! missing script: build"

**Giải pháp:**

**Check package.json:**
```json
{
  "scripts": {
    "build": "tsc -b && vite build"  // Phải có
  }
}
```

---

## ⚠️ Runtime Errors

### ❌ Error: "Service unavailable" (503)

**Triệu chứng:**
- Backend trả về 503
- Request timeout

**Nguyên nhân:**
- Render free tier service đang ngủ
- Database down
- Server crash

**Giải pháp:**

1. **Cold start (normal cho free tier):**
- Đợi 30-60 giây
- Reload page

2. **Check service status:**
- Vào Render Dashboard
- Xem service có đang chạy (green)

3. **Check logs:**
- Render → Logs
- Xem có crash không

---

### ❌ Error: "Rate limit exceeded"

**Triệu chứng:**
```
Error: Too many requests
Status: 429
```

**Nguyên nhân:**
- Quá nhiều requests trong thời gian ngắn
- API rate limits

**Giải pháp:**

1. **Implement rate limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

2. **Add retry logic:**
```javascript
// Frontend
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      // Wait and retry
      return new Promise(resolve => {
        setTimeout(() => resolve(axios(error.config)), 2000);
      });
    }
    return Promise.reject(error);
  }
);
```

---

## 🔍 Debug Tips

### General Debugging:

**1. Check Logs:**
```bash
# Render
Dashboard → Service → Logs

# Vercel
Dashboard → Deployment → Function Logs

# Browser
F12 → Console, Network, Application
```

**2. Test APIs:**
```bash
# Thunder Client / Postman
GET https://your-backend.onrender.com/api/health
```

**3. Isolate Issues:**
- Test backend alone (Postman)
- Test frontend alone (mock data)
- Test database alone (MySQL client)

**4. Enable Debug Mode:**
```javascript
// Backend
console.log('DEBUG:', variable);

// Frontend
console.log('State:', state);
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

---

## 📞 Khi Không Tự Fix Được

### Steps:

1. **Gather Info:**
   - Error message đầy đủ
   - Logs (frontend + backend)
   - ENV variables (không share secrets)
   - Steps to reproduce

2. **Check Docs:**
   - Đọc lại DEPLOYMENT_GUIDE.md
   - Kiểm tra ENV_VARIABLES.md

3. **Search:**
   - Google error message
   - Render/Vercel documentation
   - Stack Overflow

4. **Ask for Help:**
   - GitHub Issues
   - Render Community
   - Vercel Discord
   - Stack Overflow

---

## ✅ Prevention Tips

1. **Test Locally First**
   - Always test trước khi deploy
   - Use `.env.local` cho local testing

2. **Backup Before Changes**
   - Database backups
   - ENV variables backups
   - Git commits

3. **Monitor Regularly**
   - Check logs hàng ngày
   - Monitor database usage
   - Track API errors

4. **Update Dependencies**
   - `npm audit fix`
   - Keep packages updated
   - Test after updates

---

**🎯 Most Common Issues (90% cases):**

1. ❌ CORS error → Fix `CLIENT_URL`
2. ❌ API not responding → Check `VITE_API_BASE_URL`
3. ❌ Database error → Verify credentials
4. ❌ Build failed → Test `npm run build` locally
5. ❌ Upload failed → Check Cloudinary credentials

**Fix these first!** ✅

---

_Last Updated: November 23, 2025_
