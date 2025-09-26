import { NextRequest, NextResponse } from 'next/server';
import { Phase2TestingFramework } from '../../../tests/Phase2TestingFramework';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Phase 2 testing endpoint called');
    
    const testFramework = new Phase2TestingFramework();
    
    // Check if this is a quick health check or full test
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'full';
    
    if (testType === 'health') {
      const healthCheck = await testFramework.quickHealthCheck();
      return NextResponse.json({
        success: true,
        type: 'health_check',
        timestamp: new Date().toISOString(),
        result: healthCheck,
      });
    }
    
    // Run full Phase 2 tests
    const testReport = await testFramework.runAllTests();
    
    return NextResponse.json({
      success: true,
      type: 'full_test',
      timestamp: new Date().toISOString(),
      report: testReport,
    });
    
  } catch (error) {
    console.error('[API] Phase 2 testing failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Phase 2 testing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Phase 2 content generation endpoint called');
    
    const body = await request.json();
    
    // Extract worksheet request from body
    const worksheetRequest = {
      subject: body.subject || 'math',
      topic: body.topic || 'algebra basics',
      grade_level: body.grade_level || 8,
      difficulty: body.difficulty || 'medium',
      content_types: body.content_types || ['explanations'],
      include_visuals: body.include_visuals || false,
      worksheet_length: body.worksheet_length || 'short',
    };
    
    // Test content generation with the provided request
    const startTime = Date.now();
    
    // Since this is a test endpoint, we'll simulate content generation
    const mockResult = {
      request_id: `test_${Date.now()}`,
      content_sections: [
        {
          id: 'section_1',
          type: 'explanations',
          content: `# ${worksheetRequest.topic} Explanation

This is a sample explanation about ${worksheetRequest.topic} for grade ${worksheetRequest.grade_level} students.

## Key Concepts:
• Understanding the basics
• Practical applications
• Problem-solving strategies

## Example:
Consider the following scenario that demonstrates ${worksheetRequest.topic}...`,
          metadata: {
            source_service: 'TestService',
            generation_time: Date.now() - startTime,
            quality_score: 0.85,
            safety_approved: true,
          },
        },
      ],
      total_generation_time: Date.now() - startTime,
      services_used: ['TestService'],
      quality_metrics: {
        average_quality_score: 0.85,
        safety_compliance: true,
        content_coherence: 0.9,
      },
    };
    
    return NextResponse.json({
      success: true,
      request: worksheetRequest,
      result: mockResult,
      message: 'Content generation simulation completed successfully',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[API] Phase 2 content generation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Content generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}