# 🚀 Quick Deployment Guide

## Vercel Deployment - Quick Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
cd xcel
vercel
```

### 4. Set Environment Variables in Vercel Dashboard

Go to: **Project → Settings → Environment Variables**

Add:
```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MAX_FILE_SIZE_MB = 25
```

### 5. Redeploy
```bash
vercel --prod
```

Or click **Redeploy** in Vercel Dashboard.

## ✅ What's Configured

✅ **vercel.json** - Serverless function configuration  
✅ **Memory Storage** - File uploads work on Vercel  
✅ **Auto Environment Detection** - Works locally and on Vercel  
✅ **Error Handling** - Proper cleanup for both environments  
✅ **File Size Limits** - Configurable via environment variables  

## 🔗 API Endpoints

After deployment, your API will be available at:
- `https://your-project.vercel.app/`
- `https://your-project.vercel.app/api/voters/upload`
- `https://your-project.vercel.app/api/voters/search?query=test`
- `https://your-project.vercel.app/api/voters`

## 📝 Notes

- Files are processed in memory (no disk storage needed)
- MongoDB connection is auto-managed
- All routes work as serverless functions
- Max function duration: 60 seconds
- Max file size: 25MB (configurable)

## 🐛 Common Issues

**MongoDB Connection Failed?**
→ Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)

**File Upload Failed?**
→ Check file size and `MAX_FILE_SIZE_MB` env variable

**Function Timeout?**
→ Large files may need more time (max 60s on free plan)

For detailed guide, see: `VERCEL-DEPLOYMENT.md`

