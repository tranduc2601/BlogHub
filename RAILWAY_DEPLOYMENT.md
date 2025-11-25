# 🚀 Railway Deployment Guide - BlogHub

## 📋 Overview
- **Frontend**: Vercel (Already deployed)
- **Backend**: Railway (Node.js + Express)
- **Database**: Railway MySQL Plugin

**Estimated Setup Time**: 15-20 minutes  
**Monthly Cost**: $5 credit (free tier)

---

## 🎯 Step-by-Step Deployment

### Phase 1: Prepare Backend for Railway

#### 1.1 Commit Changes to Git
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin DeployTesting
```

#### 1.2 Verify Files Created
✅ `server/Dockerfile` - Optimized Alpine container  
✅ `server/.dockerignore` - Exclude unnecessary files  
✅ `server/railway.json` - Railway configuration  
✅ `server/nixpacks.toml` - Build configuration  
✅ `server/RAILWAY_ENV.md` - Environment variables guide  

---

### Phase 2: Setup Railway Account

#### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

#### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `bloghub-project` repository
4. Select the `DeployTesting` branch

---   

### Phase 3: Configure Backend Service

#### 3.1 Set Root Directory
1. In Railway dashboard, click on your service
2. Go to **Settings**
3. Set **Root Directory** to: `server`
4. Click **Save**

#### 3.2 Configure Build
Railway will auto-detect the Dockerfile. Verify:
- **Builder**: Dockerfile
- **Dockerfile Path**: `Dockerfile`

#### 3.3 Add Environment Variables
Click **Variables** tab and add:

```env
# Server Config
NODE_ENV=production
PORT=5000

# JWT Secrets (generate new ones)
JWT_SECRET=your-generated-secret-here
SESSION_SECRET=your-generated-secret-here

# Cloudinary (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
CLIENT_URL=https://your-vercel-app.vercel.app
```

**Generate Secrets** (run in PowerShell):
```powershell
# Generate JWT Secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate Session Secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### Phase 4: Add MySQL Database

#### 4.1 Add MySQL Plugin
1. In Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add MySQL"**
4. Railway will provision a MySQL instance

#### 4.2 Link Database to Backend
1. Railway auto-generates `DATABASE_URL`
2. We need individual variables, so add:
   - Click MySQL service → **Variables** tab
   - Copy these values to Backend service:

```env
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=bloghub_db
```

**Or use Railway's reference variables:**
```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=bloghub_db
```

---

### Phase 5: Initialize Database Schema

#### 5.1 Connect to Railway MySQL
1. In Railway, click MySQL service
2. Click **"Connect"** tab
3. Copy the connection command or use Railway CLI

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Connect to MySQL
railway connect MySQL
```

**Option B: Using MySQL Client**
```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD>
```

#### 5.2 Import Schema
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS bloghub_db;
USE bloghub_db;

-- Import schema (copy content from server/schema.sql)
SOURCE server/schema.sql;

-- Verify tables
SHOW TABLES;
```

#### 5.3 Create Admin User
1. Go to Railway backend service logs
2. Run setup command in Railway:
   - Click service → **Settings** → **Deploy**
   - Or use Railway CLI:
```bash
railway run npm run setup-admin
```

---

### Phase 6: Deploy Backend

#### 6.1 Trigger Deploy
Railway auto-deploys on push, but you can manually trigger:
1. Go to **Deployments** tab
2. Click **"Deploy"**
3. Watch build logs

#### 6.2 Verify Deployment
Once deployed, Railway provides a URL like:
```
https://bloghub-backend-production.up.railway.app
```

Test endpoints:
- Health: `https://your-app.up.railway.app/health`
- API: `https://your-app.up.railway.app/api/auth/check`

#### 6.3 Enable Public Domain
1. Click **Settings** tab
2. Under **Networking**, click **"Generate Domain"**
3. Copy the Railway URL

---

### Phase 7: Connect Frontend (Vercel)

#### 7.1 Update Vercel Environment Variables
1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:

```env
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

#### 7.2 Redeploy Frontend
```bash
# Option 1: Trigger from Vercel dashboard
# Go to Deployments → Click "..." → Redeploy

# Option 2: Push a commit
git commit --allow-empty -m "Update API URL for Railway"
git push
```

#### 7.3 Update Railway Backend
Go back to Railway and update `CLIENT_URL`:
```env
CLIENT_URL=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Redeploy backend service.

---

### Phase 8: Final Testing

#### 8.1 Test Backend Endpoints
```bash
# Health check
curl https://your-railway-app.up.railway.app/health

# API check
curl https://your-railway-app.up.railway.app/api/auth/check
```

#### 8.2 Test Frontend
1. Open your Vercel URL
2. Try to login/register
3. Check browser console for errors
4. Verify CORS works

#### 8.3 Monitor Railway
1. Check **Metrics** tab for:
   - Memory usage (should be < 400MB)
   - CPU usage
   - Request count
2. Check **Logs** for errors

---

## 💰 Cost Optimization Tips

### Monitor Usage
- Railway dashboard → **Usage** tab
- Keep memory < 512MB
- Keep CPU usage low

### Optimize Database
```sql
-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'bloghub_db';

-- Optimize tables periodically
OPTIMIZE TABLE users;
OPTIMIZE TABLE posts;
OPTIMIZE TABLE comments;
```

### Connection Pooling
Already configured in `server/config/database.js`:
- `connectionLimit: 10` (optimal for Railway)

---

## 🔧 Troubleshooting

### Backend Won't Start
**Check:**
- Railway logs for errors
- All environment variables are set
- Database connection string is correct

**Fix:**
```bash
railway logs
```

### Database Connection Failed
**Check:**
- MySQL service is running
- DB_HOST points to Railway MySQL host
- DB credentials are correct

**Fix:**
```bash
railway connect MySQL
SHOW DATABASES;
```

### CORS Errors
**Check:**
- `FRONTEND_URL` in Railway matches Vercel URL exactly
- Vercel URL includes `https://`

**Fix:**
Update Railway variables:
```env
CLIENT_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

### 502 Bad Gateway
**Check:**
- Backend health endpoint responds
- Railway service is running

**Fix:**
```bash
curl https://your-app.up.railway.app/health
```

### Out of Memory
**Check:**
- Railway metrics → Memory usage

**Fix:**
- Already optimized with `--max-old-space-size=384`
- Reduce image upload size limits if needed

---

## 📊 Success Checklist

- [ ] Railway account created
- [ ] Backend deployed from GitHub
- [ ] MySQL database provisioned
- [ ] Database schema imported
- [ ] Admin user created
- [ ] Environment variables configured
- [ ] Backend URL generated
- [ ] Frontend updated with backend URL
- [ ] CORS configured correctly
- [ ] Health check responds 200
- [ ] Login/Register works
- [ ] Post creation works
- [ ] Image upload works

---

## 🎉 You're Done!

Your BlogHub is now fully deployed:
- ✅ Frontend: Vercel (Free)
- ✅ Backend: Railway ($5/month credit)
- ✅ Database: Railway MySQL (included)

**Total Cost**: $5 credit/month (free for personal use)

**Next Steps:**
- Share your Vercel URL
- Monitor Railway usage dashboard
- Set up custom domain (optional)

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs: `railway logs`
