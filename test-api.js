import fetch from 'node-fetch';

async function testGeneration() {
  console.log('Testing workbook generation...');
  
  const testData = {
    topic: 'Basic Addition',
    gradeBand: 'k-2',
    domain: 'mathematics',
    objectiveCount: 2,
    sectionCount: 2,
    includeExercises: true,
    includeMisconceptions: false,
    difficulty: 'basic'
  };

  try {
    const response = await fetch('http://localhost:3000/api/generate-workbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Generation successful!');
      console.log('Workbook:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Generation failed:');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testGeneration();