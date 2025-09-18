import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ContentGenerationOrchestrator } from '../../../services/contentGenerationOrchestrator';

const GenerationRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  gradeBand: z.enum(['k-2', '3-5', '6-8', '9-10', '11-12', 'adult']),
  domain: z.enum(['mathematics', 'science', 'english_language_arts', 'social_studies', 'history', 'geography', 'art', 'music', 'physical_education', 'computer_science', 'foreign_language', 'other']),
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
    
    // Initialize the orchestrator
    const orchestrator = new ContentGenerationOrchestrator();
    console.log('🎭 [API] ContentGenerationOrchestrator initialized');
    
    // Generate the workbook
    console.log('⚡ [API] Starting workbook generation pipeline...');
    const pipeline = await orchestrator.startGeneration({
      topic: validatedData.topic,
      gradeBand: validatedData.gradeBand,
      subjectDomain: validatedData.domain,
      options: {
        objectiveCount: validatedData.objectiveCount,
        sectionCount: validatedData.sectionCount,
        includeExercises: validatedData.includeExercises,
        includeMisconceptions: validatedData.includeMisconceptions,
        difficulty: validatedData.difficulty,
      }
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ [API] Pipeline execution completed in ${duration}ms`);
    console.log('📊 [API] Pipeline state:', pipeline.state);
    console.log('📋 [API] Completed steps:', `${pipeline.currentStepIndex}/${pipeline.steps.length}`);

    if (pipeline.state === 'error') {
      console.error('❌ [API] Workbook generation failed:', pipeline.error);
      return NextResponse.json(
        { 
          error: pipeline.error || 'Generation failed',
          debug: {
            duration,
            completedSteps: pipeline.currentStepIndex,
            totalSteps: pipeline.steps.length,
            failedStep: pipeline.steps[pipeline.currentStepIndex]?.name
          }
        },
        { status: 500 }
      );
    }

    // Check if workbook was actually generated
    if (!pipeline.context.artifacts.workbook) {
      console.error('❌ [API] No workbook artifact generated');
      return NextResponse.json(
        { 
          error: 'Workbook generation completed but no workbook data was produced',
          debug: {
            duration,
            completedSteps: pipeline.currentStepIndex,
            totalSteps: pipeline.steps.length,
            availableArtifacts: Object.keys(pipeline.context.artifacts),
            pipelineState: pipeline.state
          }
        },
        { status: 500 }
      );
    }

    console.log('🎉 [API] Workbook generation completed successfully');
    console.log('📚 [API] Available artifacts:', Object.keys(pipeline.context.artifacts));
    console.log('📚 [API] Workbook data available:', !!pipeline.context.artifacts.workbook);
    
    const response = {
      success: true,
      workbook: pipeline.context.artifacts.workbook,
      pipeline: {
        id: pipeline.workbookId,
        state: pipeline.state,
        completedSteps: pipeline.currentStepIndex,
        totalSteps: pipeline.steps.length,
        duration
      },
      debug: {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration,
        memoryUsage: process.memoryUsage ? {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        } : undefined
      }
    };

    console.log('📤 [API] Sending response with workbook data');
    return NextResponse.json(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 [API] Error in workbook generation endpoint:', error);
    
    if (error instanceof z.ZodError) {
      console.error('📝 [API] Validation errors:', error.issues);
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
          debug: { duration, validationErrors: error.issues }
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('🔍 [API] Error details:', {
      message: errorMessage,
      stack: errorStack,
      duration
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: { 
          duration, 
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoints: {
      generate: 'POST /api/generate-workbook'
    }
  });
}