// Fix script to transliterate Marathi names in 'name' field to English
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import VoterData from './models/VoterData.js';
import { isMarathiText, processVoterName, processGender } from './utils/transliteration.js';

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

const fixMarathiToEnglish = async () => {
  try {
    console.log('\n🔄 Starting fix to transliterate Marathi names to English...\n');

    // Find all records (excluding Unknown)
    const allRecords = await VoterData.find({
      name: { $exists: true, $ne: '', $not: /^Unknown/ }
    });

    console.log(`📊 Found ${allRecords.length} records to check\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const record of allRecords) {
      try {
        const nameIsMarathi = isMarathiText(record.name);
        const nameMrIsMarathi = record.name_mr ? isMarathiText(record.name_mr) : false;
        const genderIsMarathi = record.gender ? isMarathiText(record.gender) : false;
        const genderMrIsMarathi = record.gender_mr ? isMarathiText(record.gender_mr) : false;
        
        const updateData = {};
        let needsUpdate = false;
        
        // If name field has Marathi, transliterate it to English
        if (nameIsMarathi) {
          const processed = processVoterName(record.name);
          if (processed.nameEnglish && processed.nameEnglish !== record.name) {
            // If name_mr is empty or also Marathi, set it to original Marathi
            if (!record.name_mr || nameMrIsMarathi) {
              updateData.name = processed.nameEnglish;  // English transliterated
              updateData.name_mr = record.name;          // Original Marathi
            } else {
              // name_mr already has English, so just fix name
              updateData.name = record.name_mr;         // Use existing English from name_mr
              updateData.name_mr = record.name;          // Original Marathi goes to name_mr
            }
            needsUpdate = true;
          }
        }
        
        // If gender field has Marathi, translate it to English
        if (genderIsMarathi) {
          const processed = processGender(record.gender);
          if (processed.genderEnglish && processed.genderEnglish !== record.gender) {
            // If gender_mr is empty or also Marathi, set it to original Marathi
            if (!record.gender_mr || genderMrIsMarathi) {
              updateData.gender = processed.genderEnglish;  // English translated
              updateData.gender_mr = record.gender;          // Original Marathi
            } else {
              // gender_mr already has English, so just fix gender
              updateData.gender = record.gender_mr;         // Use existing English from gender_mr
              updateData.gender_mr = record.gender;         // Original Marathi goes to gender_mr
            }
            needsUpdate = true;
          }
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
          alreadyCorrectCount++;
        }

      } catch (error) {
        console.error(`❌ Error fixing record ${record._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Fix Summary:');
    console.log(`   ✅ Fixed (transliterated): ${fixedCount} records`);
    console.log(`   ✓ Already correct: ${alreadyCorrectCount} records`);
    console.log(`   ❌ Errors: ${errorCount} records`);
    console.log(`   📊 Total processed: ${allRecords.length} records\n`);

    // Show sample of fixed records
    if (fixedCount > 0) {
      console.log('📋 Sample of fixed records:\n');
      const sampleRecords = await VoterData.find({
        name: { $exists: true, $ne: '', $not: /^Unknown/ }
      })
        .limit(5)
        .select('name name_mr gender gender_mr serialNumber');
      
      sampleRecords.forEach((record, index) => {
        console.log(`${index + 1}. Serial: ${record.serialNumber || 'N/A'}`);
        console.log(`   Name (English): ${record.name}`);
        console.log(`   Name (Marathi): ${record.name_mr || '(empty)'}`);
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
    await fixMarathiToEnglish();
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

