// API endpoint to get Excel file fields without uploading
// This can be used to check what fields are in an Excel file

import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Helper: normalize header keys
const normalizeKey = (key) =>
  key
    ? String(key)
        .trim()
        .toLowerCase()
        .replace(/[.\u0964:()\-_/]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

app.post('/api/check-fields', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file. Use field name "file"',
      });
    }

    console.log(`Processing: ${req.file.originalname}`);
    console.log(`File path: ${req.file.path}`);

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file not found',
      });
    }

    // Read Excel file
    let workbook;
    try {
      workbook = XLSX.readFile(req.file.path);
    } catch (xlsxError) {
      console.error('XLSX read error:', xlsxError);
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file format',
        error: xlsxError.message
      });
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no sheets',
      });
    }

    const worksheet = workbook.Sheets[sheetName];

    // Auto-detect header row
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const headerCandidates = [
      ['नाव', 'नाम', 'name', 'full name', 'name of elector', 'elector name', 'name english', 'name marathi'],
      ['अनु क्र', 'serial', 'sr no', 'क्रमांक'],
      ['घर', 'house'],
      ['लिंग', 'gender', 'sex'],
      ['वय', 'age'],
      ['मतदान', 'voter', 'epic', 'id card', 'elector photo identity'],
      ['मोबाईल', 'mobile', 'phone', 'contact']
    ];
    const scoreRow = (cells = []) => {
      const normCells = cells.map(normalizeKey);
      let score = 0;
      for (const group of headerCandidates) {
        const found = group.some(tok => {
          const nt = normalizeKey(tok);
          return normCells.some(c => c && c.includes(nt));
        });
        if (found) score++;
      }
      return score;
    };
    let headerRowIndex = 0;
    let bestScore = -1;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const s = scoreRow(rows[i] || []);
      if (s > bestScore) {
        bestScore = s;
        headerRowIndex = i;
      }
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '', raw: true });

    // Get field names
    const headerRow = rows[headerRowIndex] || [];
    const fieldNames = jsonData.length > 0 ? Object.keys(jsonData[0]) : headerRow.filter(h => h);

    // Cleanup file
    fs.unlinkSync(req.file.path);

    // Return fields information
    res.status(200).json({
      success: true,
      message: 'Fields detected successfully',
      data: {
        fileName: req.file.originalname,
        sheetName: sheetName,
        detectedHeaderRow: headerRowIndex,
        headerRowScore: bestScore,
        totalColumns: fieldNames.length,
        totalDataRows: jsonData.length,
        columnNames: fieldNames,
        headerRow: headerRow,
        sampleRow: jsonData.length > 0 ? jsonData[0] : null,
        sampleRows: jsonData.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Cleanup file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🔍 Excel Fields Checker API running on http://localhost:${PORT}`);
  console.log(`📤 POST to http://localhost:${PORT}/api/check-fields with file field\n`);
});

