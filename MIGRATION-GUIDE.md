# Database Migration Guide

## Problem
Existing voter data in database doesn't have the new bilingual fields (`name_mr`, `gender_mr`).

## Solution
Run the migration script to automatically update all existing records.

---

## Step-by-Step Migration Process

### Step 1: Ensure MongoDB is Running
Make sure your MongoDB server is running.

### Step 2: Run Migration Script
```bash
cd xcel
npm run migrate
```

Or directly:
```bash
node migrate-existing-data.js
```

### Step 3: Check Output
You should see output like this:
```
✅ MongoDB Connected for migration

🔄 Starting data migration...

📊 Found 50000 records to migrate

✓ Updated 100 records...
✓ Updated 200 records...
...
✓ Updated 50000 records...

📈 Migration Summary:
   ✅ Successfully updated: 50000 records
   ❌ Errors: 0 records
   📊 Total processed: 50000 records

📋 Sample of migrated records:

1. Serial: 1042/273
   Name (English): वाघमारे सुदन किसन
   Name (Marathi): वाघमारे सुदन किसन
   Gender (English): पुरुष
   Gender (Marathi): पुरुष

✅ Migration completed successfully!
```

---

## What the Migration Does

1. **Finds all records** without `name_mr` or `gender_mr` fields
2. **Detects language** by checking for Devanagari characters
3. **Copies data:**
   - If `name` is in Marathi → Copies to `name_mr`
   - If `gender` is in Marathi → Copies to `gender_mr`
4. **Updates database** with new fields

---

## After Migration

### Test the Updated Data

**Get all voters:**
```bash
curl http://localhost:5000/api/voters?limit=1
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "68fb1d13f33651b2a0c1fb88",
      "serialNumber": "1042/273",
      "houseNumber": "Vidhate Pa",
      "name": "वाघमारे सुदन किसन",
      "name_mr": "वाघमारे सुदन किसन",
      "gender": "पुरुष",
      "gender_mr": "पुरुष",
      "age": 64,
      "voterIdCard": "                 ",
      "mobileNumber": "",
      "createdAt": "2025-10-24T06:30:43.774Z",
      "updatedAt": "2025-10-24T06:30:43.774Z"
    }
  ]
}
```

**Test Search API:**
```bash
# Marathi search
curl "http://localhost:5000/api/voters/search?query=वाघमारे"

# English search (if you have English names)
curl "http://localhost:5000/api/voters/search?query=Waghmare"
```

---

## Important Notes

⚠️ **Before Migration:**
- Make sure MongoDB is running
- Optionally, backup your database:
  ```bash
  mongodump --db voter-database --out backup/
  ```

✅ **After Migration:**
- All existing records will have `name_mr` and `gender_mr` fields
- Search API will work correctly
- New uploads will automatically populate both fields

🔄 **Re-running Migration:**
- Safe to run multiple times
- Only updates records that don't have the new fields
- Skips already migrated records

---

## Troubleshooting

### Error: "MongoDB connection error"
**Solution:** Make sure MongoDB is running
```bash
# Start MongoDB (macOS)
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

### Error: "MONGODB_URI not found"
**Solution:** Create `.env` file in xcel folder:
```env
MONGODB_URI=mongodb://localhost:27017/voter-database
PORT=5000
```

### Migration shows 0 records
**Reason:** All records are already migrated
**Action:** No action needed, your data is up to date!

---

## Database Backup (Optional but Recommended)

Before running migration, backup your database:

```bash
# Backup
mongodump --db voter-database --out backup/

# Restore (if needed)
mongorestore --db voter-database backup/voter-database/
```

---

## Next Steps After Migration

1. ✅ Run migration script
2. ✅ Test GET `/api/voters` endpoint
3. ✅ Test GET `/api/voters/search` endpoint
4. ✅ Verify data has both `name` and `name_mr` fields
5. ✅ Start using the bilingual search feature!



