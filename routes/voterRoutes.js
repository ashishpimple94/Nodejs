import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadExcelFile,
  getAllVoters,
  getVoterById,
  deleteAllVoters,
} from '../controllers/voterController.js';

const router = express.Router();

// Routes
router.post('/upload', upload.single('file'), uploadExcelFile);
router.get('/', getAllVoters);
router.get('/:id', getVoterById);
router.delete('/', deleteAllVoters);

export default router;

