// Test the visual fraction integration

async function testVisualFractionGeneration() {
  console.log('🧪 Testing visual fraction workbook generation...');
  
  const testData = {
    topic: "Understanding Fractions",
    gradeBand: "3-5",
    domain: "mathematics",
    objectiveCount: 3,
    sectionCount: 2,
    includeExercises: true,
    includeMisconceptions: false,
    difficulty: "basic"
  };

  try {
    console.log('📤 Sending request to generate fraction workbook...');
    const response = await fetch('http://localhost:3001/api/generate-workbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Workbook generation completed!');
    console.log('📊 Result summary:');
    console.log(`- Title: ${result.title}`);
    console.log(`- Sections: ${result.sections?.length || 0}`);
    
    // Check if any exercises contain visual data
    let hasVisualExercises = false;
    result.sections?.forEach((section, sIndex) => {
      section.exercises?.forEach((exercise, eIndex) => {
        if (exercise.visualData) {
          hasVisualExercises = true;
          console.log(`🎨 Visual exercise found in section ${sIndex + 1}, exercise ${eIndex + 1}:`);
          console.log(`   Type: ${exercise.visualData.visual_type}`);
          console.log(`   Shape: ${exercise.visualData.shape}`);
          console.log(`   Fraction: ${exercise.visualData.shaded_parts}/${exercise.visualData.total_parts}`);
          console.log(`   Prompt: ${exercise.prompt}`);
        }
      });
    });

    if (hasVisualExercises) {
      console.log('🎉 SUCCESS: Visual fraction exercises detected!');
    } else {
      console.log('⚠️  WARNING: No visual exercises found. Traditional text exercises may be used.');
      
      // Show first few exercises for debugging
      console.log('\n📝 Sample exercises:');
      result.sections?.slice(0, 1).forEach((section) => {
        section.exercises?.slice(0, 2).forEach((exercise, index) => {
          console.log(`${index + 1}. ${exercise.prompt}`);
          console.log(`   Answer: ${exercise.correctAnswer}`);
          console.log(`   Type: ${exercise.type}`);
        });
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
testVisualFractionGeneration()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });