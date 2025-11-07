// Diagnostic script to check name field issues
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

const checkFields = async () => {
  try {
    console.log('\n🔍 Checking name field issues...\n');

    // Find the specific record the user mentioned
    const specificRecord = await VoterData.findById('68fb1d13f33651b2a0c1fb8b');
    if (specificRecord) {
      console.log('📋 User\'s specific record:');
      const nameIsMarathi = isMarathiText(specificRecord.name);
      const nameMrIsMarathi = specificRecord.name_mr ? isMarathiText(specificRecord.name_mr) : false;
      console.log(`  _id: ${specificRecord._id}`);
      console.log(`  name: "${specificRecord.name}" (${nameIsMarathi ? 'Marathi' : 'English'})`);
      console.log(`  name_mr: "${specificRecord.name_mr || '(empty)'}" (${nameMrIsMarathi ? 'Marathi' : specificRecord.name_mr ? 'English' : 'empty'})`);
      console.log(`  gender: "${specificRecord.gender || '(empty)'}"`);
      console.log(`  gender_mr: "${specificRecord.gender_mr || '(empty)'}"`);
      console.log('');
    }

    // Find records where name has Marathi (excluding Unknown) - use $regex instead
    const recordsWithMarathiInName = await VoterData.find({
      name: { $exists: true, $ne: '', $not: /^Unknown/ }
    }).limit(20);
    
    // Filter in JavaScript to find Marathi names
    const filteredRecords = recordsWithMarathiInName.filter(record => {
      return isMarathiText(record.name) || (record.name_mr && isMarathiText(record.name_mr));
    }).slice(0, 10);

    console.log(`📊 Checking ${filteredRecords.length} sample records with Marathi text:\n`);

    let swappedCount = 0;
    let correctCount = 0;

    for (const record of filteredRecords) {
      const nameIsMarathi = isMarathiText(record.name);
      const nameMrIsMarathi = record.name_mr ? isMarathiText(record.name_mr) : false;
      
      console.log(`Serial: ${record.serialNumber || 'N/A'}`);
      console.log(`  name: "${record.name}" (${nameIsMarathi ? 'Marathi' : 'English'})`);
      console.log(`  name_mr: "${record.name_mr || '(empty)'}" (${nameMrIsMarathi ? 'Marathi' : record.name_mr ? 'English' : 'empty'})`);
      
      if (nameIsMarathi && record.name_mr && !nameMrIsMarathi) {
        console.log(`  ⚠️  SWAPPED - name has Marathi, name_mr has English`);
        swappedCount++;
      } else if (!nameIsMarathi && nameMrIsMarathi) {
        console.log(`  ✅ CORRECT - name has English, name_mr has Marathi`);
        correctCount++;
      } else if (nameIsMarathi && !record.name_mr) {
        console.log(`  ⚠️  name has Marathi but name_mr is empty`);
      } else {
        console.log(`  ℹ️  Other case`);
      }
      console.log('');
    }

    // Count swapped records
    const allRecords = await VoterData.find({
      name: { $exists: true, $ne: '' },
      name_mr: { $exists: true, $ne: '' }
    });

    let totalSwapped = 0;
    for (const record of allRecords) {
      const nameIsMarathi = isMarathiText(record.name);
      const nameMrIsMarathi = record.name_mr ? isMarathiText(record.name_mr) : false;
      if (nameIsMarathi && !nameMrIsMarathi) {
        totalSwapped++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total records with both name and name_mr: ${allRecords.length}`);
    console.log(`   Records with swapped fields: ${totalSwapped}`);
    console.log(`   Sample swapped in display: ${swappedCount}`);
    console.log(`   Sample correct in display: ${correctCount}`);

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  }
};

const runCheck = async () => {
  try {
    await connectDB();
    await checkFields();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runCheck();

