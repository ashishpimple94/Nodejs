# MongoDB Connection String Setup

## Connection String

```
mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/?appName=Cluster0
```

## Vercel Environment Variable Setup

### Step 1: Go to Vercel Dashboard
1. Navigate to your project: https://vercel.com/dashboard
2. Click on your project: **Voterlist3311** (or your project name)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add MongoDB URI
1. Click **Add New**
2. **Key**: `MONGODB_URI`
3. **Value**: `mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/?appName=Cluster0`
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**

### Step 3: Add Database Name (Optional but Recommended)
Add a database name to the connection string:

**Key**: `MONGODB_URI`
**Value**: `mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0`

## Local Development (.env file)

Create a `.env` file in the `xcel` directory:

```env
MONGODB_URI=mongodb+srv://hosteluser:hostuser@cluster0.ezzkjmw.mongodb.net/voterlist?retryWrites=true&w=majority&appName=Cluster0
MAX_FILE_SIZE_MB=25
NODE_ENV=development
```

**Important**: Never commit `.env` file to git (it's already in `.gitignore`)

## MongoDB Atlas Configuration

### Network Access
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
   - Or add Vercel IP ranges if you want to restrict

### Database User
- Username: `hosteluser`
- Password: `hostuser`
- Make sure user has read/write permissions

## Verify Connection

After setting up, test the connection:
1. Deploy to Vercel
2. Visit: `https://your-project.vercel.app/health`
3. Check if MongoDB status shows "connected"

## Troubleshooting

### Connection Failed?
1. Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
2. Verify username and password
3. Check connection string format
4. Verify environment variable is set in Vercel

### Timeout Errors?
1. Check MongoDB Atlas cluster status
2. Verify connection string has correct parameters
3. Check Vercel function logs

