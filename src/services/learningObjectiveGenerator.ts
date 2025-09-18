import { AIService } from './aiService';
import { LearningObjective, BloomLevelType, GradeBandType, SubjectDomainType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { debugSystem } from '../utils/debugSystem';

// Bloom's taxonomy verbs by level and grade band
const BLOOM_VERBS = {
  'k-2': {
    remember: ['identify', 'name', 'list', 'point to', 'tell', 'repeat', 'recognize'],
    understand: ['explain', 'describe', 'show', 'match', 'compare', 'give examples'],
    apply: ['use', 'practice', 'solve', 'demonstrate', 'try', 'complete'],
    analyze: ['sort', 'group', 'find differences', 'break down', 'organize'],
    evaluate: ['choose', 'decide', 'judge', 'rate', 'pick the best'],
    create: ['make', 'build', 'design', 'invent', 'combine', 'construct']
  },
  '3-5': {
    remember: ['recall', 'identify', 'recognize', 'list', 'name', 'state', 'define'],
    understand: ['explain', 'interpret', 'summarize', 'classify', 'compare', 'exemplify'],
    apply: ['execute', 'implement', 'solve', 'use', 'demonstrate', 'operate'],
    analyze: ['differentiate', 'organize', 'attribute', 'compare', 'deconstruct'],
    evaluate: ['check', 'critique', 'judge', 'test', 'evaluate', 'assess'],
    create: ['generate', 'plan', 'produce', 'construct', 'design', 'compose']
  },
  '6-8': {
    remember: ['recognize', 'recall', 'identify', 'retrieve', 'name', 'locate', 'find'],
    understand: ['interpret', 'summarize', 'infer', 'paraphrase', 'classify', 'explain'],
    apply: ['execute', 'implement', 'carry out', 'use', 'demonstrate', 'solve'],
    analyze: ['differentiate', 'organize', 'attribute', 'outline', 'find coherence', 'deconstruct'],
    evaluate: ['check', 'critique', 'judge', 'hypothesize', 'experiment', 'monitor'],
    create: ['generate', 'plan', 'produce', 'construct', 'design', 'compose']
  },
  '9-12': {
    remember: ['recognize', 'recall', 'identify', 'retrieve', 'name', 'locate', 'find'],
    understand: ['interpret', 'summarize', 'infer', 'paraphrase', 'classify', 'explain', 'compare'],
    apply: ['execute', 'implement', 'carry out', 'use', 'demonstrate', 'solve', 'operate'],
    analyze: ['differentiate', 'organize', 'attribute', 'outline', 'find coherence', 'deconstruct', 'structure'],
    evaluate: ['check', 'critique', 'judge', 'hypothesize', 'experiment', 'monitor', 'test'],
    create: ['generate', 'plan', 'produce', 'construct', 'design', 'compose', 'formulate']
  }
};

// Learning objective templates
const OBJECTIVE_TEMPLATES = {
  remember: [
    'Students will be able to {verb} {content} {context}.',
    'Given {context}, students will {verb} {content}.',
    'Students will {verb} key {content} related to {topic}.'
  ],
  understand: [
    'Students will be able to {verb} {content} in their own words.',
    'Students will {verb} the relationship between {content} and {context}.',
    'Students will {verb} how {content} affects {context}.'
  ],
  apply: [
    'Students will be able to {verb} {content} to solve {context}.',
    'Given {context}, students will {verb} {content} to demonstrate understanding.',
    'Students will {verb} {content} in new {context}.'
  ],
  analyze: [
    'Students will be able to {verb} {content} to identify {context}.',
    'Students will {verb} the components of {content} and explain their {context}.',
    'Students will {verb} {content} to determine {context}.'
  ],
  evaluate: [
    'Students will be able to {verb} {content} based on {context}.',
    'Students will {verb} the effectiveness of {content} in {context}.',
    'Students will {verb} different {content} and justify their choice.'
  ],
  create: [
    'Students will be able to {verb} {content} that demonstrates {context}.',
    'Students will {verb} an original {content} incorporating {context}.',
    'Students will {verb} and present {content} showing {context}.'
  ]
};

export interface ObjectiveGenerationOptions {
  count: number;
  bloomDistribution?: Record<BloomLevelType, number>;
  complexity?: 'basic' | 'intermediate' | 'advanced';
  includePrerequisites?: boolean;
  customPrompt?: string;
}

export class LearningObjectiveGenerator {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate learning objectives for a topic
   */
  async generateObjectives(
    topic: string,
    subjectDomain: SubjectDomainType,
    gradeBand: GradeBandType,
    options: ObjectiveGenerationOptions = { count: 3 }
  ): Promise<LearningObjective[]> {
    const perfLabel = 'learningObjectiveGenerator.generateObjectives';
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('Learning Objective Generator', 'Starting objective generation', {
      topic,
      subjectDomain,
      gradeBand,
      options,
      timestamp: new Date().toISOString()
    });

    try {
      // Create the generation prompt
      const prompt = this.buildObjectivePrompt(topic, subjectDomain, gradeBand, options);
      debugSystem.debug('Learning Objective Generator', 'Generated prompt', {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 200) + '...'
      });
      
      // Generate objectives using AI
      debugSystem.debug('Learning Objective Generator', 'Calling AI service for objective generation');
      const response = await this.aiService.generateCompletion(
        prompt,
        'gpt-3.5-turbo', // Use faster model
        {
          temperature: 0.7,
          maxTokens: 1000, // Reduced from 2000
          systemMessage: this.getSystemMessage(subjectDomain, gradeBand)
        }
      );

      debugSystem.debug('Learning Objective Generator', 'AI response received', {
        contentLength: response.content.length,
        tokenUsage: response.tokenUsage,
        cost: response.cost
      });

      // Parse and validate the generated objectives
      debugSystem.debug('Learning Objective Generator', 'Parsing and validating objectives');
      const objectives = await this.parseAndValidateObjectives(
        response.content,
        gradeBand
      );

      debugSystem.endPerformance(perfLabel, 'Learning Objective Generator');
      debugSystem.info('Learning Objective Generator', 'Objective generation completed', {
        generatedCount: objectives.length,
        requestedCount: options.count,
        bloomLevels: objectives.map(obj => obj.bloomLevel),
        cost: response.cost
      });

      return objectives;
    } catch (error) {
      debugSystem.endPerformance(perfLabel, 'Learning Objective Generator');
      debugSystem.error('Learning Objective Generator', 'Objective generation failed', {
        topic,
        subjectDomain,
        gradeBand,
        options,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Generate a single learning objective
   */
  async generateSingleObjective(
    topic: string,
    bloomLevel: BloomLevelType,
    subjectDomain: SubjectDomainType,
    gradeBand: GradeBandType
  ): Promise<LearningObjective> {
    const verb = this.selectVerb(bloomLevel, gradeBand);
    
    const prompt = `
Create a single, specific learning objective for the topic "${topic}" that:
- Uses the Bloom's taxonomy level: ${bloomLevel}
- Uses one of these verbs: ${verb}
- Is appropriate for ${gradeBand} grade level
- Is specific and measurable
- Relates to ${subjectDomain}

Format: "Students will be able to..."

Objective:`;

    const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
      temperature: 0.6,
      maxTokens: 200
    });

    const objectiveText = response.content.trim();
    
    return {
      id: uuidv4(),
      text: objectiveText,
      bloomLevel,
      smartCriteria: await this.evaluateSMARTCriteria(objectiveText),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Validate and improve existing objectives
   */
  async validateAndImproveObjectives(
    objectives: LearningObjective[],
    subjectDomain: SubjectDomainType,
    gradeBand: GradeBandType
  ): Promise<LearningObjective[]> {
    const improvedObjectives: LearningObjective[] = [];

    for (const objective of objectives) {
      const analysis = await this.analyzeObjective(objective, subjectDomain, gradeBand);
      
      if (analysis.needsImprovement) {
        const improved = await this.improveObjective(objective, analysis.suggestions);
        improvedObjectives.push(improved);
      } else {
        improvedObjectives.push(objective);
      }
    }

    return improvedObjectives;
  }

  private buildObjectivePrompt(
    topic: string,
    subjectDomain: SubjectDomainType,
    gradeBand: GradeBandType,
    options: ObjectiveGenerationOptions
  ): string {
    const bloomDistribution = options.bloomDistribution || this.getDefaultBloomDistribution(gradeBand);
    const complexity = options.complexity || 'intermediate';

    return `
Create ${options.count} learning objectives for the topic: "${topic}"

Requirements:
- Subject: ${subjectDomain}
- Grade level: ${gradeBand}
- Complexity: ${complexity}
- Follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Use appropriate Bloom's taxonomy verbs for each level
- Ensure objectives build upon each other (scaffolding)

Bloom's Distribution:
${Object.entries(bloomDistribution).map(([level, percentage]) => 
  `- ${level}: ${Math.round(percentage * 100)}%`).join('\n')}

Each objective should:
1. Start with "Students will be able to..." or "Given [context], students will..."
2. Use specific, measurable action verbs
3. Include clear criteria for success
4. Be appropriate for the target grade level
5. Connect to the main topic

Format as JSON array:
[
  {
    "text": "Learning objective text",
    "bloomLevel": "remember|understand|apply|analyze|evaluate|create",
    "rationale": "Brief explanation of why this objective is important"
  }
]

Learning Objectives:`;
  }

  private getSystemMessage(subjectDomain: SubjectDomainType, gradeBand: GradeBandType): string {
    return `You are an expert curriculum designer specializing in ${subjectDomain} education for ${gradeBand} students. 

Your expertise includes:
- Creating developmentally appropriate learning objectives
- Applying Bloom's taxonomy effectively
- Ensuring SMART criteria compliance
- Understanding cognitive load theory
- Implementing scaffolding principles
- Aligning with educational standards

Always consider:
- Student developmental stage
- Prior knowledge assumptions
- Appropriate cognitive demand
- Clear assessment possibilities
- Real-world relevance
- Cultural responsiveness`;
  }

  private async parseAndValidateObjectives(
    content: string,
    gradeBand: GradeBandType
  ): Promise<LearningObjective[]> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      const objectives: LearningObjective[] = [];

      for (const item of parsed) {
        if (item.text && item.bloomLevel) {
          const objective: LearningObjective = {
            id: uuidv4(),
            text: item.text,
            bloomLevel: item.bloomLevel as BloomLevelType,
            smartCriteria: await this.evaluateSMARTCriteria(item.text),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          objectives.push(objective);
        }
      }

      return objectives;
    } catch {
      // Fallback: parse as plain text
      return this.parseTextObjectives(content, gradeBand);
    }
  }

  private async parseTextObjectives(content: string, _gradeBand: GradeBandType): Promise<LearningObjective[]> {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const objectives: LearningObjective[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes('students will')) {
        const bloomLevel = this.inferBloomLevel(line);
        const objective: LearningObjective = {
          id: uuidv4(),
          text: line.trim(),
          bloomLevel,
          smartCriteria: await this.evaluateSMARTCriteria(line),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        objectives.push(objective);
      }
    }

    return objectives;
  }

  private async evaluateSMARTCriteria(objectiveText: string): Promise<{
    specific: boolean;
    measurable: boolean;
    achievable: boolean;
    relevant: boolean;
    timeBound: boolean;
  }> {
    // Simple heuristic evaluation - could be enhanced with AI
    return {
      specific: objectiveText.includes('will be able to') && objectiveText.length > 20,
      measurable: /\b(identify|demonstrate|explain|create|analyze|evaluate|apply)\b/i.test(objectiveText),
      achievable: true, // Assume achievable unless proven otherwise
      relevant: true, // Assume relevant to the topic
      timeBound: true // Assume implicitly time-bound within the course/lesson
    };
  }

  private inferBloomLevel(text: string): BloomLevelType {
    const lowerText = text.toLowerCase();
    
    if (/\b(remember|recall|identify|recognize|list|name|state|define)\b/.test(lowerText)) {
      return 'remember';
    } else if (/\b(understand|explain|interpret|summarize|classify|compare)\b/.test(lowerText)) {
      return 'understand';
    } else if (/\b(apply|execute|implement|solve|use|demonstrate)\b/.test(lowerText)) {
      return 'apply';
    } else if (/\b(analyze|differentiate|organize|attribute|outline)\b/.test(lowerText)) {
      return 'analyze';
    } else if (/\b(evaluate|check|critique|judge|test|assess)\b/.test(lowerText)) {
      return 'evaluate';
    } else if (/\b(create|generate|plan|produce|construct|design)\b/.test(lowerText)) {
      return 'create';
    }
    
    return 'understand'; // Default fallback
  }

  private selectTemplate(bloomLevel: BloomLevelType): string {
    const templates = OBJECTIVE_TEMPLATES[bloomLevel];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private selectVerb(bloomLevel: BloomLevelType, gradeBand: GradeBandType): string {
    const gradeKey = gradeBand as keyof typeof BLOOM_VERBS || '6-8';
    const verbs = BLOOM_VERBS[gradeKey]?.[bloomLevel] || BLOOM_VERBS['6-8'][bloomLevel];
    return verbs[Math.floor(Math.random() * verbs.length)];
  }

  private getDefaultBloomDistribution(gradeBand: GradeBandType): Record<BloomLevelType, number> {
    switch (gradeBand) {
      case 'k-2':
        return {
          remember: 0.4,
          understand: 0.3,
          apply: 0.2,
          analyze: 0.1,
          evaluate: 0.0,
          create: 0.0
        };
      case '3-5':
        return {
          remember: 0.3,
          understand: 0.3,
          apply: 0.25,
          analyze: 0.1,
          evaluate: 0.05,
          create: 0.0
        };
      case '6-8':
        return {
          remember: 0.2,
          understand: 0.3,
          apply: 0.25,
          analyze: 0.15,
          evaluate: 0.05,
          create: 0.05
        };
      default: // 9-12, adult
        return {
          remember: 0.15,
          understand: 0.25,
          apply: 0.25,
          analyze: 0.2,
          evaluate: 0.1,
          create: 0.05
        };
    }
  }

  private async analyzeObjective(
    objective: LearningObjective,
    subjectDomain: SubjectDomainType,
    gradeBand: GradeBandType
  ): Promise<{
    needsImprovement: boolean;
    suggestions: string[];
    strengths: string[];
  }> {
    // Placeholder for objective analysis
    // In a full implementation, this would use AI to analyze the objective
    return {
      needsImprovement: false,
      suggestions: [],
      strengths: ['Clear action verb', 'Appropriate for grade level']
    };
  }

  private async improveObjective(
    objective: LearningObjective,
    suggestions: string[]
  ): Promise<LearningObjective> {
    // Placeholder for objective improvement
    // In a full implementation, this would use AI to improve the objective based on suggestions
    return {
      ...objective,
      updatedAt: new Date()
    };
  }
}