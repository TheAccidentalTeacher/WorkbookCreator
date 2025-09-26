import { NextRequest, NextResponse } from 'next/server';
import { VisualContentService } from '../../../services/visualContentService';

export async function GET() {
  try {
    // Test the visual content service
    const testData = {
      textDensity: 'minimal' as const,
      subject: 'mathematics' as const,
      gradeBand: 'k-2' as const,
      visualOptions: VisualContentService.getDefaultVisualOptions()
    };

    const visualPrompt = VisualContentService.generateVisualContentPrompt(
      testData.textDensity,
      testData.subject,
      testData.gradeBand,
      testData.visualOptions
    );

    const guidelines = VisualContentService.getVisualGuidelines(testData.textDensity);
    const template = VisualContentService.getSubjectTemplate(testData.subject);

    return NextResponse.json({
      success: true,
      testData,
      visualPrompt,
      guidelines,
      template,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, textDensity } = body;

    if (!content || !textDensity) {
      return NextResponse.json({
        success: false,
        error: 'Content and textDensity are required'
      }, { status: 400 });
    }

    const validation = VisualContentService.validateVisualContent(content, textDensity);

    return NextResponse.json({
      success: true,
      validation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}