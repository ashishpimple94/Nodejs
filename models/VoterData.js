import mongoose from 'mongoose';

const voterDataSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: false,
    },
    houseNumber: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
      comment: 'Name in English'
    },
    name_mr: {
      type: String,
      required: false,
      comment: 'Name in Marathi (मराठी नाव)'
    },
    gender: {
      type: String,
      required: false,
    },
    gender_mr: {
      type: String,
      required: false,
      comment: 'Gender in Marathi (लिंग)'
    },
    age: {
      type: Number,
      required: false,
    },
    voterIdCard: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const VoterData = mongoose.model('VoterData', voterDataSchema);

export default VoterData;

