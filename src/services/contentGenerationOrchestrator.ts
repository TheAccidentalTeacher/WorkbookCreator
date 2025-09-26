import { GenerationContext, PipelineStep, GenerationStateType } from '@/types';
import { AIService } from './aiService';
import { TopicProcessor } from './topicProcessor';
import { LearningObjectiveGenerator } from './learningObjectiveGenerator';
import { EnhancedMathContentService } from './integration/EnhancedMathContentService';
import { GradeLevelContentService } from './gradeLevelContentService';
import { VisualContentService, TextDensityLevel, VisualContentOptions } from './visualContentService';
import { debugSystem } from '../utils/debugSystem';

export interface WorkbookOutline {
  title: string;
  sections: SectionOutline[];
}

export interface SectionOutline {
  title: string;
  purpose: 'introduction' | 'concept_explanation' | 'guided_practice' | 'independent_practice';
  description: string;
  estimatedTime: number;
  keyTopics: string[];
}

export interface SectionContent {
  title: string;
  conceptExplanation: string;
  examples: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  summary: string;
  exercises?: Exercise[];
  misconceptions?: Misconception[];
  images?: Array<{
    url: string;
    description: string;
    placement: 'header' | 'inline' | 'sidebar';
  }>;
}

export interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  solution?: ExerciseSolution;
  visualData?: {
    visual_type: string;
    shape: string;
    total_parts: number;
    shaded_parts: number;
  };
}

export interface ExerciseSolution {
  answer: string;
  explanation: string;
  workingSteps: string[];
}

export interface Misconception {
  description: string;
  explanation: string;
  correction: string;
}

export interface ContentValidation {
  overallScore: number;
  issues: string[];
  suggestions: string[];
  bloomDistribution: Record<string, number>;
  readabilityScore: number;
  accessibilityScore: number;
}

export interface GenerationPipeline {
  workbookId: string;
  state: GenerationStateType;
  steps: PipelineStep[];
  currentStepIndex: number;
  context: GenerationContext;
  startTime: Date;
  completedAt?: Date;
  error?: string;
}

export class ContentGenerationOrchestrator {
  private aiService: AIService;
  private objectiveGenerator: LearningObjectiveGenerator;
  private enhancedMathService: EnhancedMathContentService;

  constructor() {
    debugSystem.info('Content Generation Orchestrator', 'Initializing orchestrator', {
      timestamp: new Date().toISOString()
    });
    
    this.aiService = new AIService();
    this.objectiveGenerator = new LearningObjectiveGenerator();
    this.enhancedMathService = new EnhancedMathContentService();
    
    // Create a simple adapter for the AI service
    const aiServiceAdapter = {
      generateContent: async (prompt: string): Promise<string> => {
        const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
          temperature: 0.7,
          maxTokens: 2000
        });
        return response.content;
      },
      isConfigured: () => true
    };
    
    // Set up the Enhanced Math Service with AI service adapter
    this.enhancedMathService.setAIServices(aiServiceAdapter, null);
    
    debugSystem.info('Content Generation Orchestrator', 'Orchestrator initialized successfully', {
      aiServiceReady: !!this.aiService,
      objectiveGeneratorReady: !!this.objectiveGenerator,
      enhancedMathServiceReady: this.enhancedMathService.isConfigured()
    });
  }

  /**
   * Create and start a new generation pipeline
   */
  async startGeneration(input: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    textDensity?: TextDensityLevel;
    visualOptions?: VisualContentOptions;
    options?: Record<string, unknown>;
  }): Promise<GenerationPipeline> {
    const perfLabel = 'orchestrator.startGeneration';
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('Content Generation Orchestrator', 'Starting new generation pipeline', {
      input,
      timestamp: new Date().toISOString()
    });

    const workbookId = `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    debugSystem.debug('Content Generation Orchestrator', 'Generated workbook ID', { workbookId });
    
    const context: GenerationContext = {
      workbookId,
      input,
      config: {
        models: {
          primary: 'gpt-3.5-turbo', // Use faster model by default
          fallback: 'gpt-4'
        },
        constraints: {
          maxTokens: 30000, // Reduced from 50000
          timeoutMinutes: 15  // Reduced from 30
        }
      },
      state: {},
      artifacts: {}
    };

    const pipeline: GenerationPipeline = {
      workbookId,
      state: 'init',
      steps: this.createPipelineSteps(),
      currentStepIndex: 0,
      context,
      startTime: new Date()
    };

    debugSystem.debug('Content Generation Orchestrator', 'Pipeline created', {
      workbookId,
      stepCount: pipeline.steps.length,
      stepNames: pipeline.steps.map(s => s.name)
    });

    // Start the pipeline execution
    await this.executePipeline(pipeline);
    
    debugSystem.endPerformance(perfLabel, 'Content Generation Orchestrator');
    debugSystem.info('Content Generation Orchestrator', 'Generation pipeline completed', {
      workbookId,
      finalState: pipeline.state,
      stepsCompleted: pipeline.currentStepIndex,
      totalSteps: pipeline.steps.length,
      hasError: !!pipeline.error
    });
    
    return pipeline;
  }

  /**
   * Resume a pipeline from a specific step
   */
  async resumePipeline(pipeline: GenerationPipeline): Promise<GenerationPipeline> {
    return await this.executePipeline(pipeline);
  }

  /**
   * Execute the pipeline steps
   */
  private async executePipeline(pipeline: GenerationPipeline): Promise<GenerationPipeline> {
    const perfLabel = `orchestrator.executePipeline.${pipeline.workbookId}`;
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('Content Generation Orchestrator', 'Starting pipeline execution', {
      workbookId: pipeline.workbookId,
      currentStep: pipeline.currentStepIndex,
      totalSteps: pipeline.steps.length,
      state: pipeline.state
    });

    try {
      while (pipeline.currentStepIndex < pipeline.steps.length) {
        const step = pipeline.steps[pipeline.currentStepIndex];
        const stepPerfLabel = `orchestrator.step.${step.name}.${pipeline.workbookId}`;
        
        debugSystem.startPerformance(stepPerfLabel);
        debugSystem.info('Content Generation Orchestrator', `Executing pipeline step: ${step.name}`, {
          stepIndex: pipeline.currentStepIndex,
          stepName: step.name,
          stepDescription: step.description,
          workbookId: pipeline.workbookId
        });
        
        console.log(`Executing step: ${step.name}`);
        pipeline.state = this.getStateFromStepName(step.name);
        
        // Execute the step
        pipeline.context = await step.execute(pipeline.context);
        
        debugSystem.endPerformance(stepPerfLabel, 'Content Generation Orchestrator');
        debugSystem.info('Content Generation Orchestrator', `Completed pipeline step: ${step.name}`, {
          stepIndex: pipeline.currentStepIndex,
          stepName: step.name,
          contextStateKeys: Object.keys(pipeline.context.state),
          artifactKeys: Object.keys(pipeline.context.artifacts)
        });
        
        // Move to next step
        pipeline.currentStepIndex++;
        
        // Optional: Add delay between steps to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
      }
      
      pipeline.state = 'complete';
      pipeline.completedAt = new Date();
      
      debugSystem.endPerformance(perfLabel, 'Content Generation Orchestrator');
      debugSystem.info('Content Generation Orchestrator', 'Pipeline execution completed successfully', {
        workbookId: pipeline.workbookId,
        finalState: pipeline.state,
        stepsCompleted: pipeline.currentStepIndex,
        totalSteps: pipeline.steps.length,
        duration: pipeline.completedAt.getTime() - pipeline.startTime.getTime()
      });
      
    } catch (error) {
      pipeline.state = 'error';
      pipeline.error = error instanceof Error ? error.message : 'Unknown error';
      
      debugSystem.endPerformance(perfLabel, 'Content Generation Orchestrator');
      debugSystem.error('Content Generation Orchestrator', 'Pipeline execution failed', {
        workbookId: pipeline.workbookId,
        currentStep: pipeline.currentStepIndex,
        stepName: pipeline.steps[pipeline.currentStepIndex]?.name,
        error: pipeline.error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      console.error('Pipeline execution failed:', error);
    }
    
    return pipeline;
  }

  /**
   * Create the sequence of pipeline steps
   */
  private createPipelineSteps(): PipelineStep[] {
    return [
      {
        name: 'topic_parse',
        description: 'Analyze and classify the input topic',
        execute: async (context: GenerationContext) => {
          const analysis = await TopicProcessor.analyzeTopic(
            context.input.topic as string,
            context.input.gradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult'
          );
          
          context.artifacts.topicAnalysis = analysis;
          context.state.subjectDomain = analysis.subjectDomain;
          context.state.gradeBand = analysis.suggestedGradeBand;
          context.state.complexity = analysis.complexity;
          
          return context;
        }
      },

      {
        name: 'objective_gen',
        description: 'Generate learning objectives',
        execute: async (context: GenerationContext) => {
          const analysis = context.artifacts.topicAnalysis as {
            subjectDomain: string;
            suggestedGradeBand: string;
            complexity: string;
            keywords?: string[];
          };
          
          const objectives = await this.objectiveGenerator.generateObjectives(
            context.input.topic as string,
            analysis.subjectDomain as 'mathematics' | 'science' | 'english_language_arts' | 'social_studies' | 'history' | 'geography' | 'art' | 'music' | 'physical_education' | 'computer_science' | 'foreign_language' | 'other',
            analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult',
            { count: 3 }
          );
          
          context.artifacts.learningObjectives = objectives;
          
          return context;
        }
      },

      {
        name: 'outline_gen',
        description: 'Generate workbook outline and structure',
        execute: async (context: GenerationContext) => {
          const analysis = context.artifacts.topicAnalysis as {
            subjectDomain: string;
            suggestedGradeBand: string;
            complexity: string;
            keywords?: string[];
          };
          const objectives = context.artifacts.learningObjectives as Array<{ text: string }>;
          
          const prompt = this.buildOutlinePrompt(
            context.input.topic as string,
            analysis,
            objectives,
            (context.input as { textDensity?: TextDensityLevel }).textDensity || 'minimal',
            (context.input as { visualOptions?: VisualContentOptions }).visualOptions || VisualContentService.getDefaultVisualOptions()
          );
          
          const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
            temperature: 0.7,
            maxTokens: 2000
          });
          
          const outline = this.parseOutline(response.content);
          context.artifacts.outline = outline;
          
          return context;
        }
      },

      {
        name: 'section_draft',
        description: 'Generate content for each section',
        execute: async (context: GenerationContext) => {
          const outline = context.artifacts.outline as WorkbookOutline;
          const analysis = context.artifacts.topicAnalysis as {
            subjectDomain: string;
            suggestedGradeBand: string;
          };
          const sections: SectionContent[] = [];
          
          for (const sectionOutline of outline.sections) {
            const sectionContent = await this.generateSectionContent(
              sectionOutline,
              analysis,
              context.input.topic as string,
              (context.input as { textDensity?: TextDensityLevel }).textDensity || 'minimal',
              (context.input as { visualOptions?: VisualContentOptions }).visualOptions || VisualContentService.getDefaultVisualOptions()
            );
            sections.push(sectionContent);
          }
          
          context.artifacts.sections = sections;
          
          return context;
        }
      },

      {
        name: 'exercise_gen',
        description: 'Generate exercises for each section',
        execute: async (context: GenerationContext) => {
          const sections = context.artifacts.sections as SectionContent[];
          const analysis = context.artifacts.topicAnalysis as {
            suggestedGradeBand: string;
          };
          
          for (const section of sections) {
            section.exercises = await this.generateExercises(
              section,
              analysis,
              context.input.topic as string
            );
          }
          
          context.artifacts.sections = sections;
          
          return context;
        }
      },

      {
        name: 'solution_gen',
        description: 'Generate solutions and explanations',
        execute: async (context: GenerationContext) => {
          const sections = context.artifacts.sections as SectionContent[];
          
          for (const section of sections) {
            for (const exercise of section.exercises || []) {
              exercise.solution = await this.generateSolution(exercise);
            }
          }
          
          context.artifacts.sections = sections;
          
          return context;
        }
      },

      {
        name: 'misconception_gen',
        description: 'Identify and address common misconceptions',
        execute: async (context: GenerationContext) => {
          const sections = context.artifacts.sections as SectionContent[];
          const analysis = context.artifacts.topicAnalysis as {
            suggestedGradeBand: string;
          };
          
          for (const section of sections) {
            section.misconceptions = await this.generateMisconceptions(
              section,
              analysis
            );
          }
          
          context.artifacts.sections = sections;
          
          return context;
        }
      },

      {
        name: 'image_gen',
        description: 'Generate visual content and images for each section',
        execute: async (context: GenerationContext) => {
          const sections = context.artifacts.sections as SectionContent[];
          const analysis = context.artifacts.topicAnalysis as {
            subjectDomain: string;
            suggestedGradeBand: string;
          };
          
          // Check if image generation is enabled
          if (process.env.ENABLE_IMAGE_GENERATION !== 'true') {
            console.log('Image generation is disabled via environment variable');
            // Initialize empty images arrays
            for (const section of sections) {
              section.images = [];
            }
            context.artifacts.sections = sections;
            return context;
          }
          
          for (const section of sections) {
            // Generate images for the section content
            try {
              // Extract visual descriptions from the section content
              const visualDescriptions = this.extractVisualDescriptions(section);
              
              if (visualDescriptions.length > 0) {
                const images = await this.aiService.generateSectionImages(
                  section.title,
                  visualDescriptions,
                  analysis.suggestedGradeBand
                );
                
                // Convert to our expected format with placement info
                section.images = images.map((img, index) => ({
                  url: img.url,
                  description: img.description,
                  placement: index === 0 ? 'header' as const : 'inline' as const
                }));
                
                console.log(`Generated ${images.length} images for section: ${section.title}`);
              } else {
                section.images = [];
                console.log(`No visual content found for section: ${section.title}`);
              }
            } catch (error) {
              console.error(`Failed to generate images for section ${section.title}:`, error);
              // Continue without images rather than failing the entire generation
              section.images = [];
            }
          }
          
          context.artifacts.sections = sections;
          
          return context;
        }
      },

      {
        name: 'qa_validate',
        description: 'Validate content quality and pedagogical compliance',
        execute: async (context: GenerationContext) => {
          const validation = await this.validateContent(context);
          context.artifacts.validation = validation;
          
          // If validation fails, we could regenerate problematic content here
          if (validation.overallScore < 70) {
            console.warn('Content quality below threshold, consider regeneration');
          }
          
          return context;
        }
      },

      {
        name: 'layout_build',
        description: 'Assemble final workbook structure',
        execute: async (context: GenerationContext) => {
          const workbook = await this.assembleWorkbook(context);
          context.artifacts.workbook = workbook;
          
          return context;
        }
      }
    ];
  }

  private getStateFromStepName(stepName: string): GenerationStateType {
    const stateMap: Record<string, GenerationStateType> = {
      'topic_parse': 'topic_parse',
      'objective_gen': 'objective_gen',
      'outline_gen': 'outline_gen',
      'section_draft': 'section_draft',
      'exercise_gen': 'exercise_gen',
      'solution_gen': 'solution_gen',
      'misconception_gen': 'misconception_gen',
      'image_gen': 'qa_validate', // Use qa_validate as closest state
      'qa_validate': 'qa_validate',
      'layout_build': 'layout_build'
    };
    
    return stateMap[stepName] || 'init';
  }

  private buildOutlinePrompt(
    topic: string, 
    analysis: { subjectDomain: string; suggestedGradeBand: string; complexity: string; keywords?: string[] }, 
    objectives: Array<{ text: string }>,
    textDensity: TextDensityLevel = 'minimal',
    visualOptions: VisualContentOptions = VisualContentService.getDefaultVisualOptions()
  ): string {
    // Get grade-specific constraints
    const gradeConstraints = GradeLevelContentService.getContentConstraints(
      analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult'
    );

    // Get visual content instructions
    const visualInstructions = VisualContentService.generateVisualContentPrompt(
      textDensity,
      analysis.subjectDomain as 'mathematics' | 'science' | 'english_language_arts' | 'social_studies' | 'history' | 'geography' | 'art' | 'music' | 'physical_education' | 'computer_science' | 'foreign_language' | 'other',
      analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult',
      visualOptions
    );

    return `
Create a structured outline for a VISUAL-FIRST workbook on "${topic}".

Topic Analysis:
- Subject: ${analysis.subjectDomain}
- Grade Level: ${analysis.suggestedGradeBand}
- Complexity: ${analysis.complexity}
- Keywords: ${analysis.keywords?.join(', ')}

${gradeConstraints}

${visualInstructions}

Learning Objectives:
${objectives.map((obj, i) => `${i + 1}. ${obj.text}`).join('\n')}

Create an outline with 3-5 sections that:
1. PRIORITIZE VISUAL ELEMENTS over text content
2. Build progressively from basic to advanced concepts
3. Are appropriate for the grade level specified above
4. Use only vocabulary and concepts suitable for this age group
5. Include engaging visual examples and real-world applications
6. Provide multiple visual practice opportunities
7. Address potential misconceptions through visual representations
8. Align with the learning objectives
9. Include specific visual element descriptions for each section
10. Design for maximum visual appeal and creative engagement

CRITICAL: 
- Follow ALL grade-level constraints listed above
- Follow ALL visual-first content requirements listed above  
- Content that is too advanced for the grade level is unacceptable
- Content that is too text-heavy for the specified visual density is unacceptable

Format as JSON:
{
  "title": "Workbook title",
  "sections": [
    {
      "title": "Section title",
      "purpose": "introduction|concept_explanation|guided_practice|independent_practice",
      "description": "What this section covers",
      "estimatedTime": 30,
      "keyTopics": ["topic1", "topic2"]
    }
  ]
}

Outline:`;
  }

  private parseOutline(content: string): WorkbookOutline {
    try {
      return JSON.parse(content) as WorkbookOutline;
    } catch {
      // Fallback parsing if JSON fails
      return {
        title: 'Generated Workbook',
        sections: [
          {
            title: 'Introduction',
            purpose: 'introduction',
            description: 'Overview of the topic',
            estimatedTime: 20,
            keyTopics: ['basics']
          }
        ]
      };
    }
  }

  private async generateSectionContent(
    sectionOutline: SectionOutline, 
    analysis: { subjectDomain: string; suggestedGradeBand: string }, 
    topic: string,
    textDensity: TextDensityLevel = 'minimal',
    visualOptions: VisualContentOptions = VisualContentService.getDefaultVisualOptions()
  ): Promise<SectionContent> {
    // Get grade-specific constraints for content generation
    const gradeConstraints = GradeLevelContentService.getContentConstraints(
      analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult'
    );

    const mathConstraints = analysis.subjectDomain === 'mathematics' ? 
      GradeLevelContentService.getMathConstraints(
        analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult'
      ) : '';

    // Get visual content instructions
    const visualInstructions = VisualContentService.generateVisualContentPrompt(
      textDensity,
      analysis.subjectDomain as 'mathematics' | 'science' | 'english_language_arts' | 'social_studies' | 'history' | 'geography' | 'art' | 'music' | 'physical_education' | 'computer_science' | 'foreign_language' | 'other',
      analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult',
      visualOptions
    );

    const prompt = `
Generate ULTRA VISUAL-FIRST content for the section: "${sectionOutline.title}"

Topic: ${topic}
Section Purpose: ${sectionOutline.purpose}
Description: ${sectionOutline.description}
Grade Level: ${analysis.suggestedGradeBand}
Key Topics: ${sectionOutline.keyTopics?.join(', ')}

${gradeConstraints}

${mathConstraints}

${visualInstructions}

ULTRA VISUAL-FIRST EXAMPLE for K-2:
For young children, content should be 95% visual, 5% text. Example structure:
- HUGE illustration takes up 90% of page space
- Only 1-3 words per concept (single word labels)
- Visual sequences that tell story without narration  
- Characters with emotions showing concepts through actions
- Interactive elements: tracing, coloring, drawing, matching
- No paragraphs of text - only picture descriptions for implementers

Create content including:
1. MASSIVE visual descriptions that dominate the content (describe full-page illustrations)
2. Ultra-minimal text (1-5 words per concept maximum)
3. Visual examples that teach through pictures, not words
4. Key vocabulary as single-word labels with picture definitions only
5. Visual exercise descriptions (no written questions - only picture-based activities)

CRITICAL REQUIREMENTS:
- ELIMINATE 95% OF ALL TEXT - this is for K-2 children who learn visually
- Use ONLY single-word labels or 2-word phrases maximum
- Replace ALL written explanations with visual descriptions for graphic designers
- Every concept must be shown through HUGE, colorful illustrations
- Design like a wordless picture book that teaches through images alone
- Create visual sequences, not text descriptions
- Use visual metaphors and symbols instead of written explanations
- Every exercise should be purely visual: circle pictures, match images, draw answers
- Text content should be under 20 words total per section for K-2 students

REMEMBER: Young children cannot read - they learn through pictures, colors, characters, and hands-on activities!

Format as JSON:
{
  "title": "${sectionOutline.title}",
  "conceptExplanation": "VISUAL SCENE DESCRIPTION: Describe a huge, colorful illustration that teaches the concept...",
  "examples": ["VISUAL EXAMPLE 1: Full-page illustration showing...", "VISUAL EXAMPLE 2: Interactive visual scene with..."],
  "keyTerms": [{"term": "word", "definition": "VISUAL: Picture shows..."}],
  "summary": "Brief summary of key points"
}

Content:`;

    const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
      temperature: 0.7,
      maxTokens: 1500
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        title: sectionOutline.title,
        conceptExplanation: response.content,
        examples: [],
        keyTerms: [],
        summary: ''
      };
    }
  }

  private async generateExercises(
    section: SectionContent, 
    analysis: { suggestedGradeBand: string }, 
    topic: string
  ): Promise<Exercise[]> {
    // Check if this is a fraction-related topic
    if (this.isFractionTopic(section.title, topic)) {
      return await this.generateVisualFractionExercises(section, analysis);
    }

    // Get grade-specific exercise constraints
    const gradeConstraints = GradeLevelContentService.getContentConstraints(
      analysis.suggestedGradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult'
    );

    // Generate traditional text-based exercises for non-fraction topics
    const prompt = `
Create 3 diverse exercises for the section: "${section.title}"

Topic: ${topic}
Grade Level: ${analysis.suggestedGradeBand}
Section Content: ${section.conceptExplanation?.substring(0, 200)}...

${gradeConstraints}

Generate exercises with different types appropriate for this grade level.

CRITICAL EXERCISE REQUIREMENTS:
- Use ONLY exercise types listed as "effective" in the constraints above
- AVOID all exercise types listed as "inappropriate" 
- Keep problems within the maximum steps specified
- Use vocabulary appropriate for the grade level
- Ensure problems are concrete and understandable

Generate exercises with different types:
1. Multiple choice (4 options)
2. Fill in the blank
3. Short answer/open response

Each exercise should:
- Test understanding of section concepts
- Be age-appropriate for ${analysis.suggestedGradeBand}
- Include clear instructions
- Have definitive correct answers

Format as JSON array:
[
  {
    "type": "multiple_choice",
    "prompt": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why A is correct"
  }
]

Exercises:`;

    const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
      temperature: 0.6,
      maxTokens: 1000
    });

    try {
      return JSON.parse(response.content) as Exercise[];
    } catch {
      return [];
    }
  }

  /**
   * Check if the topic should use visual fraction generation
   */
  private isFractionTopic(sectionTitle: string, topic: string): boolean {
    const fractionKeywords = [
      'fraction', 'fractions', 'fractional',
      'part', 'parts', 'whole',
      'numerator', 'denominator',
      'half', 'halves', 'third', 'thirds', 'fourth', 'fourths',
      'quarter', 'quarters', 'eighth', 'eighths'
    ];

    const searchText = `${sectionTitle} ${topic}`.toLowerCase();
    return fractionKeywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Generate visual fraction exercises using the Enhanced Math Content Service
   */
  private async generateVisualFractionExercises(
    section: SectionContent,
    analysis: { suggestedGradeBand: string }
  ): Promise<Exercise[]> {
    try {
      // Extract grade level from grade band
      const gradeLevel = this.extractGradeLevel(analysis.suggestedGradeBand);
      
      // Generate visual fraction problems
      const mathProblems = await this.enhancedMathService.generateMathProblems({
        problem_type: 'fractions',
        topic: section.title,
        difficulty: 'easy',
        grade_level: gradeLevel,
        count: 3,
        format: 'plain',
        include_answer_key: true
      });

      // Convert MathProblem objects to Exercise objects
      return mathProblems.map((problem) => {
        // Type assertion for visual problems
        const visualProblem = problem as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        
        return {
          type: 'short_answer' as const,
          prompt: problem.problem,
          correctAnswer: problem.solution,
          explanation: problem.steps?.join(' ') || 'Visual fraction problem',
          // Store visual properties for later use in PDF generation
          visualData: visualProblem.is_visual ? {
            visual_type: visualProblem.visual_type || '',
            shape: visualProblem.shape || '',
            total_parts: visualProblem.total_parts || 4,
            shaded_parts: visualProblem.shaded_parts || 1
          } : undefined
        };
      });
    } catch (error) {
      debugSystem.error('Content Generation Orchestrator', 'Failed to generate visual fraction exercises', error);
      // Fallback to regular exercises if visual generation fails
      return [];
    }
  }

  /**
   * Extract numeric grade level from grade band string
   */
  private extractGradeLevel(gradeBand: string): number {
    const gradeMap: Record<string, number> = {
      'k-2': 1,
      '3-5': 4,
      '6-8': 7,
      '9-10': 9,
      '11-12': 11,
      'adult': 12
    };
    
    return gradeMap[gradeBand.toLowerCase()] || 4;
  }

  private async generateSolution(exercise: Exercise): Promise<ExerciseSolution> {
    // For now, return the existing correct answer and explanation
    return {
      answer: exercise.correctAnswer,
      explanation: exercise.explanation || 'Solution explanation not yet implemented',
      workingSteps: []
    };
  }

  private async generateMisconceptions(
    section: SectionContent, 
    analysis: { suggestedGradeBand: string }
  ): Promise<Misconception[]> {
    const prompt = `
Identify 2-3 common misconceptions students might have about: "${section.title}"

Grade Level: ${analysis.suggestedGradeBand}
Content: ${section.conceptExplanation?.substring(0, 200)}...

For each misconception:
- Describe the incorrect thinking
- Explain why it's wrong
- Provide the correct understanding

Format as JSON:
[
  {
    "description": "What students might incorrectly think",
    "explanation": "Why this is wrong",
    "correction": "The correct understanding"
  }
]

Misconceptions:`;

    const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
      temperature: 0.6,
      maxTokens: 800
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return [];
    }
  }

  private async validateContent(context: GenerationContext): Promise<ContentValidation> {
    const sections = context.artifacts.sections as SectionContent[];
    const gradeBand = context.state.gradeBand as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult';
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    let totalViolations = 0;

    // Validate each section for grade-level appropriateness
    if (sections && sections.length > 0) {
      sections.forEach((section, index) => {
        if (section.conceptExplanation) {
          const validation = GradeLevelContentService.validateContent(
            section.conceptExplanation,
            gradeBand
          );
          
          if (!validation.isAppropriate) {
            totalViolations += validation.violations.length;
            issues.push(`Section ${index + 1} (${section.title}): ${validation.violations.join(', ')}`);
            suggestions.push(...validation.suggestions.map(s => `Section ${index + 1}: ${s}`));
          }
        }
      });
    }

    // Calculate overall score based on violations
    const maxPossibleViolations = sections ? sections.length * 3 : 3; // Assume max 3 violations per section
    const violationRatio = totalViolations / maxPossibleViolations;
    const overallScore = Math.max(20, Math.round((1 - violationRatio) * 100));

    if (totalViolations === 0) {
      suggestions.push('Content appears to be appropriate for the specified grade level');
    } else {
      suggestions.push(`Content needs revision for grade level ${gradeBand.toUpperCase()}`);
    }

    return {
      overallScore,
      issues,
      suggestions,
      bloomDistribution: { understand: 0.4, apply: 0.3, analyze: 0.3 },
      readabilityScore: overallScore,
      accessibilityScore: overallScore
    };
  }

  /**
   * Extract visual descriptions from section content for image generation
   */
  private extractVisualDescriptions(section: SectionContent): string[] {
    const descriptions: string[] = [];
    
    // Look for VISUAL SCENE DESCRIPTION patterns in the content
    const visualPattern = /VISUAL SCENE DESCRIPTION:\s*([^.!?]*[.!?])/gi;
    
    // Search in concept explanation
    const conceptMatches = section.conceptExplanation.match(visualPattern);
    if (conceptMatches) {
      conceptMatches.forEach(match => {
        const description = match.replace(/VISUAL SCENE DESCRIPTION:\s*/i, '').trim();
        if (description) descriptions.push(description);
      });
    }
    
    // Search in examples
    section.examples?.forEach(example => {
      const exampleMatches = example.match(visualPattern);
      if (exampleMatches) {
        exampleMatches.forEach(match => {
          const description = match.replace(/VISUAL SCENE DESCRIPTION:\s*/i, '').trim();
          if (description) descriptions.push(description);
        });
      }
    });
    
    // If no visual descriptions found, create some based on the section content
    if (descriptions.length === 0) {
      // Create a header image description based on the section title
      descriptions.push(`Colorful educational illustration for "${section.title}" suitable for young learners`);
      
      // Add more specific descriptions based on key terms
      if (section.keyTerms && section.keyTerms.length > 0) {
        const firstTerm = section.keyTerms[0];
        descriptions.push(`Simple cartoon illustration showing ${firstTerm.term} with bright colors and clear details`);
      }
    }
    
    return descriptions;
  }

  private async assembleWorkbook(context: GenerationContext): Promise<Record<string, unknown>> {
    const outline = context.artifacts.outline as WorkbookOutline;
    const sections = context.artifacts.sections as SectionContent[];
    
    // Process sections to replace visual descriptions with actual images
    const processedSections = sections.map(section => {
      let processedConceptExplanation = section.conceptExplanation;
      let processedExamples = [...section.examples || []];
      
      // If section has images, replace visual descriptions with image references
      if (section.images && section.images.length > 0) {
        section.images.forEach((image) => {
          const visualPattern = /VISUAL SCENE DESCRIPTION:\s*([^.!?]*[.!?])/i;
          
          // Replace in concept explanation
          if (visualPattern.test(processedConceptExplanation)) {
            processedConceptExplanation = processedConceptExplanation.replace(
              visualPattern,
              `[IMAGE:${image.url}:${image.description}]`
            );
          }
          
          // Replace in examples
          processedExamples = processedExamples.map(example => {
            if (visualPattern.test(example)) {
              return example.replace(
                visualPattern,
                `[IMAGE:${image.url}:${image.description}]`
              );
            }
            return example;
          });
        });
      }
      
      return {
        ...section,
        conceptExplanation: processedConceptExplanation,
        examples: processedExamples
      };
    });
    
    return {
      id: context.workbookId,
      title: outline?.title || 'Generated Workbook',
      topic: context.input.topic,
      learningObjectives: context.artifacts.learningObjectives || [],
      sections: processedSections,
      metadata: {
        generatedAt: new Date(),
        topicAnalysis: context.artifacts.topicAnalysis,
        validation: context.artifacts.validation
      }
    };
  }
}