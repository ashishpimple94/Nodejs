import XLSX from 'xlsx';

// Read Excel file
const workbook = XLSX.readFile('sample-voter-data-50000.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log('Total rows found:', jsonData.length);
console.log('\n=== First 3 rows from Excel ===');
console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));

console.log('\n=== Column names in first row ===');
console.log('Keys:', Object.keys(jsonData[0]));

// Transform data (same logic as controller)
const voterDataArray = jsonData.slice(0, 5).map((row, index) => {
  if (!row || typeof row !== 'object') return null;

  const transformedRow = {
    serialNumber: row['अनु क्र.'] || row['Serial Number'] || row['अनु.क्र.'] || '',
    houseNumber: row['घर क्र.'] || row['House Number'] || row['घर क्र'] || '',
    name: row['नाव'] || row['नाम'] || row['Name'] || `Unknown_${index}`,
    gender: row['लिंग'] || row['Gender'] || '',
    age: parseInt(row['वय'] || row['Age'] || 0) || 0,
    voterIdCard: row['मतदान कार्ड क्र.'] || row['Voter ID'] || row['मतदार ओळखपत्र'] || '',
    mobileNumber: row['मोबाईल नं.'] || row['Mobile Number'] || row['मोबाईल'] || '',
  };

  return transformedRow;
}).filter(row => row !== null);

console.log('\n=== Transformed data (first 5 rows) ===');
console.log(JSON.stringify(voterDataArray, null, 2));

console.log('\n=== Testing field mapping ===');
const firstRow = jsonData[0];
console.log('Original row:', firstRow);
console.log('\nField mappings:');
console.log('serialNumber:', firstRow['अनु क्र.']);
console.log('houseNumber:', firstRow['घर क्र.']);
console.log('name:', firstRow['नाव']);
console.log('gender:', firstRow['लिंग']);
console.log('age:', firstRow['वय']);
console.log('voterIdCard:', firstRow['मतदान कार्ड क्र.']);
console.log('mobileNumber:', firstRow['मोबाईल नं.']);
