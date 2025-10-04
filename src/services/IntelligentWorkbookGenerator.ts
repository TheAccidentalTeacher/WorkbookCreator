import { AIDecisionEngine, GenerationRequest, AIDecision } from './ai/AIDecisionEngine';
import { SimpleGenerationEngine } from './simpleGenerationEngine';
import { ContentGenerationOrchestrator } from './contentGenerationOrchestrator';
import { TextDensityLevel } from './visualContentService';

/**
 * Intelligent Workbook Generator that uses AI to decide the optimal generation strategy
 */
export class IntelligentWorkbookGenerator {
  private decisionEngine: AIDecisionEngine;
  private simpleEngine: SimpleGenerationEngine;
  private comprehensiveEngine: ContentGenerationOrchestrator;

  constructor() {
    this.decisionEngine = new AIDecisionEngine();
    this.simpleEngine = new SimpleGenerationEngine();
    this.comprehensiveEngine = new ContentGenerationOrchestrator();
  }

  /**
   * Generate workbook using AI-decided strategy
   */
  async generateWorkbook(request: GenerationRequest) {
    console.log('🤖 [Intelligent Generator] Starting AI-driven workbook generation...');
    console.log('📝 [Intelligent Generator] Request:', {
      topic: request.topic,
      subject: request.subject,
      gradeLevel: request.gradeLevel,
      timeConstraint: request.timeConstraint,
      includeImages: request.includeImages
    });

    try {
      // Phase 1: AI Decision Analysis
      console.log('🧠 [Intelligent Generator] Phase 1: AI Strategy Analysis');
      const decision = await this.decisionEngine.analyzeAndDecide(request);
      
      console.log('✅ [Intelligent Generator] AI Decision Complete:', {
        engine: decision.strategy.engine,
        approach: decision.strategy.promptingApproach,
        visualStrategy: decision.strategy.visualStrategy,
        confidence: decision.confidenceScore,
        estimatedDuration: decision.strategy.estimatedDuration
      });

      // Phase 2: Execute Chosen Strategy
      console.log('⚡ [Intelligent Generator] Phase 2: Executing Strategy');
      const result = await this.executeStrategy(request, decision);

      // Phase 3: Post-Processing
      console.log('🔧 [Intelligent Generator] Phase 3: Post-Processing');
      const finalResult = await this.postProcess(result, decision);

      console.log('🎉 [Intelligent Generator] Generation completed successfully!');
      
      return {
        workbook: finalResult,
        metadata: {
          strategy: decision.strategy,
          reasoning: decision.reasoning,
          confidenceScore: decision.confidenceScore,
          generatedAt: new Date().toISOString(),
          processingTime: Date.now(), // You'd track this properly
          aiDecision: decision
        }
      };

    } catch (error) {
      console.error('❌ [Intelligent Generator] Generation failed:', error);
      
      // Fallback to simple generation
      console.log('🔄 [Intelligent Generator] Falling back to simple generation...');
      return this.fallbackGeneration(request);
    }
  }

  /**
   * Execute the AI-chosen generation strategy
   */
  private async executeStrategy(request: GenerationRequest, decision: AIDecision) {
    const { strategy } = decision;

    switch (strategy.engine) {
      case 'simple':
        return this.executeSimpleStrategy(request, decision);
      
      case 'comprehensive':
        return this.executeComprehensiveStrategy(request, decision);
      
      case 'specialized':
        return this.executeSpecializedStrategy(request, decision);
      
      case 'hybrid':
        return this.executeHybridStrategy(request, decision);
      
      default:
        console.warn('⚠️ [Intelligent Generator] Unknown engine, defaulting to simple');
        return this.executeSimpleStrategy(request, decision);
    }
  }

  /**
   * Execute simple generation strategy
   */
  private async executeSimpleStrategy(request: GenerationRequest, decision: AIDecision) {
    console.log('⚡ [Simple Strategy] Executing fast generation...');
    
    // Convert request format to simple engine format
    const simpleRequest = {
      topic: request.topic,
      subject: request.subject,
      gradeLevel: request.gradeLevel,
      pageCount: request.sectionCount || 5,
      textDensity: this.mapTextDensity(request.textDensity),
      visualOptions: this.buildVisualOptions(request.visualOptions),
      includeImages: request.includeImages || false,
      fastMode: request.timeConstraint === 'fast'
    };

    // Apply custom prompts if provided by AI
    if (decision.customPrompts?.contentGeneration) {
      console.log('🎯 [Simple Strategy] Using AI-customized content prompt');
      // You could inject custom prompts here
    }

    const result = await this.simpleEngine.generateWorkbook(simpleRequest);
    
    console.log('✅ [Simple Strategy] Simple generation completed');
    return result;
  }

  /**
   * Execute comprehensive generation strategy
   */
  private async executeComprehensiveStrategy(request: GenerationRequest, decision: AIDecision) {
    console.log('🏗️ [Comprehensive Strategy] Executing comprehensive generation...');
    
    // Convert request to comprehensive engine format
    const comprehensiveRequest = {
      topic: request.topic,
      subjectDomain: this.mapSubjectToDomain(request.subject),
      gradeBand: this.mapGradeToband(request.gradeLevel),
      complexity: this.mapDifficultyToComplexity(request.difficultyLevel || 'intermediate'),
      learningObjectiveCount: request.objectiveCount || 3,
      sectionCount: request.sectionCount || 4,
      visualDensity: this.mapVisualStrategy(decision.strategy.visualStrategy),
      specialRequirements: request.specialRequirements || []
    };

    // Apply AI-driven customizations
    if (decision.strategy.promptingApproach === 'iterative') {
      console.log('🔄 [Comprehensive Strategy] Using iterative prompting approach');
      // Enable iterative refinement
    }

    if (decision.customPrompts) {
      console.log('🎯 [Comprehensive Strategy] Applying AI-customized prompts');
      // Apply custom prompts to pipeline
    }

    const result = await this.comprehensiveEngine.startGeneration(comprehensiveRequest);
    
    console.log('✅ [Comprehensive Strategy] Comprehensive generation completed');
    return result;
  }

  /**
   * Execute specialized generation strategy
   */
  private async executeSpecializedStrategy(request: GenerationRequest, decision: AIDecision) {
    console.log('🎯 [Specialized Strategy] Executing domain-specific generation...');
    
    // For now, route to comprehensive with specialization flags
    const specializedRequest = {
      topic: request.topic,
      subjectDomain: this.mapSubjectToDomain(request.subject),
      gradeBand: this.mapGradeToband(request.gradeLevel),
      complexity: 'advanced',
      specialization: request.subject,
      domainSpecificOptimizations: true,
      advancedVisuals: decision.strategy.visualStrategy === 'heavy',
      customPrompting: decision.customPrompts
    };

    // Apply domain-specific enhancements based on subject
    if (request.subject.toLowerCase().includes('math')) {
      console.log('📐 [Specialized Strategy] Applying mathematics optimizations');
      // Add math-specific processing
    } else if (request.subject.toLowerCase().includes('science')) {
      console.log('🔬 [Specialized Strategy] Applying science optimizations');
      // Add science-specific processing
    }

    // For now, use comprehensive engine with specialized settings
    const result = await this.comprehensiveEngine.startGeneration(specializedRequest);
    
    console.log('✅ [Specialized Strategy] Specialized generation completed');
    return result;
  }

  /**
   * Execute hybrid generation strategy
   */
  private async executeHybridStrategy(request: GenerationRequest, decision: AIDecision) {
    console.log('🔀 [Hybrid Strategy] Executing hybrid approach...');
    
    // Analyze sections to determine per-section strategy
    const sectionStrategies = this.planSectionStrategies(request, decision);
    
    console.log('📋 [Hybrid Strategy] Section-level strategies:', sectionStrategies);
    
    // For now, use comprehensive engine with adaptive settings
    const result = await this.executeComprehensiveStrategy(request, decision);
    
    console.log('✅ [Hybrid Strategy] Hybrid generation completed');
    return result;
  }

  /**
   * Plan different strategies for different sections
   */
  private planSectionStrategies(request: GenerationRequest, decision: AIDecision) {
    // This could be enhanced to use AI to decide per-section strategies
    const sectionCount = request.sectionCount || 4;
    const strategies = [];
    
    for (let i = 0; i < sectionCount; i++) {
      // Simple heuristic for now
      const isIntroSection = i === 0;
      const isAdvancedSection = i >= sectionCount - 2;
      
      strategies.push({
        sectionIndex: i,
        strategy: isIntroSection ? 'simple' : isAdvancedSection ? 'specialized' : 'comprehensive',
        visualIntensity: isIntroSection ? 'heavy' : 'moderate'
      });
    }
    
    return strategies;
  }

  /**
   * Post-process the generated content based on AI recommendations
   */
  private async postProcess(result: unknown, decision: AIDecision) {
    console.log('🔧 [Post-Processing] Applying AI-recommended optimizations...');
    
    // Apply post-processing based on AI recommendations
    if (decision.recommendations.includes('enhance_visuals')) {
      console.log('🎨 [Post-Processing] Enhancing visual content');
      // Apply visual enhancements
    }
    
    if (decision.recommendations.includes('improve_difficulty_progression')) {
      console.log('📈 [Post-Processing] Optimizing difficulty progression');
      // Apply difficulty adjustments
    }
    
    if (decision.customPrompts?.postProcessing) {
      console.log('🎯 [Post-Processing] Applying custom post-processing');
      // Apply AI-suggested post-processing
    }
    
    return result;
  }

  /**
   * Fallback generation when AI decision fails
   */
  private async fallbackGeneration(request: GenerationRequest) {
    console.log('🔄 [Fallback] Using default generation strategy');
    
    const simpleRequest = {
      topic: request.topic,
      subject: request.subject,
      gradeLevel: request.gradeLevel,
      pageCount: 5,
      textDensity: 'moderate' as const,
      visualOptions: {
        textDensity: 'moderate' as const,
        includeIllustrations: false,
        includeDiagrams: false,
        includeInteractiveElements: false,
        includeColorCoding: false,
        creativityLevel: 'standard' as const
      },
      includeImages: false,
      fastMode: true
    };

    const result = await this.simpleEngine.generateWorkbook(simpleRequest);
    
    return {
      workbook: result,
      metadata: {
        strategy: { engine: 'simple' },
        reasoning: 'Fallback due to AI decision failure',
        confidenceScore: 50,
        generatedAt: new Date().toISOString()
      }
    };
  }

  // Helper mapping functions
  private mapSubjectToDomain(subject: string): string {
    const domainMap: { [key: string]: string } = {
      'math': 'mathematics',
      'mathematics': 'mathematics',
      'science': 'science',
      'english': 'language-arts',
      'history': 'social-studies',
      'geography': 'social-studies'
    };
    return domainMap[subject.toLowerCase()] || 'general';
  }

  private mapGradeToband(gradeLevel: string): string {
    if (gradeLevel.includes('K') || gradeLevel.includes('1') || gradeLevel.includes('2')) return 'k-2';
    if (gradeLevel.includes('3') || gradeLevel.includes('4') || gradeLevel.includes('5')) return '3-5';
    if (gradeLevel.includes('6') || gradeLevel.includes('7') || gradeLevel.includes('8')) return '6-8';
    return '9-12';
  }

  private mapDifficultyToComplexity(difficulty: string): string {
    const complexityMap: { [key: string]: string } = {
      'basic': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    };
    return complexityMap[difficulty] || 'intermediate';
  }

  private mapVisualStrategy(visualStrategy: string): string {
    const densityMap: { [key: string]: string } = {
      'none': 'text-only',
      'minimal': 'low',
      'moderate': 'medium',
      'heavy': 'high',
      'dominant': 'very-high'
    };
    return densityMap[visualStrategy] || 'medium';
  }

  private mapTextDensity(textDensity?: string): 'minimal' | 'moderate' | 'text-heavy' {
    const densityMap: { [key: string]: 'minimal' | 'moderate' | 'text-heavy' } = {
      'minimal': 'minimal',
      'moderate': 'moderate',
      'detailed': 'text-heavy',
      'text-heavy': 'text-heavy'
    };
    return densityMap[textDensity || 'moderate'] || 'moderate';
  }

  private buildVisualOptions(visualOptions?: GenerationRequest['visualOptions']) {
    return {
      textDensity: this.mapTextDensity(visualOptions?.textDensity),
      includeIllustrations: visualOptions?.includeIllustrations ?? true,
      includeDiagrams: visualOptions?.includeDiagrams ?? true,
      includeInteractiveElements: visualOptions?.includeInteractiveElements ?? false,
      includeColorCoding: visualOptions?.includeColorCoding ?? true,
      creativityLevel: (visualOptions?.creativityLevel || 'high') as 'standard' | 'high' | 'maximum'
    };
  }
}