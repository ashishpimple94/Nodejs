// Test migration on just 5 records
import mongoose from 'mongoose';
import VoterData from './models/VoterData.js';
import { config } from 'dotenv';
import { processVoterName, processGender } from './utils/transliteration.js';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-database';

const test = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Get 5 records with Marathi names
    const records = await VoterData.find({
      name: { $not: /^Unknown/ },
      serialNumber: { $exists: true, $ne: '' }
    }).limit(5);

    console.log('📋 BEFORE Migration:\n');
    records.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name} | ${r.gender || 'N/A'}`);
    });

    console.log('\n🔄 Migrating...\n');

    for (const record of records) {
      const { nameEnglish, nameMarathi } = processVoterName(record.name);
      const { genderEnglish, genderMarathi } = processGender(record.gender || '');

      await VoterData.findByIdAndUpdate(record._id, {
        $set: {
          name: nameEnglish || record.name,
          name_mr: nameMarathi || record.name,
          gender: genderEnglish || record.gender,
          gender_mr: genderMarathi || record.gender
        }
      });
    }

    console.log('📋 AFTER Migration:\n');
    const updated = await VoterData.find({
      _id: { $in: records.map(r => r._id) }
    });

    updated.forEach((r, i) => {
      console.log(`${i + 1}. Serial: ${r.serialNumber}`);
      console.log(`   Name (EN): ${r.name}`);
      console.log(`   Name (MR): ${r.name_mr}`);
      console.log(`   Gender (EN): ${r.gender}`);
      console.log(`   Gender (MR): ${r.gender_mr}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

test();



