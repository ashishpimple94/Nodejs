# MongoDB Connection Troubleshooting Guide

## 🔍 Common Issues and Solutions

### 1. Error: "Database connection failed" / "MONGODB_URI is not set"

**Problem**: Environment variable not set in Vercel

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0`
3. Select all environments: **Production**, **Preview**, **Development**
4. Click **Save**
5. **Important**: Redeploy your project after adding environment variables

---

### 2. Error: "Connection timeout" / "ENOTFOUND"

**Problem**: MongoDB Atlas network access blocking Vercel IPs

**Solution**:
1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - Or manually add: `0.0.0.0/0`
4. Click **Confirm**
5. Wait 1-2 minutes for changes to propagate
6. Test connection again

**Note**: For production, consider adding only Vercel IP ranges for better security.

---

### 3. Error: "Authentication failed"

**Problem**: Wrong username/password in connection string

**Solution**:
1. Verify MongoDB Atlas credentials:
   - Username: `hosteluser`
   - Password: `hostuser`
2. Check connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?options
   ```
3. Update MONGODB_URI in Vercel environment variables
4. Redeploy

---

### 4. Error: "Database server not found"

**Problem**: Incorrect cluster name or connection string

**Solution**:
1. Go to MongoDB Atlas → **Clusters**
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Copy the connection string
5. Update with your credentials:
   ```
   mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority
   ```
6. Update MONGODB_URI in Vercel

---

### 5. Connection Works Locally But Not on Vercel

**Problem**: Environment variables not properly set

**Solution**:
1. Verify environment variables in Vercel:
   - Go to Project → Settings → Environment Variables
   - Check if `MONGODB_URI` exists
   - Verify it's set for **Production** environment
2. Check Vercel function logs:
   - Go to Deployments → Latest → Function Logs
   - Look for MongoDB connection errors
3. Redeploy after setting variables:
   - Vercel Dashboard → Deployments → Latest → Redeploy

---

## 🧪 Testing Connection

### Step 1: Check Health Endpoint
```bash
curl https://your-project.vercel.app/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T...",
  "environment": "production",
  "mongodb": {
    "state": "connected",
    "readyState": 1,
    "host": "cluster0-shard-00-00.ezzkjmw.mongodb.net",
    "name": "voterlist",
    "hasUri": true
  }
}
```

### Step 2: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **Function Logs**
4. Look for:
   - ✅ `MongoDB Connected successfully`
   - ❌ Any error messages

---

## 📋 Connection String Format

### Complete Connection String:
```
mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0
```

### Breakdown:
- **Protocol**: `mongodb+srv://`
- **Username**: `hosteluser`
- **Password**: `hostuser`
- **Cluster**: `cluster0.ezzkjmw.mongodb.net`
- **Database**: `voterlist`
- **Options**: `retryWrites=true&w=majority&appName=Cluster0`

---

## 🔧 Quick Checklist

- [ ] MONGODB_URI is set in Vercel environment variables
- [ ] Environment variable is set for **Production** environment
- [ ] Connection string includes database name (`voterlist`)
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] MongoDB Atlas user has read/write permissions
- [ ] Project redeployed after setting environment variables
- [ ] Checked Vercel function logs for errors
- [ ] Tested `/health` endpoint

---

## 🆘 Still Having Issues?

1. **Check Vercel Logs**:
   - Deployments → Latest → Function Logs
   - Look for MongoDB connection errors

2. **Check MongoDB Atlas**:
   - Database Access → Verify user exists
   - Network Access → Verify IP whitelist
   - Clusters → Verify cluster is running

3. **Test Connection String**:
   - Use MongoDB Compass or mongosh
   - Test connection string locally first

4. **Common Error Messages**:
   - `MONGODB_URI is not set` → Add environment variable
   - `Connection timeout` → Check Network Access in Atlas
   - `Authentication failed` → Check username/password
   - `ENOTFOUND` → Check cluster name in connection string

---

## 📞 Support Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)

