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
    },
    gender: {
      type: String,
      required: false,
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

