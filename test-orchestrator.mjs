// Test the ContentGenerationOrchestrator directly
import { ContentGenerationOrchestrator } from './src/services/contentGenerationOrchestrator.js';

async function testOrchestrator() {
  console.log('🧪 Testing ContentGenerationOrchestrator...');
  
  try {
    const orchestrator = new ContentGenerationOrchestrator();
    console.log('✅ Orchestrator created successfully');
    
    // Test with simple math topic
    const testRequest = {
      topic: 'Basic Addition',
      gradeBand: 'k-2',
      subjectDomain: 'mathematics',
      options: {
        objectiveCount: 2,
        sectionCount: 2,
        includeExercises: true,
        includeMisconceptions: false,
        difficulty: 'basic'
      }
    };
    
    console.log('🚀 Starting generation with request:', testRequest);
    
    const pipeline = await orchestrator.startGeneration(testRequest);
    
    console.log('📊 Pipeline completed with state:', pipeline.state);
    console.log('🎯 Learning objectives:', pipeline.context.artifacts.learningObjectives?.length || 0);
    console.log('📝 Sections:', pipeline.context.artifacts.sections?.length || 0);
    
    if (pipeline.state === 'completed') {
      console.log('✅ SUCCESS: Orchestrator is working correctly!');
      console.log('📋 Sample objective:', pipeline.context.artifacts.learningObjectives?.[0]?.description);
    } else {
      console.log('⚠️  Pipeline state:', pipeline.state);
      console.log('📋 Context errors:', pipeline.context.errors);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testOrchestrator();