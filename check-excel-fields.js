// Script to check Excel file fields
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const excelFile = path.join(process.cwd(), 'uploads', '1760681626701-employee_data (2).xls');

console.log('📄 Reading Excel file:', excelFile);
console.log('');

if (!fs.existsSync(excelFile)) {
  console.error('❌ File not found:', excelFile);
  process.exit(1);
}

try {
  // Read Excel file exactly as controller does
  let workbook;
  try {
    workbook = XLSX.readFile(excelFile);
  } catch (xlsxError) {
    console.error('❌ XLSX read error:', xlsxError.message);
    console.error('   This file might be corrupted or in an unsupported format');
    console.error('   Try converting it to .xlsx format');
    process.exit(1);
  }
  
  const sheetName = workbook.SheetNames[0];
  console.log('📋 Sheet name:', sheetName);
  console.log('📋 Total sheets:', workbook.SheetNames.length);
  console.log('');

  if (!sheetName) {
    console.error('❌ No sheets found in file');
    process.exit(1);
  }

  const worksheet = workbook.Sheets[sheetName];

  // Get all rows
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log('📊 Total rows:', rows.length);
  console.log('');

  // Show first 10 rows to detect header
  console.log('🔍 First 10 rows (to detect header):');
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    console.log(`Row ${i + 1}:`, rows[i]);
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

  console.log('🎯 Detected header row index:', headerRowIndex);
  console.log('   Header row score:', bestScore);
  console.log('');

  // Get headers
  const headerRow = rows[headerRowIndex] || [];
  console.log('📝 Headers/Fields found:');
  headerRow.forEach((header, index) => {
    console.log(`   ${index + 1}. "${header}"`);
  });
  console.log('');

  // Convert to JSON with detected headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '', raw: true });
  
  console.log('📦 First data row (as JSON):');
  if (jsonData.length > 0) {
    console.log(JSON.stringify(jsonData[0], null, 2));
  } else {
    console.log('No data rows found');
  }
  console.log('');

  // Summary
  console.log('📈 Summary:');
  console.log('   Total columns:', headerRow.length);
  console.log('   Total data rows:', jsonData.length);
  console.log('   Column names:', headerRow);

  // Return as JSON
  const result = {
    sheetName: sheetName,
    headerRowIndex: headerRowIndex,
    totalRows: rows.length,
    totalDataRows: jsonData.length,
    columns: headerRow,
    columnCount: headerRow.length,
    firstDataRow: jsonData.length > 0 ? jsonData[0] : null,
    sampleRows: jsonData.slice(0, 5)
  };

  console.log('');
  console.log('📄 Complete result as JSON:');
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.error('❌ Error reading Excel file:', error);
  process.exit(1);
}

