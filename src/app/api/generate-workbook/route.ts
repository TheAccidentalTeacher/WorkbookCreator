import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ContentGenerationOrchestrator } from '@/services/contentGenerationOrchestrator';
import { SimpleGenerationEngine, SimpleWorkbookSection } from '@/services/simpleGenerationEngine';

const GenerationRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  gradeBand: z.enum(['k-2', '3-5', '6-8', '9-10', '11-12', 'adult']),
  domain: z.enum(['mathematics', 'science', 'english_language_arts', 'social_studies', 'history', 'geography', 'art', 'music', 'physical_education', 'computer_science', 'foreign_language', 'other']),
  generationMode: z.enum(['quick', 'comprehensive']).default('comprehensive'),
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
  objectiveCount: z.number().min(1).max(20).default(5),
  sectionCount: z.number().min(1).max(20).default(5),
  includeExercises: z.boolean().default(true),
  includeMisconceptions: z.boolean().default(true),
  difficulty: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [API] Workbook generation request received at', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('📥 [API] Request data:', {
      topic: body.topic,
      gradeBand: body.gradeBand,
      domain: body.domain,
      options: {
        objectiveCount: body.objectiveCount,
        sectionCount: body.sectionCount,
        includeExercises: body.includeExercises,
        includeMisconceptions: body.includeMisconceptions
      }
    });

    // Validate the request
    const validatedData = GenerationRequestSchema.parse(body);
    console.log('✅ [API] Request validation successful');
    console.log('🚀 [API] Generation Mode:', validatedData.generationMode);
    
    let workbook;
    let duration;
    
    if (validatedData.generationMode === 'quick') {
      // Use SimpleGenerationEngine for quick mode
      console.log('⚡ [API] Using Quick Mode - SimpleGenerationEngine');
      const simpleEngine = new SimpleGenerationEngine();
      
      const quickRequest = {
        topic: validatedData.topic,
        subject: validatedData.domain,
        gradeLevel: validatedData.gradeBand,
        pageCount: Math.max(3, validatedData.sectionCount + 1),
        textDensity: validatedData.textDensity,
        visualOptions: {
          textDensity: validatedData.textDensity,
          ...validatedData.visualOptions
        },
        includeImages: validatedData.visualOptions.includeIllustrations || validatedData.visualOptions.includeDiagrams,
        fastMode: false // Allow images in quick mode
      };
      
      console.log('🔍 [DEBUG] Quick Request Object:', JSON.stringify(quickRequest, null, 2));
      console.log('🔍 [DEBUG] Visual Options:', JSON.stringify(validatedData.visualOptions, null, 2));
      
      console.log('⚡ [API] Starting quick workbook generation...');
      const quickResult = await simpleEngine.generateWorkbook(quickRequest);
      duration = Date.now() - startTime;
      
      // Transform simple engine result to match expected format with image data preservation
      workbook = {
        id: quickResult.id,
        title: quickResult.title,
        topic: quickResult.topic,
        learningObjectives: [], // SimpleWorkbook doesn't have learning objectives separate from sections
        sections: quickResult.sections.map((section: SimpleWorkbookSection) => {
          // Convert SimpleWorkbookSection to comprehensive WorkbookSection format
          interface ConvertedSection {
            title: string;
            conceptExplanation: string;
            examples: string[];
            keyTerms: string[];
            summary: string;
            exercises: {
              type: string;
              prompt: string;
              options?: string[];
              correctAnswer: string;
              explanation: string;
            }[];
            __imageData?: {
              url: string;
              localPath?: string;
              base64Data?: string;
              description: string;
              placement: 'header' | 'inline';
            }[];
          }
          
          const convertedSection: ConvertedSection = {
            title: section.title,
            conceptExplanation: section.content, // Map content to conceptExplanation
            examples: [], // SimpleWorkbook doesn't separate examples
            keyTerms: [], // SimpleWorkbook doesn't separate key terms
            summary: '', // SimpleWorkbook doesn't have separate summary
            exercises: section.exercises.map((exercise: {
              type: 'multiple_choice' | 'fill_blank' | 'short_answer' | 'drawing';
              question: string;
              options?: string[];
              answer: string;
              explanation?: string;
            }) => ({
              type: exercise.type,
              prompt: exercise.question, // Map question to prompt
              options: exercise.options,
              correctAnswer: exercise.answer, // Map answer to correctAnswer
              explanation: exercise.explanation || ''
            }))
          };

          // If the section has images with base64Data, embed them into the conceptExplanation
          if (section.images && section.images.length > 0) {
            console.log(`🎨 [API] Processing ${section.images.length} images for section: ${section.title}`);
            
            // Add image placeholders that our PDF generator can find and replace
            const imageReferences = section.images.map((image: {
              url: string;
              localPath?: string;
              base64Data?: string;
              description: string;
              placement: 'header' | 'inline';
            }, index: number) => {
              return `[IMAGE_${index}: ${image.description}]`;
            }).join('\n\n');

            // Prepend image references to the concept explanation
            convertedSection.conceptExplanation = imageReferences + '\n\n' + section.content;

            // Store the actual image data in a way our PDF generator can access
            convertedSection.__imageData = section.images;
          }

          return convertedSection;
        }),
        metadata: {
          topic: validatedData.topic,
          gradeBand: validatedData.gradeBand,
          domain: validatedData.domain,
          generatedAt: quickResult.generatedAt.toISOString(),
          generationTime: quickResult.generationTime,
          generationMode: 'quick',
          estimatedCost: `$${quickResult.metadata.cost.toFixed(2)}`,
          apiCalls: quickResult.metadata.apiCalls,
          __hasImages: quickResult.sections.some((s: SimpleWorkbookSection) => s.images && s.images.length > 0)
        }
      };
      
      console.log(`⚡ [API] Quick generation completed in ${duration}ms`);
      
    } else {
      // Use original comprehensive mode
      console.log('🔬 [API] Using Comprehensive Mode - ContentGenerationOrchestrator');
      const orchestrator = new ContentGenerationOrchestrator();
      console.log('🎭 [API] ContentGenerationOrchestrator initialized');
      
      // Generate the workbook using original system
      console.log('⚡ [API] Starting comprehensive workbook generation...');
      const pipeline = await orchestrator.startGeneration({
        topic: validatedData.topic,
        gradeBand: validatedData.gradeBand,
        subjectDomain: validatedData.domain,
        textDensity: validatedData.textDensity,
        visualOptions: {
          textDensity: validatedData.textDensity,
          ...validatedData.visualOptions
        },
        options: {
          objectiveCount: validatedData.objectiveCount,
          sectionCount: validatedData.sectionCount,
          includeExercises: validatedData.includeExercises,
          includeMisconceptions: validatedData.includeMisconceptions,
          difficulty: validatedData.difficulty
        }
      });

      duration = Date.now() - startTime;
      console.log(`⏱️ [API] Comprehensive generation completed in ${duration}ms`);
      console.log('📋 [API] Pipeline state:', pipeline.state);

      // Extract the workbook from the pipeline context
      workbook = pipeline.context.artifacts.workbook || {
        id: pipeline.workbookId,
        title: `${validatedData.topic} - Grade ${validatedData.gradeBand}`,
        topic: validatedData.topic,
        learningObjectives: pipeline.context.artifacts.learningObjectives || [],
        sections: pipeline.context.artifacts.sections || [],
        metadata: {
          topic: validatedData.topic,
          gradeBand: validatedData.gradeBand,
          domain: validatedData.domain,
          generatedAt: new Date().toISOString(),
          generationTime: duration,
          generationMode: 'comprehensive',
          pipelineState: pipeline.state
        }
      };
    }

    const response = {
      success: true,
      workbook,
      duration,
      timestamp: new Date().toISOString()
    };

    console.log('✅ [API] Workbook generation completed successfully');
    return NextResponse.json(response);

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('💥 [API] Error in workbook generation endpoint:', errorMessage);
    console.error('🔍 [API] Error details:', {
      message: errorMessage,
      stack: errorStack,
      duration
    });

    return NextResponse.json(
      { 
        error: errorMessage || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        duration,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    version: 'Dual Mode System',
    modes: {
      quick: {
        description: 'Fast generation with SimpleGenerationEngine',
        performance: '30-60 seconds, ~$0.05, 1-2 API calls'
      },
      comprehensive: {
        description: 'Detailed generation with ContentGenerationOrchestrator',
        performance: '5+ minutes, $0.25-0.35, 10+ API calls'
      }
    },
    endpoints: {
      generate: 'POST /api/generate-workbook'
    },
    integration: 'OpenAI & Anthropic'
  });
}