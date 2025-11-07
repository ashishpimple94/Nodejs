// Simple script to show Excel file fields as JSON
// Usage: node show-excel-fields.js <path-to-excel-file>

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const filePath = process.argv[2] || 'sample-voter-data-50000.xlsx';

console.log('📄 Reading Excel file:', filePath);
console.log('');

if (!fs.existsSync(filePath)) {
  console.error('❌ File not found:', filePath);
  console.error('Usage: node show-excel-fields.js <path-to-excel-file>');
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get all rows
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  // Normalize helper
  const normalizeKey = (key) =>
    key
      ? String(key)
          .trim()
          .toLowerCase()
          .replace(/[.\u0964:()\-_/]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

  // Detect header row
  const headerCandidates = [
    ['नाव', 'नाम', 'name', 'full name', 'name of elector', 'elector name'],
    ['अनु क्र', 'serial', 'sr no', 'क्रमांक'],
    ['घर', 'house'],
    ['लिंग', 'gender', 'sex'],
    ['वय', 'age'],
    ['मतदान', 'voter', 'epic', 'id card'],
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
  const headerRow = rows[headerRowIndex] || [];
  const fieldNames = jsonData.length > 0 ? Object.keys(jsonData[0]) : headerRow.filter(h => h);

  const result = {
    fileName: path.basename(filePath),
    sheetName: sheetName,
    detectedHeaderRow: headerRowIndex,
    headerRowScore: bestScore,
    totalColumns: fieldNames.length,
    totalDataRows: jsonData.length,
    columnNames: fieldNames,
    headerRow: headerRow,
    sampleRow: jsonData.length > 0 ? jsonData[0] : null,
    sampleRows: jsonData.slice(0, 5)
  };

  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

