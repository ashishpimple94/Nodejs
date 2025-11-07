// Migration script to update existing voter data with bilingual fields
import mongoose from 'mongoose';
import VoterData from './models/VoterData.js';
import { config } from 'dotenv';
import { processVoterName, processGender } from './utils/transliteration.js';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-database';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function
const migrateData = async () => {
  try {
    console.log('\n🔄 Starting data migration...\n');

    // Find all records that don't have name_mr field
    const recordsToUpdate = await VoterData.find({
      $or: [
        { name_mr: { $exists: false } },
        { name_mr: null },
        { name_mr: '' }
      ]
    });

    console.log(`📊 Found ${recordsToUpdate.length} records to migrate\n`);

    if (recordsToUpdate.length === 0) {
      console.log('✅ No records need migration. All data is up to date!');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const record of recordsToUpdate) {
      try {
        const updateData = {};

        // Process name - transliterate if Marathi
        const { nameEnglish, nameMarathi } = processVoterName(record.name);
        
        if (nameMarathi) {
          // Original was in Marathi
          updateData.name = nameEnglish;        // English (transliterated)
          updateData.name_mr = nameMarathi;     // Marathi (original)
        } else if (nameEnglish && !record.name_mr) {
          // Original was in English, just set name_mr
          updateData.name_mr = nameEnglish;
        }

        // Process gender - translate if Marathi
        if (record.gender) {
          const { genderEnglish, genderMarathi } = processGender(record.gender);
          
          if (genderMarathi) {
            // Original was in Marathi
            updateData.gender = genderEnglish;      // English (translated)
            updateData.gender_mr = genderMarathi;   // Marathi (original)
          } else if (genderEnglish && !record.gender_mr) {
            // Original was in English
            updateData.gender = genderEnglish;
            updateData.gender_mr = genderMarathi || genderEnglish;
          }
        }

        // Only update if we have data to update
        if (Object.keys(updateData).length > 0) {
          await VoterData.findByIdAndUpdate(
            record._id,
            { $set: updateData },
            { new: true }
          );
          updatedCount++;
          
          if (updatedCount % 100 === 0) {
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
    console.log(`   📊 Total processed: ${recordsToUpdate.length} records\n`);

    // Show sample of updated records
    console.log('📋 Sample of migrated records:\n');
    const sampleRecords = await VoterData.find({ name_mr: { $exists: true, $ne: '' } })
      .limit(3)
      .select('name name_mr gender gender_mr serialNumber');
    
    sampleRecords.forEach((record, index) => {
      console.log(`${index + 1}. Serial: ${record.serialNumber}`);
      console.log(`   Name (English): ${record.name}`);
      console.log(`   Name (Marathi): ${record.name_mr}`);
      console.log(`   Gender (English): ${record.gender || 'N/A'}`);
      console.log(`   Gender (Marathi): ${record.gender_mr || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Main execution
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

