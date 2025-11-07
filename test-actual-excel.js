// Test actual Excel file to see field detection
import XLSX from 'xlsx';
import { isMarathiText } from './utils/transliteration.js';

const excelFile = '/Users/ashishpimple/Downloads/Voterlist(1) (1).xlsx';

console.log('📄 Reading Excel file:', excelFile);
console.log('');

try {
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('📋 Sheet name:', sheetName);
  console.log('');
  
  // Get data with first row as header
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 0, defval: '', raw: true });
  
  console.log('📊 Total rows:', jsonData.length);
  console.log('');
  
  if (jsonData.length > 0) {
    const firstRow = jsonData[0];
    const secondRow = jsonData[1];
    
    console.log('🔑 First row (header row):');
    console.log(JSON.stringify(firstRow, null, 2));
    console.log('');
    
    console.log('📝 Second row (first data row):');
    console.log(JSON.stringify(secondRow, null, 2));
    console.log('');
    
    // Check actual field names
    const headerRow = Object.keys(firstRow);
    console.log('📋 Actual column names in Excel:');
    headerRow.forEach((key, index) => {
      console.log(`  ${index + 1}. "${key}"`);
    });
    console.log('');
    
    // Test field detection
    console.log('🧪 Testing field detection:');
    const testRow = secondRow;
    
    console.log('SR_NO:', testRow['SR_NO']);
    console.log('House_No:', testRow['House_No']);
    console.log('Name_En:', testRow['Name_En']);
    console.log('Name_Mr:', testRow['Name_Mr']);
    console.log('Gender_En:', testRow['Gender_En']);
    console.log('Gender_Mr:', testRow['Gender_Mr']);
    console.log('Epic_id:', testRow['Epic_id']);
    console.log('Mobile_No:', testRow['Mobile_No']);
    console.log('Age:', testRow['Age']);
    console.log('');
    
    // Test isMarathiText
    console.log('🔍 Language detection:');
    console.log('Name_En is Marathi?', isMarathiText(testRow['Name_En'] || ''));
    console.log('Name_Mr is Marathi?', isMarathiText(testRow['Name_Mr'] || ''));
    console.log('Gender_En is Marathi?', isMarathiText(testRow['Gender_En'] || ''));
    console.log('Gender_Mr is Marathi?', isMarathiText(testRow['Gender_Mr'] || ''));
    console.log('');
    
    // Test getField logic
    console.log('🔧 Testing getField logic:');
    const normalizeKey = (key) =>
      key
        ? String(key)
            .trim()
            .toLowerCase()
            .replace(/[.\u0964:()\-_/]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        : '';
    
    const getField = (row, possibleNames) => {
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
    
    console.log('Testing Name_En:');
    const nameEn = getField(testRow, ['Name_En']);
    console.log('  Result:', nameEn);
    
    console.log('Testing Name_Mr:');
    const nameMr = getField(testRow, ['Name_Mr']);
    console.log('  Result:', nameMr);
    
    console.log('Testing Gender_En:');
    const genderEn = getField(testRow, ['Gender_En']);
    console.log('  Result:', genderEn);
    
    console.log('Testing Gender_Mr:');
    const genderMr = getField(testRow, ['Gender_Mr']);
    console.log('  Result:', genderMr);
    
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

