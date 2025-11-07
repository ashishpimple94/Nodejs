// middleware/upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Check if we're in Vercel/serverless environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// Use memory storage for Vercel (serverless), disk storage for local dev
const storage = isVercel
  ? multer.memoryStorage() // Vercel serverless: use memory storage
  : multer.diskStorage({
      // Local development: use disk storage
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueFilename);
      },
    });

const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname, file.mimetype);
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExt = ['.xlsx', '.xls'];

  if (allowedMimes.includes(file.mimetype) || allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('केवल Excel फाइलें (.xlsx, .xls) की अनुमति है'), false);
  }
};

const maxMb = parseInt(process.env.MAX_FILE_SIZE_MB || '25');
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxMb * 1024 * 1024 // default 25MB (configurable via MAX_FILE_SIZE_MB)
  }
});

// Export storage type for controller to know how to handle files
export { isVercel };
export default upload;