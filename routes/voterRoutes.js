import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadExcelFile,
  getAllVoters,
  getVoterById,
  deleteAllVoters,
  searchVoters,
} from '../controllers/voterController.js';

const router = express.Router();

// Routes
router.post('/upload', upload.single('file'), uploadExcelFile);
router.get('/search', searchVoters); // Search route (must be before /:id)
router.get('/', getAllVoters);
router.get('/:id', getVoterById);
router.delete('/', deleteAllVoters);

export default router;

