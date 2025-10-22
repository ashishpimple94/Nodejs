import XLSX from 'xlsx';
import fs from 'fs';

// Sample names in Marathi
const maleNames = [
  'कुंडले सोमेश्री अभिजित',
  'अडगळे विशाल ईश्वर',
  'आवतगवाकर अरविनाश वामन',
  'रामसाहेब किसन',
  'पुरुषा रावसाहेब',
  'विशाल कुमार',
  'राजेश पाटील',
  'संजय देशमुख',
  'अनिल शर्मा',
  'सुरेश गुप्ता',
  'मनोज वर्मा',
  'प्रकाश यादव',
  'दिनेश सिंह',
  'विजय कुमार',
  'अशोक राव',
];

const femaleNames = [
  'अडगळे आरती ईश्वर',
  'अडगळे प्रियांका सचिन',
  'बनरा चंदमुनी पथमारा',
  'सुनीता पाटील',
  'अंजली देशमुख',
  'पूजा शर्मा',
  'नीता गुप्ता',
  'रेखा वर्मा',
  'कविता यादव',
  'मीना सिंह',
  'श्वेता कुमार',
  'प्रिया राव',
];

// Generate random data
const generateRandomData = (count) => {
  const data = [];

  for (let i = 1; i <= count; i++) {
    const gender = Math.random() > 0.5 ? 'पुरुष' : 'स्त्री';
    const names = gender === 'पुरुष' ? maleNames : femaleNames;
    const name = names[Math.floor(Math.random() * names.length)];
    const age = Math.floor(Math.random() * 60) + 18; // Age between 18-78
    const voterIdPrefix = 'WZS';
    const voterId = voterIdPrefix + Math.floor(Math.random() * 10000000 + 10000000);
    const hasMobile = Math.random() > 0.3; // 70% have mobile numbers
    const mobile = hasMobile ? '7' + Math.floor(Math.random() * 1000000000 + 1000000000) : '';
    
    // House number format
    const houseNum = Math.floor(Math.random() * 200) + 1;

    data.push({
      'अनु क्र.': `1/${i}`,
      'घर क्र.': houseNum.toString(),
      'नाव': name,
      'लिंग': gender,
      'वय': age,
      'मतदान कार्ड क्र.': voterId,
      'मोबाईल नं.': mobile,
    });
  }

  return data;
};

// Generate sample data
console.log('Generating sample Excel file...');
const recordCount = 50000; // 50,000 records
const sampleData = generateRandomData(recordCount);

// Create workbook
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'VoterData');

// Write to file
XLSX.writeFile(workbook, 'sample-voter-data-50000.xlsx');

console.log(`✅ Sample Excel file created successfully!`);
console.log(`📁 File: sample-voter-data-50000.xlsx`);
console.log(`📊 Records: ${recordCount}`);
console.log(`💾 Size: ${(fs.statSync('sample-voter-data-50000.xlsx').size / 1024 / 1024).toFixed(2)} MB`);

