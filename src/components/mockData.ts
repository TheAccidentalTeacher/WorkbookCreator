export const mockWorkbook = {
  id: 'wb_test_123',
  title: 'Introduction to Fractions',
  topic: 'Fractions',
  learningObjectives: [
    {
      text: 'Students will be able to identify the numerator and denominator in a fraction',
      bloomLevel: 'Remember',
      verb: 'identify'
    },
    {
      text: 'Students will be able to compare fractions with like denominators',
      bloomLevel: 'Analyze',
      verb: 'compare'
    },
    {
      text: 'Students will be able to create equivalent fractions',
      bloomLevel: 'Create',
      verb: 'create'
    }
  ],
  sections: [
    {
      title: 'What is a Fraction?',
      conceptExplanation: 'A fraction represents a part of a whole. It consists of two numbers: the numerator (top number) which tells us how many parts we have, and the denominator (bottom number) which tells us how many equal parts the whole is divided into.',
      examples: [
        '1/2 means 1 part out of 2 equal parts',
        '3/4 means 3 parts out of 4 equal parts',
        'If you have a pizza cut into 8 slices and eat 3 slices, you have eaten 3/8 of the pizza'
      ],
      keyTerms: [
        { term: 'Numerator', definition: 'The top number in a fraction that shows how many parts you have' },
        { term: 'Denominator', definition: 'The bottom number in a fraction that shows how many equal parts the whole is divided into' },
        { term: 'Fraction Bar', definition: 'The line between the numerator and denominator' }
      ],
      summary: 'Fractions are a way to represent parts of a whole, with the numerator showing how many parts we have and the denominator showing the total number of equal parts.',
      exercises: [
        {
          type: 'multiple_choice',
          prompt: 'In the fraction 3/5, what does the number 5 represent?',
          options: [
            'The number of parts we have',
            'The total number of equal parts',
            'The whole number',
            'The fraction bar'
          ],
          correctAnswer: 'The total number of equal parts',
          explanation: 'The denominator (bottom number) always represents the total number of equal parts the whole is divided into.',
          solution: {
            answer: 'The total number of equal parts',
            explanation: 'In any fraction, the denominator tells us how many equal parts make up one whole.',
            workingSteps: [
              'Identify the parts of the fraction 3/5',
              'The 3 is the numerator (top)',
              'The 5 is the denominator (bottom)',
              'The denominator represents the total equal parts'
            ]
          }
        },
        {
          type: 'fill_blank',
          prompt: 'Complete the sentence: In the fraction 7/9, the numerator is ___ and the denominator is ___.',
          correctAnswer: '7, 9',
          explanation: 'The numerator is always the top number (7) and the denominator is always the bottom number (9).'
        }
      ],
      misconceptions: [
        {
          description: 'Students think the bigger the denominator, the bigger the fraction',
          explanation: 'A larger denominator actually means the whole is divided into more parts, making each part smaller',
          correction: 'When comparing fractions with the same numerator, the fraction with the smaller denominator is actually larger (1/2 > 1/4)'
        }
      ]
    },
    {
      title: 'Comparing Fractions',
      conceptExplanation: 'When fractions have the same denominator, we can compare them by looking at their numerators. The fraction with the larger numerator represents more parts and is therefore larger.',
      examples: [
        '2/5 < 3/5 because 2 < 3',
        '7/8 > 5/8 because 7 > 5',
        '1/4 = 1/4 because they have the same numerator and denominator'
      ],
      keyTerms: [
        { term: 'Like denominators', definition: 'Fractions that have the same denominator' },
        { term: 'Greater than', definition: 'Symbol > used when the first fraction is larger' },
        { term: 'Less than', definition: 'Symbol < used when the first fraction is smaller' }
      ],
      summary: 'Fractions with like denominators can be compared by comparing their numerators.',
      exercises: [
        {
          type: 'multiple_choice',
          prompt: 'Which fraction is larger: 3/7 or 5/7?',
          options: ['3/7', '5/7', 'They are equal', 'Cannot determine'],
          correctAnswer: '5/7',
          explanation: 'Since both fractions have the same denominator (7), we compare the numerators. 5 > 3, so 5/7 > 3/7.'
        }
      ]
    }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    topicAnalysis: {
      domain: 'mathematics',
      complexity: 'elementary',
      prerequisites: ['counting', 'basic division concepts']
    },
    validation: {
      overallScore: 95,
      passed: true,
      details: ['All learning objectives met', 'Appropriate grade level', 'Clear explanations']
    }
  }
};