// Fix script to swap name and name_mr fields where they are incorrectly stored
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoterData from './models/VoterData.js';
import { isMarathiText } from './utils/transliteration.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-database';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixSwappedNames = async () => {
  try {
    console.log('\n🔄 Starting fix for swapped name fields...\n');

    // Find all records where name has Marathi and name_mr has English (swapped)
    const allRecords = await VoterData.find({
      name: { $exists: true, $ne: '' },
      name_mr: { $exists: true, $ne: '' }
    });

    console.log(`📊 Found ${allRecords.length} records to check\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const record of allRecords) {
      try {
        const nameIsMarathi = isMarathiText(record.name);
        const nameMrIsMarathi = isMarathiText(record.name_mr);
        
        // Check gender fields too
        const genderIsMarathi = record.gender ? isMarathiText(record.gender) : false;
        const genderMrIsMarathi = record.gender_mr ? isMarathiText(record.gender_mr) : false;
        
        const updateData = {};
        let needsUpdate = false;
        
        // Check if name fields are swapped (name has Marathi, name_mr has English)
        if (nameIsMarathi && !nameMrIsMarathi) {
          // Name fields are swapped - need to fix
          updateData.name = record.name_mr;      // Swap: English goes to name
          updateData.name_mr = record.name;       // Swap: Marathi goes to name_mr
          needsUpdate = true;
        }
        
        // Check if gender fields are swapped (gender has Marathi, gender_mr has English)
        if (genderIsMarathi && !genderMrIsMarathi) {
          // Gender fields are swapped - need to fix
          updateData.gender = record.gender_mr;      // Swap: English goes to gender
          updateData.gender_mr = record.gender;       // Swap: Marathi goes to gender_mr
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await VoterData.findByIdAndUpdate(
            record._id,
            { $set: updateData },
            { new: true }
          );
          fixedCount++;
          
          if (fixedCount % 100 === 0) {
            console.log(`✓ Fixed ${fixedCount} records...`);
          }
        } else {
          // Already correct
          alreadyCorrectCount++;
        }

      } catch (error) {
        console.error(`❌ Error fixing record ${record._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Fix Summary:');
    console.log(`   ✅ Fixed (swapped): ${fixedCount} records`);
    console.log(`   ✓ Already correct: ${alreadyCorrectCount} records`);
    console.log(`   ❌ Errors: ${errorCount} records`);
    console.log(`   📊 Total processed: ${allRecords.length} records\n`);

    // Show sample of fixed records
    if (fixedCount > 0) {
      console.log('📋 Sample of fixed records:\n');
      const sampleRecords = await VoterData.find({
        name: { $exists: true, $ne: '' },
        name_mr: { $exists: true, $ne: '' }
      })
        .limit(5)
        .select('name name_mr gender gender_mr serialNumber');
      
      sampleRecords.forEach((record, index) => {
        console.log(`${index + 1}. Serial: ${record.serialNumber}`);
        console.log(`   Name (English): ${record.name}`);
        console.log(`   Name (Marathi): ${record.name_mr}`);
        console.log(`   Gender (English): ${record.gender || 'N/A'}`);
        console.log(`   Gender (Marathi): ${record.gender_mr || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
};

// Main execution
const runFix = async () => {
  try {
    await connectDB();
    await fixSwappedNames();
    await mongoose.connection.close();
    console.log('✅ Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runFix();

