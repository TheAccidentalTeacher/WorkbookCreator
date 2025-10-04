import { NextRequest, NextResponse } from 'next/server';
import { AIDecisionEngine } from '@/services/ai/AIDecisionEngine';

interface DemoRequest {
  topic: string;
  gradeBand: string;
  domain: string;
  options: {
    objectiveCount: number;
    sectionCount: number;
    includeExercises: boolean;
    includeMisconceptions: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: DemoRequest = await request.json();
    
    if (!body.topic || !body.gradeBand || !body.domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🎯 [AI Demo] Analyzing request:', {
      topic: body.topic,
      gradeBand: body.gradeBand,
      domain: body.domain
    });

    const aiDecisionEngine = new AIDecisionEngine();
    
    // Transform demo request to generation request format
    const generationRequest = {
      topic: body.topic,
      subject: body.domain,
      gradeLevel: body.gradeBand,
      objectiveCount: body.options.objectiveCount,
      sectionCount: body.options.sectionCount,
      textDensity: body.gradeBand === 'k-2' ? 'minimal' as const : 'moderate' as const,
      includeImages: true,
      visualOptions: {
        textDensity: body.gradeBand === 'k-2' ? 'minimal' : 'moderate',
        includeIllustrations: true,
        includeDiagrams: true,
        includeInteractiveElements: true,
        includeColorCoding: true,
        creativityLevel: 'high'
      }
    };
    
    const decision = await aiDecisionEngine.analyzeAndDecide(generationRequest);
    
    console.log('🧠 [AI Demo] Decision made:', {
      strategy: decision.strategy.engine,
      confidence: decision.confidenceScore,
      reasoningLength: decision.reasoning.length
    });

    // Format response for frontend
    const simplifiedDecision = {
      strategy: decision.strategy.engine,
      confidence: decision.confidenceScore,
      reasoning: decision.reasoning,
      parameters: {
        engine: decision.strategy.engine,
        visualStrategy: decision.strategy.visualStrategy,
        imageGeneration: decision.strategy.imageGeneration,
        qualityLevel: decision.strategy.qualityLevel,
        resourceIntensity: decision.strategy.resourceIntensity,
        estimatedDuration: `${decision.strategy.estimatedDuration}s`
      },
      fallback: decision.alternativeStrategies.length > 0 
        ? decision.alternativeStrategies[0].engine 
        : undefined
    };

    return NextResponse.json({
      success: true,
      decision: simplifiedDecision,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [AI Demo] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}