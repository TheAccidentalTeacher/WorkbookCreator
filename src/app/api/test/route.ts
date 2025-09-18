import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/aiService';

export async function GET() {
  try {
    // Test basic AI service functionality
    const aiService = new AIService();
    
    const testPrompt = "Generate a simple learning objective for 5th grade mathematics about fractions.";
    
    const response = await aiService.generateCompletion(testPrompt, 'gpt-3.5-turbo', {
      temperature: 0.7,
      maxTokens: 100
    });
    
    return NextResponse.json({
      success: true,
      message: 'AI service is working!',
      test_response: response.content,
      model_used: response.model,
      tokens_used: response.tokenUsage,
      cost: response.cost
    });
    
  } catch (error) {
    console.error('AI service test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'AI service test failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, gradeBand } = body;
    
    if (!topic) {
      return NextResponse.json({
        success: false,
        error: 'Topic is required'
      }, { status: 400 });
    }
    
    // Test our topic processor
    const { TopicProcessor } = await import('@/services/topicProcessor');
    
    const analysis = await TopicProcessor.analyzeTopic(
      topic,
      gradeBand || '6-8'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Topic analysis complete',
      topic,
      gradeBand: gradeBand || '6-8',
      analysis
    });
    
  } catch (error) {
    console.error('Topic analysis test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Topic analysis test failed'
    }, { status: 500 });
  }
}