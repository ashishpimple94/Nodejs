// Test transliteration functionality
import { processVoterName, processGender } from './utils/transliteration.js';

console.log('🔤 Testing Transliteration...\n');

// Test names
const testNames = [
  'विशाल कुमार',
  'भडकवाड मिना दादा',
  'बनरा चंदमुनी पथमारा',
  'वाघमारे सुदन किसन'
];

console.log('📝 Name Transliteration:\n');
testNames.forEach(name => {
  const result = processVoterName(name);
  console.log(`Marathi:  ${name}`);
  console.log(`English:  ${result.nameEnglish}`);
  console.log('');
});

// Test genders
const testGenders = [
  'पुरुष',
  'स्त्री',
  'इतर'
];

console.log('\n👥 Gender Translation:\n');
testGenders.forEach(gender => {
  const result = processGender(gender);
  console.log(`Marathi:  ${gender}`);
  console.log(`English:  ${result.genderEnglish}`);
  console.log('');
});



