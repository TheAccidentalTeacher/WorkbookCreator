import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SimpleGenerationEngine } from '../../../services/simpleGenerationEngine';

const ExportRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  gradeBand: z.enum(['k-2', '3-5', '6-8', '9-10', '11-12', 'adult']),
  domain: z.enum(['mathematics', 'science', 'english_language_arts', 'social_studies', 'history', 'geography', 'art', 'music', 'physical_education', 'computer_science', 'foreign_language', 'other']),
  textDensity: z.enum(['minimal', 'moderate', 'text-heavy']).default('minimal'),
  visualOptions: z.object({
    includeIllustrations: z.boolean().default(true),
    includeDiagrams: z.boolean().default(true),
    includeInteractiveElements: z.boolean().default(true),
    includeColorCoding: z.boolean().default(true),
    creativityLevel: z.enum(['standard', 'high', 'maximum']).default('high')
  }).default({
    includeIllustrations: true,
    includeDiagrams: true,
    includeInteractiveElements: true,
    includeColorCoding: true,
    creativityLevel: 'high'
  }),
  sectionCount: z.number().min(1).max(20).default(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 [API] Export prompts request:', body);

    // Validate the request
    const validatedData = ExportRequestSchema.parse(body);
    console.log('✅ [API] Export request validation successful');
    
    // Create SimpleGenerationEngine instance
    const simpleEngine = new SimpleGenerationEngine();
    
    const promptRequest = {
      topic: validatedData.topic,
      subject: validatedData.domain,
      gradeLevel: validatedData.gradeBand,
      pageCount: Math.max(3, validatedData.sectionCount + 1),
      textDensity: validatedData.textDensity,
      visualOptions: {
        textDensity: validatedData.textDensity,
        ...validatedData.visualOptions
      }
    };

    console.log('⚡ [API] Generating prompts...');
    const prompts = simpleEngine.generatePrompts(promptRequest);
    
    // Create formatted prompt text
    const promptText = `# Educational Workbook Generation Prompts
Generated: ${new Date().toISOString()}
Topic: ${validatedData.topic}
Grade: ${validatedData.gradeBand}
Subject: ${validatedData.domain}

## Main Generation Prompt:
${prompts.workbookPrompt}

${prompts.imagePrompts && prompts.imagePrompts.length > 0 ? `
## Image Generation Prompts:
${prompts.imagePrompts.map((prompt, i) => `
### Image ${i + 1}:
${prompt}
`).join('')}
` : ''}

## Instructions for Use:
1. Copy the main prompt and paste it into ChatGPT, Claude, or another AI tool
2. Review and refine the generated content as needed
3. Use the image prompts with DALL-E, Midjourney, or similar image AI tools
4. Combine the text and images to create your final workbook

Generated with Simple Generation Engine
`;

    console.log('✅ [API] Prompts generated successfully');
    
    return NextResponse.json({
      success: true,
      promptText,
      filename: `workbook-prompts-${validatedData.topic.replace(/[^a-zA-Z0-9]/g, '-')}-${validatedData.gradeBand}.txt`,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('💥 [API] Error in export prompts endpoint:', errorMessage);

    return NextResponse.json(
      { 
        error: errorMessage || 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: 'POST /api/export-prompts',
    description: 'Export prompts for manual use in other AI tools'
  });
}