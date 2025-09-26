import { NextRequest, NextResponse } from 'next/server';
import { ServerVisualWorksheetGenerator } from '@/services/ServerVisualWorksheetGenerator';

export async function POST(request: NextRequest) {
  try {
    const { type, title, gradeLevel, problemTypes } = await request.json();

    console.log('🎨 [Visual Demo API] Generating visual worksheet:', {
      type,
      title,
      gradeLevel,
      problemTypes
    });

    const generator = new ServerVisualWorksheetGenerator();
    
    // Generate HTML worksheet with embedded SVG graphics
    const htmlContent = await generator.generateVisualWorksheetHTML({
      type: type || 'identify',
      title: title || 'Visual Fraction Worksheet',
      gradeLevel: gradeLevel || 3,
      problemTypes: problemTypes || ['identify_fraction']
    });

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${type || 'visual'}-fractions-worksheet.html"`,
      },
    });

  } catch (error) {
    console.error('❌ [Visual Demo API] Error generating visual worksheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate visual worksheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}