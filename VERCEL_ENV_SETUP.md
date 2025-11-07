# 🚀 Vercel Environment Variable Setup - Step by Step

## ✅ Quick Setup (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Sign in to your account
3. Find and click on your project: **Voterlist3311** (or your project name)

### Step 2: Navigate to Environment Variables
1. Click on **Settings** tab (top navigation)
2. Click on **Environment Variables** (left sidebar)

### Step 3: Add MONGODB_URI
1. Click **Add New** button
2. Fill in the form:
   - **Key**: `MONGODB_URI`
   - **Value**: 
     ```
     mongodb+srv://Voterlist1:test12345@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0
     ```
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
     (Select ALL three)
3. Click **Save**

### Step 4: Redeploy (IMPORTANT!)
1. Go to **Deployments** tab
2. Click on the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or click **Redeploy** button directly

**⚠️ IMPORTANT**: Environment variables are only applied after redeployment!

### Step 5: Verify
1. Wait for deployment to complete (2-3 minutes)
2. Visit: `https://your-project.vercel.app/health`
3. Should show:
   ```json
   {
     "status": "ok",
     "mongodb": {
       "state": "connected",
       "hasUri": true
     }
   }
   ```

---

## 📋 Connection String Details

### Full Connection String:
```
mongodb+srv://Voterlist1:test12345@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0
```

### Breakdown:
- **Protocol**: `mongodb+srv://`
- **Username**: `Voterlist1`
- **Password**: `test12345`
- **Cluster**: `cluster0.ezzkjmw.mongodb.net`
- **Database**: `voterlist`
- **Options**: `retryWrites=true&w=majority&appName=Cluster0`

---

## 🔍 Verify Environment Variable is Set

### Method 1: Check Vercel Dashboard
1. Settings → Environment Variables
2. You should see `MONGODB_URI` in the list
3. Check it's enabled for Production

### Method 2: Check via API
Visit: `https://your-project.vercel.app/health`

If `hasUri: false`, the variable is not set.
If `hasUri: true` but `state: "error"`, check MongoDB Atlas network access.

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Forgot to Redeploy
- Environment variables only apply after redeployment
- **Fix**: Always redeploy after adding/modifying environment variables

### ❌ Mistake 2: Wrong Environment Selected
- Only selected Production, but testing Preview environment
- **Fix**: Select ALL environments (Production, Preview, Development)

### ❌ Mistake 3: Typo in Variable Name
- Typed `MONGODB_URL` instead of `MONGODB_URI`
- **Fix**: Double-check the key name is exactly `MONGODB_URI`

### ❌ Mistake 4: Missing Database Name
- Connection string without database name
- **Fix**: Include `/voterlist` in connection string

### ❌ Mistake 5: Extra Spaces
- Copy-pasted with extra spaces or line breaks
- **Fix**: Remove all spaces and line breaks from the value

---

## 🔧 Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd xcel
vercel link

# Set environment variable
vercel env add MONGODB_URI production

# When prompted, paste:
mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0

# Also set for preview and development
vercel env add MONGODB_URI preview
vercel env add MONGODB_URI development

# Redeploy
vercel --prod
```

---

## 📞 Still Having Issues?

1. **Check Vercel Logs**:
   - Deployments → Latest → Function Logs
   - Look for: `❌ MONGODB_URI is not set in environment variables`

2. **Verify in Dashboard**:
   - Settings → Environment Variables
   - Confirm `MONGODB_URI` exists and is enabled

3. **Test Connection String**:
   - Use MongoDB Compass to test the connection string locally
   - If it works locally, the issue is with Vercel setup

4. **Redeploy Again**:
   - Sometimes a second redeploy is needed
   - Wait for deployment to fully complete

---

## ✅ Success Checklist

- [ ] MONGODB_URI added in Vercel Dashboard
- [ ] All environments selected (Production, Preview, Development)
- [ ] Connection string is correct (no typos)
- [ ] Project redeployed after adding variable
- [ ] Deployment completed successfully
- [ ] `/health` endpoint shows `hasUri: true`
- [ ] MongoDB connection successful in logs

---

## 🎯 Next Steps After Setup

1. Test the API:
   ```bash
   curl https://your-project.vercel.app/health
   ```

2. Test upload:
   ```bash
   curl -X POST https://your-project.vercel.app/api/voters/upload \
     -F "file=@your-file.xlsx"
   ```

3. Check MongoDB Atlas:
   - Verify data is being inserted
   - Check database: `voterlist`
   - Check collection: `voterdatas`

---

## 📚 Related Documentation

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas Setup](./MONGODB_SETUP.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

