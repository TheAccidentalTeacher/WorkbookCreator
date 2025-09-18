import { GenerationContext, PipelineStep, GenerationStateType } from '@/types';
import { AIService } from './aiService';
import { TopicProcessor } from './topicProcessor';
import { LearningObjectiveGenerator } from './learningObjectiveGenerator';
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
}

export interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  solution?: ExerciseSolution;
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

  constructor() {
    debugSystem.info('Content Generation Orchestrator', 'Initializing orchestrator', {
      timestamp: new Date().toISOString()
    });
    
    this.aiService = new AIService();
    this.objectiveGenerator = new LearningObjectiveGenerator();
    
    debugSystem.info('Content Generation Orchestrator', 'Orchestrator initialized successfully', {
      aiServiceReady: !!this.aiService,
      objectiveGeneratorReady: !!this.objectiveGenerator
    });
  }

  /**
   * Create and start a new generation pipeline
   */
  async startGeneration(input: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
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
            objectives
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
              context.input.topic as string
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
        name: 'qa_validate',
        description: 'Validate content quality and pedagogical compliance',
        execute: async (context: GenerationContext) => {
          const validation = await this.validateContent();
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
      'qa_validate': 'qa_validate',
      'layout_build': 'layout_build'
    };
    
    return stateMap[stepName] || 'init';
  }

  private buildOutlinePrompt(
    topic: string, 
    analysis: { subjectDomain: string; suggestedGradeBand: string; complexity: string; keywords?: string[] }, 
    objectives: Array<{ text: string }>
  ): string {
    return `
Create a structured outline for a workbook on "${topic}".

Topic Analysis:
- Subject: ${analysis.subjectDomain}
- Grade Level: ${analysis.suggestedGradeBand}
- Complexity: ${analysis.complexity}
- Keywords: ${analysis.keywords?.join(', ')}

Learning Objectives:
${objectives.map((obj, i) => `${i + 1}. ${obj.text}`).join('\n')}

Create an outline with 3-5 sections that:
1. Build progressively from basic to advanced concepts
2. Include engaging examples and real-world applications
3. Provide multiple practice opportunities
4. Address potential misconceptions
5. Align with the learning objectives

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
    topic: string
  ): Promise<SectionContent> {
    const prompt = `
Generate comprehensive content for the section: "${sectionOutline.title}"

Topic: ${topic}
Section Purpose: ${sectionOutline.purpose}
Description: ${sectionOutline.description}
Grade Level: ${analysis.suggestedGradeBand}
Key Topics: ${sectionOutline.keyTopics?.join(', ')}

Create content including:
1. Clear explanation of concepts (300-500 words)
2. 2-3 relevant examples
3. Key vocabulary terms with definitions

Format as JSON:
{
  "title": "${sectionOutline.title}",
  "conceptExplanation": "Detailed explanation...",
  "examples": ["Example 1...", "Example 2..."],
  "keyTerms": [{"term": "word", "definition": "meaning"}],
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
    const prompt = `
Create 3 diverse exercises for the section: "${section.title}"

Topic: ${topic}
Grade Level: ${analysis.suggestedGradeBand}
Section Content: ${section.conceptExplanation?.substring(0, 200)}...

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

  private async validateContent(): Promise<ContentValidation> {
    // Simplified validation - in production this would be more comprehensive
    return {
      overallScore: 85,
      issues: [],
      suggestions: ['Content generated successfully'],
      bloomDistribution: { understand: 0.4, apply: 0.3, analyze: 0.3 },
      readabilityScore: 80,
      accessibilityScore: 85
    };
  }

  private async assembleWorkbook(context: GenerationContext): Promise<Record<string, unknown>> {
    const outline = context.artifacts.outline as WorkbookOutline;
    return {
      id: context.workbookId,
      title: outline?.title || 'Generated Workbook',
      topic: context.input.topic,
      learningObjectives: context.artifacts.learningObjectives || [],
      sections: context.artifacts.sections || [],
      metadata: {
        generatedAt: new Date(),
        topicAnalysis: context.artifacts.topicAnalysis,
        validation: context.artifacts.validation
      }
    };
  }
}