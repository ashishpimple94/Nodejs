// Debug script to check what fields are actually in the uploaded Excel file
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Find the most recently uploaded file
const uploadsDir = 'uploads';
const files = fs.readdirSync(uploadsDir)
  .map(file => ({
    name: file,
    path: path.join(uploadsDir, file),
    time: fs.statSync(path.join(uploadsDir, file)).mtime
  }))
  .sort((a, b) => b.time - a.time);

if (files.length === 0) {
  console.log('❌ No files found in uploads directory');
  process.exit(1);
}

const latestFile = files[0];
console.log('📄 Checking file:', latestFile.name);
console.log('');

try {
  const workbook = XLSX.readFile(latestFile.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('📋 Sheet name:', sheetName);
  console.log('');
  
  // Get all rows
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log('📊 Total rows:', rows.length);
  console.log('');
  
  // Show first 5 rows to see structure
  console.log('🔍 First 5 rows (raw):');
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    console.log(`Row ${i}:`, rows[i]);
  }
  console.log('');
  
  // Try to detect header row
  const normalizeKey = (key) =>
    key
      ? String(key)
          .trim()
          .toLowerCase()
          .replace(/[.\u0964:()\-_/]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';
  
  // Check different rows for headers
  console.log('🎯 Checking for header row:');
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i] || [];
    const normalized = row.map(normalizeKey);
    console.log(`Row ${i} (normalized):`, normalized);
  }
  console.log('');
  
  // Try with first row as header
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0, defval: '', raw: true });
  
  if (jsonData.length > 0) {
    console.log('📝 First row as JSON (assuming first row is header):');
    console.log(JSON.stringify(jsonData[0], null, 2));
    console.log('');
    
    console.log('🔑 Column names (from first row):');
    const firstRowKeys = Object.keys(jsonData[0]);
    firstRowKeys.forEach((key, index) => {
      console.log(`  ${index + 1}. "${key}"`);
    });
    console.log('');
    
    // Check actual values
    console.log('📋 First data row values:');
    if (jsonData.length > 1) {
      const firstDataRow = jsonData[1];
      firstRowKeys.forEach(key => {
        console.log(`  ${key}: "${firstDataRow[key] || ''}"`);
      });
    }
  }
  
  // Try auto-detection like controller
  const headerCandidates = [
    ['नाव', 'नाम', 'name', 'full name', 'name of elector', 'elector name', 'name english', 'name marathi', 'name_en', 'name_mr', 'name_english', 'name_marathi'],
    ['अनु क्र', 'serial', 'sr no', 'क्रमांक', 'sr_no', 'sr_no', 'serial_number'],
    ['घर', 'house', 'house_no', 'house_number', 'house_no'],
    ['लिंग', 'gender', 'sex', 'gender_en', 'gender_mr', 'gender_english', 'gender_marathi'],
    ['वय', 'age'],
    ['मतदान', 'voter', 'epic', 'id card', 'elector photo identity', 'epic_id', 'epic_id', 'voter_id'],
    ['मोबाईल', 'mobile', 'phone', 'contact', 'mobile_no', 'mobile_number']
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
  
  console.log('');
  console.log('🎯 Auto-detected header row index:', headerRowIndex);
  console.log('   Score:', bestScore);
  console.log('');
  
  // Get data with detected header
  const jsonDataWithHeader = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '', raw: true });
  
  if (jsonDataWithHeader.length > 0) {
    console.log('📝 Detected column names:');
    const detectedKeys = Object.keys(jsonDataWithHeader[0]);
    detectedKeys.forEach((key, index) => {
      console.log(`  ${index + 1}. "${key}"`);
    });
    console.log('');
    
    console.log('📋 First data row (with detected header):');
    console.log(JSON.stringify(jsonDataWithHeader[0], null, 2));
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

