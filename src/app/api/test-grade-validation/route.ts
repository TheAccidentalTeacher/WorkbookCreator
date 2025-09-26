import { NextRequest, NextResponse } from 'next/server';
import { GradeLevelContentService } from '../../../services/gradeLevelContentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, gradeBand } = body;
    
    if (!content || !gradeBand) {
      return NextResponse.json({
        success: false,
        error: 'Content and gradeBand are required'
      }, { status: 400 });
    }
    
    // Test content validation
    const validation = GradeLevelContentService.validateContent(content, gradeBand);
    const guidelines = GradeLevelContentService.getGuidelines(gradeBand);
    const constraints = GradeLevelContentService.getContentConstraints(gradeBand);
    
    return NextResponse.json({
      success: true,
      validation,
      guidelines: {
        ageRange: guidelines.ageRange,
        vocabularyLevel: guidelines.vocabularyLevel,
        exerciseTypes: guidelines.exerciseTypes,
        instructionalApproaches: guidelines.instructionalApproaches
      },
      constraints
    });
    
  } catch (error) {
    console.error('Grade validation test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}