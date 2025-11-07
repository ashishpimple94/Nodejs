# Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **GitHub Account**: (Optional, for automatic deployments)

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

1. Ensure all files are committed to git:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd xcel
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - Project name? **excel-upload-api** (or your choice)
   - Directory? **./**
   - Override settings? **No**

5. For production deployment:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `xcel`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add the following:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `MAX_FILE_SIZE_MB` | `25` | Maximum file size (optional, default: 25) |
| `NODE_ENV` | `production` | Environment (optional) |

**Important**: 
- MongoDB URI should be your full connection string
- Example: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel IPs

### Step 4: Redeploy

After setting environment variables:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment
- Or trigger a new deployment

## 📝 Environment Variables

### Required

- `MONGODB_URI` - MongoDB connection string

### Optional

- `MAX_FILE_SIZE_MB` - Maximum file size in MB (default: 25)
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (auto-set by Vercel, not needed)

### Auto-set by Vercel

- `VERCEL=1` - Indicates Vercel environment
- `VERCEL_ENV` - Environment (production/preview/development)

## 🔍 Testing Your Deployment

1. **Test Root Endpoint**:
```bash
curl https://your-project.vercel.app/
```

2. **Test Upload**:
```bash
curl -X POST https://your-project.vercel.app/api/voters/upload \
  -F "file=@your-file.xlsx"
```

3. **Test Search**:
```bash
curl "https://your-project.vercel.app/api/voters/search?query=test"
```

## ⚙️ Configuration Details

### vercel.json

- **maxDuration**: 60 seconds (for large Excel files)
- **memory**: 1024 MB (for processing large files)
- **Routes**: All routes point to `server.js`

### File Upload

- **Vercel**: Uses memory storage (files in buffer)
- **Local**: Uses disk storage (files in `uploads/` folder)
- Automatically detects environment

### Serverless Functions

- All API routes are handled as serverless functions
- Each request creates a new function instance
- MongoDB connection is reused when possible

## 🐛 Troubleshooting

### Issue: File upload fails

**Solution**: 
- Check file size (max 25MB by default)
- Ensure `MAX_FILE_SIZE_MB` is set correctly
- Check Vercel function logs

### Issue: MongoDB connection fails

**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Check MongoDB Atlas network access settings

### Issue: Function timeout

**Solution**:
- Large Excel files may take time
- Increase `maxDuration` in `vercel.json` (max 60s for hobby plan)
- Consider splitting large files

### Issue: Memory limit exceeded

**Solution**:
- Reduce file size
- Process files in chunks
- Upgrade Vercel plan for more memory

## 📊 Vercel Plan Limits

### Hobby (Free)

- **Function Duration**: 10s (can increase to 60s)
- **Memory**: 1024 MB
- **Bandwidth**: 100 GB/month
- **File Size**: 4.5 MB (request body)

### Pro

- **Function Duration**: 60s (can increase to 300s)
- **Memory**: 1024 MB (can increase)
- **Bandwidth**: 1 TB/month
- **File Size**: 4.5 MB (request body)

**Note**: For larger files, consider using Vercel Blob Storage or external storage.

## 🔄 Continuous Deployment

If connected to GitHub:

1. Push to `main` branch → Auto-deploy to production
2. Push to other branches → Auto-deploy to preview
3. Pull requests → Auto-deploy to preview

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)

## ✅ Deployment Checklist

- [ ] Code committed to git
- [ ] `vercel.json` configured
- [ ] Environment variables set in Vercel
- [ ] MongoDB connection string verified
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Tested API endpoints
- [ ] Verified file upload works
- [ ] Checked Vercel function logs
- [ ] Domain configured (optional)

