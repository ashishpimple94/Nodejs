// Check real updated records with valid names
import mongoose from 'mongoose';
import VoterData from './models/VoterData.js';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-database';

const checkRecords = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count total records
    const totalCount = await VoterData.countDocuments();
    console.log(`📊 Total Records: ${totalCount.toLocaleString()}\n`);

    // Count updated records (with name_mr field and not Unknown)
    const updatedCount = await VoterData.countDocuments({
      name_mr: { $exists: true, $ne: null, $ne: '' },
      name: { $not: /^Unknown/ }
    });
    
    console.log(`✅ Updated Records (with transliteration): ${updatedCount.toLocaleString()}\n`);

    // Show 5 sample updated records with REAL names
    console.log('📋 Sample Updated Records (WITH TRANSLITERATION):\n');
    const samples = await VoterData.find({ 
      name_mr: { $exists: true, $ne: '' },
      name: { $not: /^Unknown/ },
      gender_mr: { $exists: true }
    }).limit(5);

    samples.forEach((record, index) => {
      console.log(`${index + 1}. Serial: ${record.serialNumber || 'N/A'}`);
      console.log(`   📝 Name (English):  ${record.name}`);
      console.log(`   📝 Name (Marathi):  ${record.name_mr}`);
      console.log(`   👤 Gender (English): ${record.gender || 'N/A'}`);
      console.log(`   👤 Gender (Marathi): ${record.gender_mr || 'N/A'}`);
      console.log(`   🎂 Age: ${record.age || 'N/A'}`);
      console.log(`   🆔 Voter ID: ${record.voterIdCard || 'N/A'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkRecords();



