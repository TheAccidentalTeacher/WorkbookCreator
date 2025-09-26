/**
 * API Coordinator Service - Enhanced for Phase 2
 * Orchestrates multiple third-party APIs for content generation
 */

import { BaseAPIService } from './BaseAPIService';
import { EnhancedMathContentService, MathProblem } from './EnhancedMathContentService';
import { VertexAIService } from './VertexAIService';
import { VectorArtService, VectorArtResponse } from './VectorArtService';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface WorksheetRequest {
  subject: 'math' | 'science' | 'english' | 'social_studies';
  topic: string;
  grade_level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  content_types: ContentType[];
  include_visuals: boolean;
  worksheet_length: 'short' | 'medium' | 'long';
}

export type ContentType = 
  | 'problems' 
  | 'explanations' 
  | 'examples' 
  | 'diagrams' 
  | 'illustrations'
  | 'word_problems';

export interface GeneratedContent {
  id: string;
  type: ContentType;
  content: string;
  metadata: {
    source_service: string;
    generation_time: number;
    quality_score?: number;
    safety_approved: boolean;
  };
  visual_assets?: VectorArtResponse[];
}

export interface WorksheetGenerationResult {
  request_id: string;
  content_sections: GeneratedContent[];
  total_generation_time: number;
  services_used: string[];
  quality_metrics: {
    average_quality_score: number;
    safety_compliance: boolean;
    content_coherence: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface ServiceStatus {
  service_name: string;
  is_configured: boolean;
  is_healthy: boolean;
  last_checked: number;
  error_message?: string;
}

export class APICoordinatorService {
  private enhancedMathService?: EnhancedMathContentService;
  private vertexAIService?: VertexAIService;
  private vectorArtService?: VectorArtService;
  
  // Fallback services for when specialized services are unavailable
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;
  
  private serviceHealthCache = new Map<string, { healthy: boolean; lastCheck: number }>();
  private readonly HEALTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    try {
      // Initialize specialized services if they are configured
      if (process.env.SYMBOLAB_API_KEY) {
        this.enhancedMathService = new EnhancedMathContentService();
      }
      
      if (process.env.GOOGLE_VERTEX_AI_PROJECT_ID) {
        this.vertexAIService = new VertexAIService();
      }
      
      if (process.env.VECTORART_AI_API_KEY) {
        this.vectorArtService = new VectorArtService();
      }

      // Initialize fallback services
      if (process.env.OPENAI_API_KEY) {
        this.openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      }

      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropicClient = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
      }
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  /**
   * Generate complete worksheet content by orchestrating multiple APIs
   */
  async generateWorksheetContent(request: WorksheetRequest): Promise<WorksheetGenerationResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const contentSections: GeneratedContent[] = [];
    const servicesUsed: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`[APICoordinator] Starting worksheet generation for: ${request.topic} (Grade ${request.grade_level})`);

    try {
      // Generate different types of content based on request
      for (const contentType of request.content_types) {
        try {
          const content = await this.generateContentByType(contentType, request);
          if (content) {
            contentSections.push(content);
            if (!servicesUsed.includes(content.metadata.source_service)) {
              servicesUsed.push(content.metadata.source_service);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to generate ${contentType}: ${error}`;
          console.error(`[APICoordinator] ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      // Generate visual assets if requested
      if (request.include_visuals && this.vectorArtService) {
        try {
          const visuals = await this.generateVisualAssets(request);
          if (visuals.length > 0) {
            // Attach visuals to relevant content sections
            this.attachVisualsToContent(contentSections, visuals);
            if (!servicesUsed.includes('VectorArt.ai')) {
              servicesUsed.push('VectorArt.ai');
            }
          }
        } catch (error) {
          const errorMsg = `Failed to generate visuals: ${error}`;
          console.error(`[APICoordinator] ${errorMsg}`);
          warnings.push(errorMsg);
        }
      }

      const totalTime = Date.now() - startTime;
      
      return {
        request_id: requestId,
        content_sections: contentSections,
        total_generation_time: totalTime,
        services_used: servicesUsed,
        quality_metrics: this.calculateQualityMetrics(contentSections),
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

    } catch (error) {
      throw new Error(`Worksheet generation failed: ${error}`);
    }
  }

  /**
   * Generate content based on specific content type
   */
  private async generateContentByType(
    contentType: ContentType,
    request: WorksheetRequest
  ): Promise<GeneratedContent | null> {
    const startTime = Date.now();

    switch (contentType) {
      case 'problems':
        return this.generateMathProblems(request, startTime);
        
      case 'word_problems':
        return this.generateWordProblems(request, startTime);
        
      case 'explanations':
        return this.generateExplanations(request, startTime);
        
      case 'examples':
        return this.generateExamples(request, startTime);
        
      case 'diagrams':
      case 'illustrations':
        return this.generateVisualContent(request, contentType, startTime);
        
      default:
        console.warn(`[APICoordinator] Unknown content type: ${contentType}`);
        return null;
    }
  }

  private async generateMathProblems(
    request: WorksheetRequest,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try Enhanced Math Content Service for math problems
    if (this.enhancedMathService && request.subject === 'math') {
      try {
        const problems = await this.enhancedMathService.generateMathProblems({
          problem_type: this.mapTopicToProblemType(request.topic),
          topic: request.topic,
          difficulty: request.difficulty,
          grade_level: request.grade_level,
          count: this.getContentCount(request.worksheet_length),
          format: 'mixed'
        });

        const content = this.formatMathProblems(problems);

        return {
          id: this.generateContentId(),
          type: 'problems',
          content: content,
          metadata: {
            source_service: 'EnhancedMathContentService',
            generation_time: Date.now() - startTime,
            safety_approved: true,
          },
        };
      } catch (error) {
        console.error('[APICoordinator] Enhanced Math Service generation failed, trying AI fallback:', error);
      }
    }

    // Fallback to OpenAI/Anthropic if Symbolab is unavailable or failed
    console.log('[APICoordinator] Using fallback for math problems generation');
    return this.generateContentWithFallback(request, 'problems', startTime);
  }

  private async generateWordProblems(
    request: WorksheetRequest,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try VertexAI first for word problems
    if (this.vertexAIService) {
      try {
        const count = this.getContentCount(request.worksheet_length);
        const problems: string[] = [];

        for (let i = 0; i < count; i++) {
          const problem = await this.vertexAIService.generateMathWordProblem(
            request.topic,
            request.grade_level,
            request.difficulty
          );
          problems.push(`Problem ${i + 1}: ${problem.problem}\n\nSolution: ${problem.solution}`);
        }

        return {
          id: this.generateContentId(),
          type: 'word_problems',
          content: problems.join('\n\n---\n\n'),
          metadata: {
            source_service: 'VertexAI',
            generation_time: Date.now() - startTime,
            safety_approved: true,
          },
        };
      } catch (error) {
        console.error('[APICoordinator] VertexAI word problems generation failed, trying fallback:', error);
      }
    }

    // Fallback to OpenAI/Anthropic if VertexAI is unavailable or failed
    console.log('[APICoordinator] Using fallback for word problems generation');
    return this.generateContentWithFallback(request, 'word_problems', startTime);
  }

  private async generateExplanations(
    request: WorksheetRequest,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try VertexAI first for explanations
    if (this.vertexAIService) {
      try {
        const explanation = await this.vertexAIService.generateExplanation(
          request.topic,
          request.subject,
          request.grade_level
        );

        const content = `# ${request.topic} Explanation

${explanation.explanation}

## Key Points:
${explanation.key_points.map(point => `• ${point}`).join('\n')}

## Examples:
${explanation.examples.map((example, i) => `${i + 1}. ${example}`).join('\n')}`;

        return {
          id: this.generateContentId(),
          type: 'explanations',
          content: content,
          metadata: {
            source_service: 'VertexAI',
            generation_time: Date.now() - startTime,
            quality_score: explanation.key_points.length > 0 ? 0.8 : 0.6,
            safety_approved: true,
          },
        };
      } catch (error) {
        console.error('[APICoordinator] VertexAI explanations generation failed, trying fallback:', error);
      }
    }

    // Fallback to OpenAI/Anthropic if VertexAI is unavailable or failed
    console.log('[APICoordinator] Using fallback for explanations generation');
    return this.generateContentWithFallback(request, 'explanations', startTime);
  }

  private async generateExamples(
    request: WorksheetRequest,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try VertexAI first for examples
    if (this.vertexAIService) {
      try {
        const result = await this.vertexAIService.generateContent({
          prompt: `Generate 3-5 practical examples of ${request.topic} for grade ${request.grade_level} students`,
          content_type: 'explanation',
          subject: request.subject,
          grade_level: request.grade_level,
          temperature: 0.7,
        });

        return {
          id: this.generateContentId(),
          type: 'examples',
          content: result.content,
          metadata: {
            source_service: 'VertexAI',
            generation_time: Date.now() - startTime,
            quality_score: result.metadata.word_count > 50 ? 0.7 : 0.5,
            safety_approved: result.metadata.safety_approved,
          },
        };
      } catch (error) {
        console.error('[APICoordinator] VertexAI examples generation failed, trying fallback:', error);
      }
    }

    // Fallback to OpenAI/Anthropic if VertexAI is unavailable or failed
    console.log('[APICoordinator] Using fallback for examples generation');
    return this.generateContentWithFallback(request, 'examples', startTime);
  }

  private async generateVisualContent(
    request: WorksheetRequest,
    contentType: ContentType,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try VectorArt first for visual content
    if (this.vectorArtService) {
      try {
        const ageGroup = request.grade_level <= 5 ? 'elementary' : 
                        request.grade_level <= 8 ? 'middle_school' : 'high_school';
        
        const visual = await this.vectorArtService.generateIllustration({
          prompt: `Educational ${contentType} for ${request.topic} suitable for grade ${request.grade_level}`,
          style: 'educational',
          category: request.subject === 'math' ? 'math' : 
                   request.subject === 'science' ? 'science' : 'science',
          age_group: ageGroup,
          format: 'png',
          size: 'medium',
          color_scheme: 'colorful'
        });

        return {
          id: this.generateContentId(),
          type: contentType,
          content: `![${request.topic} ${contentType}](${visual.image_url})\n\n**Visual Asset:** Educational ${contentType} for ${request.topic}`,
          metadata: {
            source_service: 'VectorArt.ai',
            generation_time: Date.now() - startTime,
            safety_approved: true,
          },
          visual_assets: [visual],
        };
      } catch (error) {
        console.error(`[APICoordinator] VectorArt ${contentType} generation failed, trying fallback:`, error);
      }
    }

    // Fallback to text-based visual descriptions
    console.log(`[APICoordinator] Using fallback for ${contentType} generation`);
    return this.generateContentWithFallback(request, contentType, startTime);
  }

  private async generateVisualAssets(request: WorksheetRequest): Promise<VectorArtResponse[]> {
    if (!this.vectorArtService) {
      return [];
    }

    const visuals: VectorArtResponse[] = [];

    try {
      // Generate subject-specific visuals
      if (request.subject === 'math') {
        const mathVisual = await this.vectorArtService.generateMathVisual(
          request.topic,
          'geometric',
          this.mapGradeLevelToAgeGroup(request.grade_level)
        );
        visuals.push(mathVisual);
      } else if (request.subject === 'science') {
        const scienceVisual = await this.vectorArtService.generateScientificDiagram(
          request.topic,
          'biology',
          this.mapGradeLevelToAgeGroup(request.grade_level)
        );
        visuals.push(scienceVisual);
      }

      return visuals;
    } catch (error) {
      console.error('[APICoordinator] Visual generation failed:', error);
      return [];
    }
  }

  private attachVisualsToContent(
    contentSections: GeneratedContent[],
    visuals: VectorArtResponse[]
  ): void {
    // Attach visuals to the most relevant content sections
    if (visuals.length > 0 && contentSections.length > 0) {
      // For now, attach to the first content section
      // Could be enhanced with better matching logic
      contentSections[0].visual_assets = visuals;
    }
  }

  /**
   * Check the health status of all configured services
   */
  async checkAllServicesHealth(): Promise<ServiceStatus[]> {
    const services: ServiceStatus[] = [];

    if (this.enhancedMathService) {
      services.push(await this.checkServiceHealth('EnhancedMathContent', this.enhancedMathService));
    }

    if (this.vertexAIService) {
      services.push(await this.checkServiceHealth('VertexAI', this.vertexAIService));
    }

    if (this.vectorArtService) {
      services.push(await this.checkServiceHealth('VectorArt.ai', this.vectorArtService));
    }

    return services;
  }

  private async checkServiceHealth(
    serviceName: string,
    service: BaseAPIService
  ): Promise<ServiceStatus> {
    const cached = this.serviceHealthCache.get(serviceName);
    const now = Date.now();

    // Use cached result if still valid
    if (cached && (now - cached.lastCheck) < this.HEALTH_CACHE_TTL) {
      return {
        service_name: serviceName,
        is_configured: service.isConfigured(),
        is_healthy: cached.healthy,
        last_checked: cached.lastCheck,
      };
    }

    // Check health
    let isHealthy = false;
    let errorMessage: string | undefined;

    try {
      isHealthy = await service.validateConfiguration();
    } catch (error) {
      errorMessage = `Health check failed: ${error}`;
    }

    // Update cache
    this.serviceHealthCache.set(serviceName, {
      healthy: isHealthy,
      lastCheck: now,
    });

    return {
      service_name: serviceName,
      is_configured: service.isConfigured(),
      is_healthy: isHealthy,
      last_checked: now,
      error_message: errorMessage,
    };
  }

  // Helper methods
  private mapTopicToProblemType(topic: string): 'algebra' | 'calculus' | 'geometry' | 'statistics' {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('algebra') || topicLower.includes('equation')) return 'algebra';
    if (topicLower.includes('calculus') || topicLower.includes('derivative')) return 'calculus';
    if (topicLower.includes('geometry') || topicLower.includes('triangle')) return 'geometry';
    if (topicLower.includes('statistics') || topicLower.includes('probability')) return 'statistics';
    return 'algebra'; // default
  }

  private mapGradeLevelToAgeGroup(gradeLevel: number): 'elementary' | 'middle_school' | 'high_school' {
    if (gradeLevel <= 5) return 'elementary';
    if (gradeLevel <= 8) return 'middle_school';
    return 'high_school';
  }

  private getContentCount(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short': return 3;
      case 'medium': return 5;
      case 'long': return 8;
      default: return 5;
    }
  }

  private formatMathProblems(problems: MathProblem[]): string {
    return problems.map((problem, index) => 
      `${index + 1}. ${problem.problem}\n\n   Solution: ${problem.solution}`
    ).join('\n\n');
  }

  private calculateQualityMetrics(contentSections: GeneratedContent[]): {
    average_quality_score: number;
    safety_compliance: boolean;
    content_coherence: number;
  } {
    if (contentSections.length === 0) {
      return {
        average_quality_score: 0,
        safety_compliance: false,
        content_coherence: 0,
      };
    }

    const qualityScores = contentSections
      .map(section => section.metadata.quality_score || 0.7)
      .filter(score => score > 0);

    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0.7;

    const safetyCompliance = contentSections.every(section => 
      section.metadata.safety_approved
    );

    // Simple coherence calculation based on content variety
    const contentCoherence = Math.min(1.0, contentSections.length / 3);

    return {
      average_quality_score: averageQuality,
      safety_compliance: safetyCompliance,
      content_coherence: contentCoherence,
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get summary of available services and their capabilities
   */
  getServiceCapabilities(): {
    service_name: string;
    configured: boolean;
    capabilities: string[];
  }[] {
    const capabilities = [];

    if (this.enhancedMathService) {
      capabilities.push({
        service_name: 'EnhancedMathContent',
        configured: this.enhancedMathService.isConfigured(),
        capabilities: ['AI Math Problems', 'LaTeX Rendering', 'Curriculum Alignment', 'Multi-Grade Support'],
      });
    }

    if (this.vertexAIService) {
      capabilities.push({
        service_name: 'VertexAI',
        configured: this.vertexAIService.isConfigured(),
        capabilities: ['Content Generation', 'Word Problems', 'Explanations'],
      });
    }

    if (this.vectorArtService) {
      capabilities.push({
        service_name: 'VectorArt.ai',
        configured: this.vectorArtService.isConfigured(),
        capabilities: ['Educational Illustrations', 'Scientific Diagrams', 'Math Visuals'],
      });
    }

    return capabilities;
  }

  // Fallback methods using OpenAI/Anthropic when specialized services unavailable
  
  private async generateContentWithFallback(
    request: WorksheetRequest,
    contentType: ContentType,
    startTime: number
  ): Promise<GeneratedContent | null> {
    // Try OpenAI first as primary fallback
    if (this.openaiClient) {
      return this.generateContentWithOpenAI(request, contentType, startTime);
    }
    
    // Try Anthropic as secondary fallback
    if (this.anthropicClient) {
      return this.generateContentWithAnthropic(request, contentType, startTime);
    }
    
    console.warn('[APICoordinator] No fallback services available');
    return null;
  }

  private async generateContentWithOpenAI(
    request: WorksheetRequest,
    contentType: ContentType,
    startTime: number
  ): Promise<GeneratedContent | null> {
    try {
      const prompt = this.buildFallbackPrompt(request, contentType);
      
      const response = await this.openaiClient!.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an educational content generator specializing in ${request.subject} for grade ${request.grade_level} students.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.getMaxTokensForContentType(contentType),
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        id: this.generateContentId(),
        type: contentType,
        content: content,
        metadata: {
          source_service: 'OpenAI (Fallback)',
          generation_time: Date.now() - startTime,
          safety_approved: true,
        },
      };
    } catch (error) {
      console.error('[APICoordinator] OpenAI fallback failed:', error);
      return null;
    }
  }

  private async generateContentWithAnthropic(
    request: WorksheetRequest,
    contentType: ContentType,
    startTime: number
  ): Promise<GeneratedContent | null> {
    try {
      const prompt = this.buildFallbackPrompt(request, contentType);
      
      const response = await this.anthropicClient!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: this.getMaxTokensForContentType(contentType),
        messages: [
          {
            role: 'user',
            content: `You are an educational content generator specializing in ${request.subject} for grade ${request.grade_level} students.\n\n${prompt}`
          }
        ],
        temperature: 0.7,
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

      return {
        id: this.generateContentId(),
        type: contentType,
        content: content,
        metadata: {
          source_service: 'Anthropic (Fallback)',
          generation_time: Date.now() - startTime,
          safety_approved: true,
        },
      };
    } catch (error) {
      console.error('[APICoordinator] Anthropic fallback failed:', error);
      return null;
    }
  }

  private buildFallbackPrompt(request: WorksheetRequest, contentType: ContentType): string {
    const basePrompt = `Generate ${contentType} for ${request.subject} on the topic "${request.topic}" suitable for grade ${request.grade_level} students at ${request.difficulty} difficulty level.`;
    
    const contentSpecificPrompts = {
      problems: 'Create practice problems with step-by-step solutions.',
      word_problems: 'Create engaging word problems that relate to real-world scenarios.',
      explanations: 'Provide clear, age-appropriate explanations with examples.',
      examples: 'Create detailed examples that demonstrate key concepts.',
      diagrams: 'Describe visual diagrams or illustrations that would help explain the concept.',
      illustrations: 'Describe educational illustrations that would enhance understanding.'
    };

    const specificPrompt = contentSpecificPrompts[contentType] || 'Generate appropriate educational content.';
    
    return `${basePrompt}\n\n${specificPrompt}\n\nMake sure the content is appropriate for the grade level and difficulty specified.`;
  }

  private getMaxTokensForContentType(contentType: ContentType): number {
    const tokenLimits = {
      problems: 800,
      word_problems: 600,
      explanations: 1000,
      examples: 800,
      diagrams: 400,
      illustrations: 400
    };
    
    return tokenLimits[contentType] || 600;
  }
}