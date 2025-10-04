import { AIService } from '../aiService';

export interface GenerationRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  objectiveCount?: number;
  sectionCount?: number;
  textDensity?: 'minimal' | 'moderate' | 'detailed';
  includeImages?: boolean;
  visualOptions?: {
    textDensity: string;
    includeIllustrations: boolean;
    includeDiagrams: boolean;
    includeInteractiveElements: boolean;
    includeColorCoding: boolean;
    creativityLevel: string;
  };
  specialRequirements?: string[];
  timeConstraint?: 'fast' | 'standard' | 'comprehensive';
  targetAudience?: string;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  difficultyLevel?: 'basic' | 'intermediate' | 'advanced' | 'mixed';
}

export interface GenerationStrategy {
  engine: 'simple' | 'comprehensive' | 'specialized' | 'hybrid';
  promptingApproach: 'single-shot' | 'multi-stage' | 'iterative' | 'chain-of-thought';
  visualStrategy: 'none' | 'minimal' | 'moderate' | 'heavy' | 'dominant';
  imageGeneration: 'none' | 'search-only' | 'ai-generated' | 'hybrid' | 'custom';
  contentStructure: 'linear' | 'modular' | 'branching' | 'adaptive';
  qualityLevel: 'draft' | 'standard' | 'premium' | 'publication-ready';
  processingSteps: string[];
  estimatedDuration: number; // in seconds
  resourceIntensity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface AIDecision {
  strategy: GenerationStrategy;
  reasoning: string;
  alternativeStrategies: GenerationStrategy[];
  confidenceScore: number;
  potentialChallenges: string[];
  recommendations: string[];
  customPrompts?: {
    contentGeneration?: string;
    imageGeneration?: string;
    qualityAssurance?: string;
    postProcessing?: string;
  };
}

/**
 * AI-powered decision engine that intelligently chooses generation strategies
 * based on input characteristics, using GPT's reasoning capabilities.
 */
export class AIDecisionEngine {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Analyze the generation request and decide on optimal strategy
   */
  async analyzeAndDecide(request: GenerationRequest): Promise<AIDecision> {
    console.log('🧠 [AI Decision Engine] Analyzing generation request...');
    
    const analysisPrompt = this.buildAnalysisPrompt(request);
    
    try {
      const response = await this.aiService.generateCompletion(analysisPrompt, 'gpt-4', {
        temperature: 0.3, // Lower temperature for more consistent decision-making
        maxTokens: 2000
      });

      const decision = this.parseDecisionResponse(response.content);
      
      console.log('✅ [AI Decision Engine] Strategy decision completed');
      console.log(`📋 [AI Decision Engine] Chosen strategy: ${decision.strategy.engine} with ${decision.strategy.promptingApproach} prompting`);
      console.log(`🎯 [AI Decision Engine] Confidence: ${decision.confidenceScore}%`);
      
      return decision;
    } catch (error) {
      console.error('❌ [AI Decision Engine] Failed to analyze request:', error);
      
      // Fallback to rule-based decision
      return this.fallbackDecision(request);
    }
  }

  /**
   * Build the analysis prompt for GPT to make strategic decisions
   */
  private buildAnalysisPrompt(request: GenerationRequest): string {
    return `You are an expert educational content generation strategist. Analyze this workbook generation request and determine the optimal generation strategy.

REQUEST DETAILS:
- Topic: "${request.topic}"
- Subject: ${request.subject}
- Grade Level: ${request.gradeLevel}
- Objective Count: ${request.objectiveCount || 'unspecified'}
- Section Count: ${request.sectionCount || 'unspecified'}
- Text Density: ${request.textDensity || 'unspecified'}
- Include Images: ${request.includeImages || false}
- Visual Options: ${JSON.stringify(request.visualOptions || {}, null, 2)}
- Special Requirements: ${request.specialRequirements?.join(', ') || 'none'}
- Time Constraint: ${request.timeConstraint || 'standard'}
- Target Audience: ${request.targetAudience || 'standard students'}
- Learning Style: ${request.learningStyle || 'mixed'}
- Difficulty Level: ${request.difficultyLevel || 'appropriate for grade'}

AVAILABLE GENERATION ENGINES:
1. SIMPLE ENGINE
   - Fast, lightweight generation
   - Single AI call with structured prompt
   - Basic image integration
   - Good for: Quick content, simple topics, time-constrained requests
   
2. COMPREHENSIVE ENGINE  
   - Multi-stage pipeline with specialized steps
   - Topic analysis, learning objectives, detailed content generation
   - Advanced image generation and integration
   - Quality validation and optimization
   - Good for: Complex topics, high-quality requirements, detailed content

3. SPECIALIZED ENGINE
   - Domain-specific optimizations (STEM, Language Arts, etc.)
   - Custom prompting strategies per subject
   - Advanced visual content for specific subjects
   - Good for: Subject-specific requirements, advanced topics

4. HYBRID ENGINE
   - Combines multiple approaches strategically
   - Adapts based on content complexity
   - Good for: Mixed complexity, varied section requirements

PROMPTING APPROACHES:
- single-shot: One comprehensive prompt
- multi-stage: Break into sequential prompts
- iterative: Refine through multiple iterations  
- chain-of-thought: Step-by-step reasoning prompts

VISUAL STRATEGIES:
- none: Text-only content
- minimal: Few strategic images
- moderate: Balanced text and visuals
- heavy: Image-dominant content
- dominant: Primarily visual with minimal text

IMAGE GENERATION OPTIONS:
- none: No images
- search-only: Use educational image search
- ai-generated: Create custom images with DALL-E
- hybrid: Mix of search and AI generation
- custom: Specialized image generation approach

ANALYZE THE REQUEST AND PROVIDE YOUR STRATEGIC DECISION:

Consider these factors:
1. Topic complexity and abstract vs concrete nature
2. Grade level cognitive capabilities
3. Subject domain requirements
4. Visual learning needs
5. Time and resource constraints
6. Quality expectations
7. Scalability requirements

Respond in this exact JSON format:
{
  "strategy": {
    "engine": "simple|comprehensive|specialized|hybrid",
    "promptingApproach": "single-shot|multi-stage|iterative|chain-of-thought",
    "visualStrategy": "none|minimal|moderate|heavy|dominant",
    "imageGeneration": "none|search-only|ai-generated|hybrid|custom",
    "contentStructure": "linear|modular|branching|adaptive",
    "qualityLevel": "draft|standard|premium|publication-ready",
    "processingSteps": ["step1", "step2", "step3"],
    "estimatedDuration": 120,
    "resourceIntensity": "low|medium|high|extreme"
  },
  "reasoning": "Detailed explanation of why this strategy is optimal for this request...",
  "alternativeStrategies": [
    {
      "engine": "alternative_option",
      "reasoning": "Why this could also work..."
    }
  ],
  "confidenceScore": 85,
  "potentialChallenges": ["challenge1", "challenge2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "customPrompts": {
    "contentGeneration": "Custom prompt if needed...",
    "imageGeneration": "Custom image prompt if needed...",
    "qualityAssurance": "Custom QA prompt if needed..."
  }
}`;
  }

  /**
   * Parse the AI decision response
   */
  private parseDecisionResponse(content: string): AIDecision {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const decision = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!decision.strategy || !decision.reasoning) {
        throw new Error('Invalid decision format');
      }

      return decision;
    } catch (error) {
      console.error('Failed to parse AI decision:', error);
      throw error;
    }
  }

  /**
   * Fallback decision logic if AI analysis fails
   */
  private fallbackDecision(request: GenerationRequest): AIDecision {
    console.log('🔄 [AI Decision Engine] Using fallback decision logic');
    
    // Simple rule-based fallback
    const isSimpleTopic = this.isSimpleTopic(request.topic, request.subject);
    const isQuickRequest = request.timeConstraint === 'fast';
    const needsVisuals = request.includeImages || request.visualOptions?.includeIllustrations;

    return {
      strategy: {
        engine: isSimpleTopic || isQuickRequest ? 'simple' : 'comprehensive',
        promptingApproach: isSimpleTopic ? 'single-shot' : 'multi-stage',
        visualStrategy: needsVisuals ? 'moderate' : 'minimal',
        imageGeneration: needsVisuals ? 'hybrid' : 'none',
        contentStructure: 'linear',
        qualityLevel: 'standard',
        processingSteps: ['content_generation', 'formatting', 'validation'],
        estimatedDuration: isQuickRequest ? 60 : 180,
        resourceIntensity: 'medium'
      },
      reasoning: 'Fallback decision based on basic rules due to AI analysis failure',
      alternativeStrategies: [],
      confidenceScore: 60,
      potentialChallenges: ['AI analysis unavailable'],
      recommendations: ['Monitor AI service availability']
    };
  }

  /**
   * Simple heuristic to determine topic complexity
   */
  private isSimpleTopic(topic: string, subject: string): boolean {
    const simpleConcepts = [
      'colors', 'shapes', 'numbers', 'letters', 'animals', 'family', 'food',
      'weather', 'seasons', 'days', 'months', 'basic math', 'counting'
    ];
    
    const complexSubjects = ['chemistry', 'physics', 'calculus', 'organic chemistry'];
    
    return simpleConcepts.some(concept => 
      topic.toLowerCase().includes(concept)
    ) && !complexSubjects.includes(subject.toLowerCase());
  }

  /**
   * Get strategy recommendations for scale optimization
   */
  async getScaleOptimizations(requests: GenerationRequest[]): Promise<{
    batchStrategy: string;
    resourceOptimization: string[];
    parallelization: string[];
    caching: string[];
  }> {
    const scalePrompt = `Analyze these ${requests.length} content generation requests and recommend optimization strategies for large-scale processing:

REQUESTS SUMMARY:
${requests.map((req, i) => `${i + 1}. ${req.topic} (${req.subject}, ${req.gradeLevel})`).join('\n')}

Provide optimization recommendations for:
1. Batch processing strategy
2. Resource optimization opportunities  
3. Parallelization possibilities
4. Caching strategies

Respond in JSON format with specific recommendations.`;

    try {
      const response = await this.aiService.generateCompletion(scalePrompt, 'gpt-4', {
        temperature: 0.2
      });

      return JSON.parse(response.content);
    } catch (error) {
      console.error('Failed to get scale optimizations:', error);
      return {
        batchStrategy: 'sequential',
        resourceOptimization: ['standard'],
        parallelization: ['none'],
        caching: ['basic']
      };
    }
  }
}