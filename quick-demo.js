// Quick demo of transliteration
import { processVoterName, processGender } from './utils/transliteration.js';

console.log('🔄 Marathi → English Transliteration Demo\n');
console.log('='.repeat(60));

const examples = [
  { name: 'भडकवाड मिना दादा', gender: 'स्त्री' },
  { name: 'विशाल कुमार', gender: 'पुरुष' },
  { name: 'वाघमारे सुदन किसन', gender: 'पुरुष' },
  { name: 'बनरा चंदमुनी पथमारा', gender: 'स्त्री' },
];

examples.forEach((ex, i) => {
  const { nameEnglish, nameMarathi } = processVoterName(ex.name);
  const { genderEnglish, genderMarathi } = processGender(ex.gender);
  
  console.log(`\n${i + 1}. ORIGINAL (Marathi):`);
  console.log(`   Name:   ${nameMarathi}`);
  console.log(`   Gender: ${genderMarathi}`);
  
  console.log(`\n   TRANSLATED (English):`);
  console.log(`   Name:   ${nameEnglish} ✅`);
  console.log(`   Gender: ${genderEnglish} ✅`);
  console.log('   ' + '-'.repeat(50));
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 This is what will be stored in database:');
console.log('   • name = English (transliterated)');
console.log('   • name_mr = Marathi (original)');
console.log('   • gender = English (Male/Female)');
console.log('   • gender_mr = Marathi (पुरुष/स्त्री)\n');



