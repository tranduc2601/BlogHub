# 🚀 Quick Start - Team Làm Việc Từ Xa

## TL;DR - Setup trong 10 phút

### 🎯 Bạn là Team Lead?

```bash
# 1. Tạo Railway Database (5 phút)
https://railway.app → Login GitHub → New Project → Provision MySQL

# 2. Import Schema (2 phút)
mysql -h railway-host.railway.app -P 3306 -u root -p railway < server/schema.sql

# 3. Setup Admin (1 phút)
# Edit server/.env với Railway credentials trước
cd server
node setup-admin.js

# 4. Share Credentials (2 phút)
# Send cho team qua Slack/Discord (KHÔNG qua GitHub):
# - DB_HOST, DB_PASSWORD, DB_USER, DB_NAME
# - JWT_SECRET (phải GIỐNG nhau!)
# - Admin email/password
```

📖 **Chi tiết:** `RAILWAY_DATABASE_SETUP.md`

---

### 👥 Bạn là Team Member?

```bash
# 1. Clone & Install
git clone <repo-url>
cd bloghub-project
npm install
cd server && npm install && cd ..

# 2. Setup .env
cp server/.env.example server/.env
# Paste credentials từ Team Lead vào server/.env

# 3. Test Connection
cd server
node verify-railway.js
# ✅ Phải thấy: "Railway Database đã sẵn sàng!"

# 4. Run App
npm start           # Terminal 1 (trong folder server)
cd .. && npm run dev  # Terminal 2

# 5. Test
# Browser: http://localhost:5173
# Login admin → Tạo 1 post → Hỏi teammate có thấy không
```

📖 **Chi tiết:** `RAILWAY_DATABASE_SETUP.md`

---

## ⚡ Hàng Ngày

```bash
# Morning:
cd server && npm start     # Terminal 1
npm run dev                # Terminal 2 (new terminal)

# Evening:
Ctrl+C  # Stop cả 2 terminals
# Data đã tự động lưu trên Railway
```

---

## 🐛 Lỗi Thường Gặp

### "Cannot connect to database"
```bash
cd server
node verify-railway.js
# Đọc output để biết lỗi gì
```

### "Authentication failed"
- Hỏi Team Lead xác nhận `JWT_SECRET`
- Tất cả phải dùng CÙNG giá trị

### Data không đồng bộ
- Kiểm tra `DB_NAME` trong .env có đúng không
- Verify: `node server/verify-railway.js`

---

## 📚 Docs Đầy Đủ

| File | Dành cho | Nội dung |
|------|---------|---------|
| `RAILWAY_DATABASE_SETUP.md` | Team Lead + Members | Setup Railway chi tiết từ A-Z |
| `DEPLOYMENT_GUIDE.md` | Team Lead | 3 cách deploy (LAN/Cloud/Full) |
| `DATA_SYNC_TEST.md` | QA/Tester | Test cases đồng bộ dữ liệu |
| `README.md` | Tất cả | Overview & quick start |

---

## ✅ Checklist Team Lead

- [ ] Tạo Railway MySQL database
- [ ] Import `server/schema.sql`
- [ ] Chạy `setup-admin.js`
- [ ] Tạo `CREDENTIALS.txt` với:
  - `DB_*` credentials
  - `JWT_SECRET` (chung cho team)
  - Admin login info
- [ ] Share credentials qua private channel
- [ ] Hướng dẫn team verify connection
- [ ] Test sync với ít nhất 1 teammate

## ✅ Checklist Team Member

- [ ] Clone project
- [ ] `npm install` (cả root và server)
- [ ] Tạo `server/.env` từ `.env.example`
- [ ] Paste credentials từ Team Lead
- [ ] `node server/verify-railway.js` → Pass
- [ ] Chạy app (backend + frontend)
- [ ] Test login admin
- [ ] Test tạo data → Confirm teammate thấy được

---

**🎉 Done! Team có thể làm việc với cùng database rồi!**
