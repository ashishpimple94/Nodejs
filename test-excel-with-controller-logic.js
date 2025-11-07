// Test Excel file with exact controller logic
import XLSX from 'xlsx';
import { isMarathiText } from './utils/transliteration.js';

const excelFile = '/Users/ashishpimple/Downloads/Voterlist(1) (1).xlsx';

console.log('📄 Testing Excel file with controller logic...\n');

try {
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Use same logic as controller - auto-detect header
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
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
  
  console.log('Detected header row index:', headerRowIndex);
  console.log('Best score:', bestScore);
  console.log('');
  
  // Read with detected header
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, defval: '', raw: true });
  
  console.log('Total rows:', jsonData.length);
  console.log('');
  
  if (jsonData.length > 0) {
    const firstRow = jsonData[0];
    
    console.log('🔑 First row keys:', Object.keys(firstRow));
    console.log('');
    console.log('📝 First row values:');
    console.log(JSON.stringify(firstRow, null, 2));
    console.log('');
    
    // Test direct access
    console.log('🧪 Direct access test:');
    console.log('row["Name_En"]:', firstRow['Name_En']);
    console.log('row["Name_Mr"]:', firstRow['Name_Mr']);
    console.log('row["Gender_En"]:', firstRow['Gender_En']);
    console.log('row["Gender_Mr"]:', firstRow['Gender_Mr']);
    console.log('row["SR_NO"]:', firstRow['SR_NO']);
    console.log('row["Epic_id"]:', firstRow['Epic_id']);
    console.log('');
    
    // Test with controller's getField logic
    const getField = (row, possibleNames) => {
      if (!row || typeof row !== 'object') return '';
      
      // First try exact match
      for (const name of possibleNames) {
        if (row.hasOwnProperty(name)) {
          const val = row[name];
          if (val !== undefined && val !== null) {
            const trimmed = String(val).trim();
            return trimmed;
          }
        }
      }
      
      // Then try case-insensitive
      const rowKeys = Object.keys(row);
      for (const name of possibleNames) {
        const nameNormalized = name.toLowerCase().trim().replace(/[\s_]/g, '');
        for (const key of rowKeys) {
          const keyNormalized = key.toLowerCase().trim().replace(/[\s_]/g, '');
          if (keyNormalized === nameNormalized) {
            const val = row[key];
            if (val !== undefined && val !== null) {
              const trimmed = String(val).trim();
              return trimmed;
            }
          }
        }
      }
      
      return '';
    };
    
    console.log('🔧 Testing getField:');
    const nameEn = getField(firstRow, ['Name_En']);
    const nameMr = getField(firstRow, ['Name_Mr']);
    const genderEn = getField(firstRow, ['Gender_En']);
    const genderMr = getField(firstRow, ['Gender_Mr']);
    
    console.log('getField(Name_En):', nameEn);
    console.log('getField(Name_Mr):', nameMr);
    console.log('getField(Gender_En):', genderEn);
    console.log('getField(Gender_Mr):', genderMr);
    console.log('');
    
    // Test final output
    console.log('📊 Final output simulation:');
    const hasEnglish = nameEn && nameEn.trim() !== '';
    const hasMarathi = nameMr && nameMr.trim() !== '';
    
    let name, name_mr;
    if (hasEnglish) {
      name = nameEn.trim();
    } else {
      name = '';
    }
    
    if (hasMarathi) {
      name_mr = nameMr.trim();
    } else {
      name_mr = '';
    }
    
    console.log('name:', name);
    console.log('name_mr:', name_mr);
    console.log('gender:', genderEn || '');
    console.log('gender_mr:', genderMr || '');
    
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

