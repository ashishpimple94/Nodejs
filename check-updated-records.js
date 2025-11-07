// Quick script to check updated records
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

    // Count updated records (with name_mr field)
    const updatedCount = await VoterData.countDocuments({
      name_mr: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`✅ Updated Records (with name_mr): ${updatedCount.toLocaleString()}`);
    console.log(`⏳ Pending Records: ${(totalCount - updatedCount).toLocaleString()}\n`);

    // Show 3 sample updated records
    console.log('📋 Sample Updated Records:\n');
    const samples = await VoterData.find({ 
      name_mr: { $exists: true, $ne: '' } 
    }).limit(3);

    samples.forEach((record, index) => {
      console.log(`${index + 1}. Record ID: ${record._id}`);
      console.log(`   Serial Number: ${record.serialNumber || 'N/A'}`);
      console.log(`   Name (English): ${record.name}`);
      console.log(`   Name (Marathi): ${record.name_mr || 'Not Set'}`);
      console.log(`   Gender (English): ${record.gender || 'N/A'}`);
      console.log(`   Gender (Marathi): ${record.gender_mr || 'Not Set'}`);
      console.log(`   Age: ${record.age || 'N/A'}`);
      console.log(`   Voter ID: ${record.voterIdCard || 'N/A'}`);
      console.log('');
    });

    // Show 3 sample NOT updated records
    console.log('📋 Sample NOT Updated Records (Pending):\n');
    const pendingSamples = await VoterData.find({
      $or: [
        { name_mr: { $exists: false } },
        { name_mr: null },
        { name_mr: '' }
      ]
    }).limit(3);

    if (pendingSamples.length > 0) {
      pendingSamples.forEach((record, index) => {
        console.log(`${index + 1}. Record ID: ${record._id}`);
        console.log(`   Serial Number: ${record.serialNumber || 'N/A'}`);
        console.log(`   Name: ${record.name}`);
        console.log(`   name_mr field: ${record.name_mr || '❌ NOT SET'}`);
        console.log('');
      });
    } else {
      console.log('✅ All records are updated!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkRecords();



