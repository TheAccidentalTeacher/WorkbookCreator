const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/generate-workbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'test math',
        gradeBand: '6-8',
        domain: 'mathematics',
        options: {
          objectiveCount: 3,
          sectionCount: 4,
          includeExercises: true,
          includeMisconceptions: true
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.text();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();