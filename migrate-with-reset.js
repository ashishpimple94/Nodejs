// Migration script - Reset and properly update all records
import mongoose from 'mongoose';
import VoterData from './models/VoterData.js';
import { config } from 'dotenv';
import { processVoterName, processGender } from './utils/transliteration.js';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-database';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateData = async () => {
  try {
    console.log('\n🔄 Starting COMPLETE data migration with transliteration...\n');

    // Find ALL records (we'll update all of them properly)
    const allRecords = await VoterData.find({
      name: { $not: /^Unknown/ } // Skip Unknown records
    });

    console.log(`📊 Found ${allRecords.length} records to migrate\n`);

    if (allRecords.length === 0) {
      console.log('✅ No records need migration.');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const record of allRecords) {
      try {
        const updateData = {};

        // Process name - transliterate from Marathi to English
        const { nameEnglish, nameMarathi } = processVoterName(record.name);
        
        if (nameMarathi) {
          // Original name was in Marathi
          updateData.name = nameEnglish;        // English transliterated
          updateData.name_mr = nameMarathi;     // Marathi original
        }

        // Process gender - translate from Marathi to English
        if (record.gender) {
          const { genderEnglish, genderMarathi } = processGender(record.gender);
          
          if (genderMarathi) {
            // Original gender was in Marathi
            updateData.gender = genderEnglish;      // English translated
            updateData.gender_mr = genderMarathi;   // Marathi original
          }
        }

        // Update if we have changes
        if (Object.keys(updateData).length > 0) {
          await VoterData.findByIdAndUpdate(
            record._id,
            { $set: updateData },
            { new: true }
          );
          updatedCount++;
          
          if (updatedCount % 500 === 0) {
            console.log(`✓ Updated ${updatedCount} records...`);
          }
        }

      } catch (error) {
        console.error(`❌ Error updating record ${record._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully updated: ${updatedCount} records`);
    console.log(`   ❌ Errors: ${errorCount} records`);
    console.log(`   📊 Total processed: ${allRecords.length} records\n`);

    // Show sample of updated records
    console.log('📋 Sample Migrated Records:\n');
    const sampleRecords = await VoterData.find({
      name_mr: { $exists: true, $ne: '' },
      name: { $not: /^Unknown/ }
    })
      .limit(3)
      .select('name name_mr gender gender_mr serialNumber age voterIdCard');
    
    sampleRecords.forEach((record, index) => {
      console.log(`${index + 1}. Serial: ${record.serialNumber || 'N/A'}`);
      console.log(`   Name (English):  ${record.name}`);
      console.log(`   Name (Marathi):  ${record.name_mr}`);
      console.log(`   Gender (English): ${record.gender || 'N/A'}`);
      console.log(`   Gender (Marathi): ${record.gender_mr || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    await migrateData();
    
    console.log('✅ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();



