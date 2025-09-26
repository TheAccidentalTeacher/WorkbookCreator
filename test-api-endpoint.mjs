const response = await fetch('http://localhost:3001/api/generate-workbook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'math',
    gradeBand: 'elementary',
    topic: 'addition',
    objectives: ['Students will be able to add single-digit numbers'],
    config: {
      enableMultipleChoice: true,
      enableShortAnswer: true,
      enableEssay: false,
      difficultyLevel: 'beginner'
    }
  })
});

const data = await response.json();
console.log('Response status:', response.status);
console.log('Response data:', JSON.stringify(data, null, 2));