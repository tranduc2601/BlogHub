# Environment Variables Reference

## 📝 Tổng Quan

File này liệt kê tất cả environment variables cần thiết cho deployment.

---

## 🌐 Frontend (Vercel)

### Required Variables

| Variable | Value Example | Description |
|----------|--------------|-------------|
| `VITE_API_BASE_URL` | `https://bloghub-backend.onrender.com/api` | URL của Backend API (từ Render) |

### Cách Thêm vào Vercel:
1. Vào Project Settings → Environment Variables
2. Thêm biến `VITE_API_BASE_URL`
3. Value: URL backend + `/api`
4. Apply to: Production, Preview, Development (hoặc chỉ Production)
5. Save

---

## 🖥️ Backend (Render)

### Required Variables

| Variable | Value Example | Description |
|----------|--------------|-------------|
| `NODE_ENV` | `production` | Môi trường chạy |
| `PORT` | `5000` | Port server (Render tự assign) |
| `CLIENT_URL` | `https://bloghub-project.vercel.app` | URL Frontend (từ Vercel) |
| `DB_HOST` | `dpg-xxxxx.oregon-postgres.render.com` | MySQL hostname (từ Render MySQL) |
| `DB_USER` | `bloghub_user` | MySQL username |
| `DB_PASSWORD` | `xxxxxxxxxxx` | MySQL password |
| `DB_NAME` | `bloghub_db` | Tên database |
| `DB_PORT` | `3306` | MySQL port |
| `JWT_SECRET` | `your_super_secret_jwt_key_min_32_chars` | Secret key cho JWT (tự tạo) |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `xxxxxxxxxxxxxxx` | Cloudinary API secret |

### Cách Lấy Các Giá Trị:

#### Database Credentials (DB_*)
1. Vào Render Dashboard
2. Click vào MySQL Database bạn đã tạo
3. Tab "Info" hoặc "Connect"
4. Copy: Hostname, Port, Database, Username, Password

#### JWT_SECRET
Tạo chuỗi random mạnh (>32 ký tự):
```bash
# Cách 1: Online generator
https://randomkeygen.com/

# Cách 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cách 3: PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

#### Cloudinary Credentials
1. Đăng ký tài khoản: https://cloudinary.com
2. Vào Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Cách Thêm vào Render:
1. Vào Web Service → Environment
2. Click "Add Environment Variable"
3. Thêm từng cặp Key-Value
4. Save Changes (service sẽ auto restart)

---

## 🔒 Security Best Practices

### ✅ DO:
- Dùng JWT_SECRET mạnh (>32 ký tự, random)
- Không share credentials publicly
- Dùng HTTPS cho production URLs
- Rotate secrets định kỳ (3-6 tháng)
- Backup ENV variables ở nơi an toàn (password manager)

### ❌ DON'T:
- Commit file `.env` lên Git
- Dùng password yếu
- Share API keys trong code
- Dùng cùng secret cho dev/prod
- Lưu credentials trong plaintext

---

## 🔄 Update Variables

### Sau Khi Deploy Lần Đầu:

**Vercel** (Frontend):
- Nếu backend URL thay đổi → Update `VITE_API_BASE_URL`

**Render** (Backend):
- Sau khi deploy frontend → Update `CLIENT_URL`
- Nếu database thay đổi → Update `DB_*` variables

### Cách Update:

**Vercel**:
1. Settings → Environment Variables
2. Edit biến cần đổi
3. Redeploy (auto trigger hoặc manual)

**Render**:
1. Environment tab
2. Edit biến
3. Save → Service auto restart (không cần redeploy)

---

## 🧪 Testing Variables

### Test Backend ENV:
```bash
# Trong Render Shell:
echo $NODE_ENV
echo $DB_HOST
# Should print values, not empty
```

### Test Frontend ENV:
```javascript
// Trong browser console (F12):
console.log(import.meta.env.VITE_API_BASE_URL);
// Should print backend URL
```

---

## 📋 Quick Copy Templates

### Vercel Environment Variables:
```
VITE_API_BASE_URL=https://YOUR_BACKEND_URL.onrender.com/api
```

### Render Environment Variables:
```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://YOUR_FRONTEND_URL.vercel.app
DB_HOST=YOUR_DB_HOST
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=bloghub_db
DB_PORT=3306
JWT_SECRET=YOUR_GENERATED_SECRET_KEY_MIN_32_CHARS
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

⚠️ **Thay tất cả `YOUR_*` bằng giá trị thực!**

---

## 🆘 Troubleshooting

### Lỗi: "Environment variable not defined"
- Check biến đã thêm vào dashboard chưa
- Check spelling chính xác
- Restart service sau khi thêm biến

### Lỗi: "Cannot connect to database"
- Verify `DB_*` credentials
- Test connection từ MySQL client
- Check MySQL service status on Render

### Lỗi: "CORS policy"
- Check `CLIENT_URL` = Frontend URL chính xác
- Không có trailing slash
- HTTPS not HTTP

### Lỗi: "Cloudinary upload failed"
- Verify Cloudinary credentials
- Check API limits (free tier: 25 credits/month)
- Test upload manually in Cloudinary dashboard

---

## 📚 Related Docs

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Quick deploy: `QUICK_DEPLOY.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`

---

## 💡 Tips

1. **Backup Variables**: Copy tất cả ENV vào file riêng (không commit)
2. **Use .env.example**: Cập nhật example files khi thêm biến mới
3. **Document Changes**: Note lại khi đổi ENV variables
4. **Test Locally First**: Test với dev ENV trước khi deploy production
5. **Monitor Logs**: Check logs sau khi thay đổi ENV

---

**Last Updated**: November 2025
