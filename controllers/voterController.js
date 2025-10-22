// controllers/voterController.js
import XLSX from 'xlsx';
import VoterData from '../models/VoterData.js';
import fs from 'fs';

// Helper: normalize header keys for robust matching (trim, lowercase, remove dots/punctuations, collapse spaces)
const normalizeKey = (key) =>
  key
    ? String(key)
        .trim()
        .toLowerCase()
        .replace(/[.\u0964:()\-_/]/g, '')
        .replace(/\s+/g, ' ')
    : '';

// Helper: get value from a row by trying multiple candidate headers (supports normalized exact and partial matches)
const getVal = (row, candidates = []) => {
  if (!row || typeof row !== 'object') return '';

  const normRow = {};
  for (const [k, v] of Object.entries(row)) {
    normRow[normalizeKey(k)] = v;
  }

  for (const cand of candidates) {
    const normCand = normalizeKey(cand);
    if (normCand in normRow && normRow[normCand] != null && normRow[normCand] !== '') {
      return normRow[normCand];
    }
  }

  // fallback: partial match by contains for flexible headers like EPIC, voter, id, card, etc.
  const flexible = candidates.map((c) => normalizeKey(c));
  for (const [k, v] of Object.entries(normRow)) {
    if (v == null || v === '') continue;
    for (const f of flexible) {
      if (f && k.includes(f)) return v;
    }
  }

  return '';
};

export const uploadExcelFile = async (req, res) => {
  try {
    console.log('=== UPLOAD DEBUG ===');
    console.log('req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'कृपया Excel फाइल अपलोड करें। फील्ड नाम "file" का उपयोग करें',
      });
    }

    console.log(`Processing: ${req.file.originalname}`);
    console.log(`File path: ${req.file.path}`);
    console.log(`File size: ${req.file.size} bytes`);

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({
        success: false,
        message: 'अपलोड की गई फाइल नहीं मिली',
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
        message: 'अमान्य Excel फाइल फॉर्मेट',
        error: xlsxError.message
      });
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel फाइल खाली है या कोई शीट नहीं है',
      });
    }

    const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    console.log('Total rows found:', jsonData.length);
    console.log('First row sample:', jsonData[0] ? Object.keys(jsonData[0]) : 'No data');

    if (jsonData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel फाइल खाली है',
      });
    }

// Transform data
    const voterDataArray = jsonData.map((row, index) => {
      if (!row || typeof row !== 'object') return null;

      const serialNumber = getVal(row, [
        'अनु क्र.', 'अनु.क्र.', 'अनु क्रमांक', 'Serial Number', 'Serial No', 'Sr No', 'Sr Number', 'क्रमांक'
      ]);

      const houseNumber = getVal(row, [
        'घर क्र.', 'घर क्र', 'House Number', 'House No', 'घर नंबर', 'घर क्रमांक'
      ]);

      const name = getVal(row, [
        'नाव', 'नाम', 'Name', 'Full Name'
      ]) || `Unknown_${index}`;

      const gender = getVal(row, [
        'लिंग', 'Gender', 'Sex'
      ]);

      const ageRaw = getVal(row, [
        'वय', 'Age'
      ]);
      const age = parseInt(ageRaw || 0) || 0;

      const voterIdCard = getVal(row, [
        // Marathi/Hindi variants
        'मतदान कार्ड क्र.', 'मतदान कार्ड क्र', 'मतदान कार्ड क्रमांक', 'मतदार ओळखपत्र', 'मतदार ओळखपत्र क्र.', 'मतदार ओळख क्रमांक',
        // English variants
        'Voter ID', 'Voter ID No', 'Voter ID Number', 'Voter Id Card', 'Voter Id Card No', 'Voter Card Number', 'VoterCard No', 'VoterID',
        'EPIC No', 'EPIC Number', 'EPIC', 'Elector Photo Identity Card No', 'ID Card No', 'IDCard No', 'ID Card Number'
      ]);

      const mobileNumber = getVal(row, [
        'मोबाईल नं.', 'मोबाईल', 'Mobile Number', 'Mobile No', 'Phone', 'Phone Number', 'Contact', 'Contact Number'
      ]);

      const transformedRow = { serialNumber, houseNumber, name, gender, age, voterIdCard, mobileNumber };

      // Validate required field (name)
      if (!transformedRow.name || /^Unknown_/.test(transformedRow.name)) {
        console.warn(`Row ${index}: Missing valid name, skipping`);
        return null;
      }

      return transformedRow;
    }).filter(row => row !== null);

    console.log(`Valid records to insert: ${voterDataArray.length}`);

    if (voterDataArray.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'कोई वैध डेटा नहीं मिला (नाम के साथ)',
      });
    }

    // Insert data in bulk
    const savedData = await VoterData.insertMany(voterDataArray, {
      ordered: false // Continue even if some fail
    });

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `डेटा सफलतापूर्वक अपलोड हो गया (${savedData.length} रिकॉर्ड्स)`,
      count: savedData.length,
      sample: savedData.slice(0, 5),
    });

  } catch (error) {
    console.error('=== UPLOAD ERROR ===', error);

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
      message: 'सर्वर एरर',
      error: process.env.NODE_ENV === 'development' ? error.message : 'आंतरिक सर्वर त्रुटि',
    });
  }
};

// Update other functions with Hindi messages
export const getAllVoters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50000;
    const skip = (page - 1) * limit;

    const voters = await VoterData.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await VoterData.countDocuments();

    res.status(200).json({
      success: true,
      count: voters.length,
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: voters,
    });
  } catch (error) {
    console.error('Get voters error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर एरर',
      error: error.message,
    });
  }
};

export const getVoterById = async (req, res) => {
  try {
    const voter = await VoterData.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'वोटर नहीं मिला',
      });
    }

    res.status(200).json({
      success: true,
      data: voter,
    });
  } catch (error) {
    console.error('Get voter error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर एरर',
      error: error.message,
    });
  }
};

export const deleteAllVoters = async (req, res) => {
  try {
    const result = await VoterData.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'सभी डेटा सफलतापूर्वक डिलीट हो गया',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर एरर',
      error: error.message,
    });
  }
};