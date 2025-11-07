// Test search API
const testSearch = async () => {
  console.log('🔍 Testing Search API...\n');

  // Test 1: Marathi search
  console.log('Test 1: Marathi Search - "विशाल"');
  console.log('URL: http://localhost:5000/api/voters/search?query=विशाल\n');
  
  try {
    const response1 = await fetch('http://localhost:5000/api/voters/search?query=विशाल');
    const data1 = await response1.json();
    
    console.log('Response:');
    console.log(`  ✅ Success: ${data1.success}`);
    console.log(`  📝 Message: ${data1.message}`);
    console.log(`  🔤 Language: ${data1.searchLanguage}`);
    console.log(`  📊 Count: ${data1.count}`);
    
    if (data1.data && data1.data.length > 0) {
      console.log('\n  Sample Result:');
      const first = data1.data[0];
      console.log(`    Name: ${first.name}`);
      console.log(`    Gender: ${first.gender}`);
      console.log(`    Age: ${first.age}`);
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: English search (if exists)
  console.log('Test 2: Search - "kumar"');
  console.log('URL: http://localhost:5000/api/voters/search?query=kumar\n');
  
  try {
    const response2 = await fetch('http://localhost:5000/api/voters/search?query=kumar');
    const data2 = await response2.json();
    
    console.log('Response:');
    console.log(`  ✅ Success: ${data2.success}`);
    console.log(`  📝 Message: ${data2.message}`);
    console.log(`  🔤 Language: ${data2.searchLanguage}`);
    console.log(`  📊 Count: ${data2.count}`);
    
    if (data2.data && data2.data.length > 0) {
      console.log('\n  Sample Results:');
      data2.data.slice(0, 3).forEach((voter, i) => {
        console.log(`    ${i + 1}. ${voter.name} (Age: ${voter.age})`);
      });
    }
  } catch (error) {
    console.error('  ❌ Error:', error.message);
  }
};

testSearch();



