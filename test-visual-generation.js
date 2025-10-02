/**
 * Test script to validate visual content generation
 * Run with: node test-visual-generation.js
 */

const { SimpleGenerationEngine } = require('./src/services/simpleGenerationEngine');

async function testVisualGeneration() {
  console.log('🧪 Testing Visual Content Generation...\n');
  
  const engine = new SimpleGenerationEngine();
  
  // Test request similar to what user submitted
  const testRequest = {
    topic: "Cell Structure & Function",
    subject: "science", 
    gradeLevel: "6-8", // Corrected from k-2 to match user's original selection
    pageCount: 4,
    textDensity: "minimal", // This should trigger visual-heavy content
    visualOptions: {
      textDensity: "minimal",
      includeIllustrations: true,
      includeDiagrams: true, 
      includeInteractiveElements: true,
      includeColorCoding: true,
      creativityLevel: "high"
    },
    includeImages: true,
    fastMode: false
  };
  
  console.log('📥 Test Request:', JSON.stringify(testRequest, null, 2));
  console.log('\n🚀 Starting generation...\n');
  
  try {
    // Just test prompt generation first
    const prompts = engine.generatePrompts(testRequest);
    console.log('📝 Generated Workbook Prompt:');
    console.log('='.repeat(80));
    console.log(prompts.workbookPrompt);
    console.log('='.repeat(80));
    
    if (prompts.imagePrompts) {
      console.log('\n🎨 Generated Image Prompts:');
      prompts.imagePrompts.forEach((prompt, i) => {
        console.log(`${i + 1}. ${prompt}`);
      });
    }
    
    console.log('\n✅ Prompt generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testVisualGeneration();