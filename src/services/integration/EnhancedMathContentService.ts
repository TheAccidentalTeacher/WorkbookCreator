import { BaseAPIService } from './BaseAPIService';

export interface MathProblem {
  id: string;
  problem: string;
  solution: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  grade_level: number;
  latex_formatted?: boolean;
}

// Interface for AI services that can generate content
export interface AIContentService {
  generateContent(prompt: string): Promise<string>;
  isConfigured(): boolean;
}

export interface MathContentRequest {
  problem_type: 'algebra' | 'calculus' | 'geometry' | 'statistics' | 'arithmetic' | 'fractions' | 'decimals';
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  grade_level?: number;
  count?: number;
  format?: 'latex' | 'plain' | 'mixed';
  include_answer_key?: boolean;
}

export interface MathContentResponse {
  problems: MathProblem[];
  total_count: number;
  request_id: string;
}

export interface SolveResponse {
  solution: string;
  steps: string[];
  explanation: string;
}

export interface TopicsResponse {
  topics: string[];
}

export interface HealthResponse {
  status: string;
  timestamp: number;
}

/**
 * Enhanced AI-powered math content generator using OpenAI/Anthropic APIs
 * Replaces Symbolab with specialized prompts for generating printable math worksheets
 */
export class EnhancedMathContentService extends BaseAPIService {
  private _isConfigured: boolean;
  private openaiService: AIContentService | null;
  private anthropicService: AIContentService | null;

  constructor() {
    // This service doesn't need its own API key - it uses existing AI services
    super('', '', 'EnhancedMathContent');
    this._isConfigured = true;
    this.openaiService = null;
    this.anthropicService = null;
  }

  /**
   * Set AI service dependencies
   */
  setAIServices(openaiService: AIContentService | null, anthropicService: AIContentService | null): void {
    this.openaiService = openaiService;
    this.anthropicService = anthropicService;
    this._isConfigured = (openaiService || anthropicService) ? true : false;
  }

  /**
   * Generate math problems using AI with specialized prompts
   */
  async generateMathProblems(request: MathContentRequest): Promise<MathProblem[]> {
    if (!this.isConfigured()) {
      console.warn('[EnhancedMathContentService] Service not configured - returning empty result');
      return [];
    }

    try {
      const prompt = this.buildMathProblemPrompt(request);
      
      // Try OpenAI first, fallback to Anthropic
      let response;
      if (this.openaiService) {
        response = await this.openaiService.generateContent(prompt);
      } else if (this.anthropicService) {
        response = await this.anthropicService.generateContent(prompt);
      } else {
        throw new Error('No AI service available');
      }

      return this.parseMathProblemsResponse(response, request);
    } catch (error) {
      console.error('[EnhancedMathContentService] Generation failed:', error);
      return [];
    }
  }

  /**
   * Solve a specific math problem with step-by-step solution
   */
  async solveProblem(problem: string): Promise<{
    solution: string;
    steps: string[];
    explanation: string;
  }> {
    if (!this.isConfigured()) {
      console.warn('[EnhancedMathContentService] Service not configured - returning empty result');
      return {
        solution: '',
        steps: [],
        explanation: 'Enhanced Math Content service not configured'
      };
    }

    try {
      const prompt = this.buildSolveProblemPrompt(problem);
      
      let response;
      if (this.openaiService) {
        response = await this.openaiService.generateContent(prompt);
      } else if (this.anthropicService) {
        response = await this.anthropicService.generateContent(prompt);
      } else {
        throw new Error('No AI service available');
      }

      return this.parseSolutionResponse(response);
    } catch (error) {
      console.error('[EnhancedMathContentService] Problem solving failed:', error);
      return {
        solution: '',
        steps: [],
        explanation: `Problem solving failed: ${error}`
      };
    }
  }

  /**
   * Generate problems for specific curriculum standards
   */
  async generateStandardsAlignedProblems(
    standard: string,
    count: number = 5
  ): Promise<MathProblem[]> {
    const request: MathContentRequest = {
      problem_type: 'algebra', // Default, will be overridden by standard
      count: count,
      format: 'latex',
      include_answer_key: true
    };

    const prompt = this.buildStandardsAlignedPrompt(standard, count);
    
    try {
      let response;
      if (this.openaiService) {
        response = await this.openaiService.generateContent(prompt);
      } else if (this.anthropicService) {
        response = await this.anthropicService.generateContent(prompt);
      } else {
        throw new Error('No AI service available');
      }

      return this.parseMathProblemsResponse(response, request);
    } catch (error) {
      console.error('[EnhancedMathContentService] Standards-aligned generation failed:', error);
      return [];
    }
  }

  /**
   * Get available topics for a specific problem type
   */
  async getAvailableTopics(problemType: string): Promise<string[]> {
    // Return predefined topics based on problem type
    const topicMap: Record<string, string[]> = {
      algebra: [
        'Linear Equations', 'Quadratic Equations', 'Systems of Equations',
        'Inequalities', 'Polynomials', 'Factoring', 'Exponents', 'Radicals'
      ],
      geometry: [
        'Area and Perimeter', 'Volume and Surface Area', 'Angles',
        'Triangles', 'Circles', 'Polygons', 'Coordinate Geometry', 'Similarity'
      ],
      arithmetic: [
        'Addition', 'Subtraction', 'Multiplication', 'Division',
        'Order of Operations', 'Number Properties', 'Estimation'
      ],
      fractions: [
        'Adding Fractions', 'Subtracting Fractions', 'Multiplying Fractions',
        'Dividing Fractions', 'Mixed Numbers', 'Equivalent Fractions'
      ],
      decimals: [
        'Adding Decimals', 'Subtracting Decimals', 'Multiplying Decimals',
        'Dividing Decimals', 'Rounding', 'Decimal Place Value'
      ],
      statistics: [
        'Mean, Median, Mode', 'Probability', 'Data Analysis',
        'Graphs and Charts', 'Standard Deviation', 'Normal Distribution'
      ],
      calculus: [
        'Limits', 'Derivatives', 'Integrals', 'Chain Rule',
        'Product Rule', 'Quotient Rule', 'Applications'
      ]
    };

    return topicMap[problemType] || [];
  }

  /**
   * Build specialized prompt for math problem generation
   */
  private buildMathProblemPrompt(request: MathContentRequest): string {
    const gradeLevel = request.grade_level || 8;
    const difficulty = request.difficulty || 'medium';
    const count = request.count || 5;
    const problemType = request.problem_type;
    const topic = request.topic || '';

    // Check if this is a fraction-related topic that should use visual generation
    if (this.isFractionTopic(problemType, topic)) {
      return this.buildVisualFractionPrompt(request);
    }

    return `You are an expert mathematics educator creating printable worksheet problems.

TASK: Generate ${count} ${difficulty} difficulty ${problemType} problems suitable for grade ${gradeLevel} students.
${topic ? `TOPIC FOCUS: ${topic}` : ''}

REQUIREMENTS:
1. Problems must be appropriate for grade ${gradeLevel} level
2. Difficulty: ${difficulty} (easy = basic concepts, medium = standard application, hard = multi-step/complex)
3. Each problem should be solvable with pen and paper
4. Include clear, step-by-step solutions
5. Format for printable worksheets
6. Use LaTeX notation for mathematical expressions where appropriate

OUTPUT FORMAT (JSON):
{
  "problems": [
    {
      "id": "prob_1",
      "problem": "Problem statement with LaTeX if needed: $$x^2 + 3x - 4 = 0$$",
      "solution": "Final answer",
      "steps": ["Step 1: explanation", "Step 2: explanation", "Step 3: explanation"],
      "difficulty": "${difficulty}",
      "topic": "${topic || problemType}",
      "grade_level": ${gradeLevel},
      "latex_formatted": true
    }
  ]
}

Generate diverse, engaging problems that help students practice key concepts.`;
  }

  /**
   * Check if the topic should use visual fraction generation
   */
  private isFractionTopic(problemType: string, topic: string): boolean {
    const fractionKeywords = [
      'fraction', 'fractions', 'fractional',
      'part', 'parts', 'whole',
      'numerator', 'denominator',
      'half', 'halves', 'third', 'thirds', 'fourth', 'fourths',
      'quarter', 'quarters', 'eighth', 'eighths'
    ];

    const searchText = `${problemType} ${topic}`.toLowerCase();
    return fractionKeywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Build specialized prompt for visual fraction problems
   */
  private buildVisualFractionPrompt(request: MathContentRequest): string {
    const gradeLevel = request.grade_level || 3;
    const difficulty = request.difficulty || 'easy';
    const count = request.count || 6;

    return `Generate ${count} visual fraction worksheet problems for grade ${gradeLevel} students.

IMPORTANT: Generate problems that can be represented with simple geometric shapes (circles, rectangles, squares).

Problem Types Needed:
1. "What fraction is shaded?" - Show a shape divided into parts with some shaded
2. "Color [fraction] of the shape" - Show empty shapes for students to color
3. "Circle the larger fraction" - Show two shapes for comparison

For each problem, provide:
- Problem type: "identify_fraction", "color_fraction", or "compare_fractions"
- Shape type: "circle", "rectangle", "square", "triangle"
- Total parts: number (2-12 for grade ${gradeLevel})
- Shaded parts: number
- Instruction: clear, simple text
- Grade-appropriate difficulty: ${difficulty}

OUTPUT FORMAT (JSON):
{
  "problems": [
    {
      "id": "prob_1",
      "visual_type": "identify_fraction",
      "shape": "circle",
      "total_parts": 4,
      "shaded_parts": 3,
      "problem": "What fraction is shaded?",
      "solution": "3/4",
      "difficulty": "${difficulty}",
      "topic": "Visual Fractions",
      "grade_level": ${gradeLevel},
      "is_visual": true
    }
  ]
}

Focus on:
- Simple fractions appropriate for grade ${gradeLevel}
- Visual clarity over complexity
- Variety of shapes and problem types
- Clear, concise instructions`;
  }

  /**
   * Build prompt for solving individual problems
   */
  private buildSolveProblemPrompt(problem: string): string {
    return `You are an expert mathematics tutor providing step-by-step solutions.

PROBLEM TO SOLVE: ${problem}

REQUIREMENTS:
1. Provide the final solution
2. Show all steps clearly and logically
3. Explain the reasoning for each step
4. Use proper mathematical notation
5. Format for educational clarity

OUTPUT FORMAT (JSON):
{
  "solution": "Final answer",
  "steps": ["Step 1 with explanation", "Step 2 with explanation", ...],
  "explanation": "Overall explanation of the solution approach"
}

Provide a complete, educational solution.`;
  }

  /**
   * Build prompt for standards-aligned problems
   */
  private buildStandardsAlignedPrompt(standard: string, count: number): string {
    return `You are an expert mathematics educator creating problems aligned to specific curriculum standards.

STANDARD: ${standard}
COUNT: ${count} problems

REQUIREMENTS:
1. Problems must directly align with the specified standard
2. Include variety in problem presentation
3. Ensure age-appropriate difficulty
4. Provide complete solutions
5. Format for printable worksheets

OUTPUT FORMAT (JSON):
{
  "problems": [
    {
      "id": "std_prob_1",
      "problem": "Problem statement",
      "solution": "Final answer",
      "steps": ["Detailed solution steps"],
      "difficulty": "medium",
      "topic": "Topic name",
      "grade_level": 8,
      "latex_formatted": true
    }
  ]
}

Create engaging, standards-aligned problems.`;
  }

  /**
   * Parse AI response into MathProblem objects
   */
  private parseMathProblemsResponse(response: string, request: MathContentRequest): MathProblem[] {
    try {
      // Extract JSON from response if it's wrapped in other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.problems && Array.isArray(parsed.problems)) {
        return parsed.problems.map((prob: Record<string, unknown>, index: number) => {
          const baseProblem: MathProblem = {
            id: (prob.id as string) || `generated_${Date.now()}_${index}`,
            problem: (prob.problem as string) || '',
            solution: (prob.solution as string) || '',
            steps: Array.isArray(prob.steps) ? prob.steps as string[] : [],
            difficulty: (['easy', 'medium', 'hard'].includes(prob.difficulty as string) 
              ? prob.difficulty as 'easy' | 'medium' | 'hard' 
              : request.difficulty || 'medium'),
            topic: (prob.topic as string) || request.topic || request.problem_type,
            grade_level: (prob.grade_level as number) || request.grade_level || 8,
            latex_formatted: (prob.latex_formatted as boolean) || false
          };

          // If this is a visual fraction problem, add visual properties
          if (prob.is_visual || prob.visual_type) {
            return {
              ...baseProblem,
              visual_type: prob.visual_type as string,
              shape: prob.shape as string,
              total_parts: prob.total_parts as number,
              shaded_parts: prob.shaded_parts as number,
              is_visual: true
            };
          }

          return baseProblem;
        });
      }
    } catch (error) {
      console.error('[EnhancedMathContentService] Failed to parse problems response:', error);
    }
    
    return [];
  }

  /**
   * Parse AI response for problem solutions
   */
  private parseSolutionResponse(response: string): {
    solution: string;
    steps: string[];
    explanation: string;
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      
      const parsed = JSON.parse(jsonStr);
      
      return {
        solution: parsed.solution || '',
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        explanation: parsed.explanation || ''
      };
    } catch (error) {
      console.error('[EnhancedMathContentService] Failed to parse solution response:', error);
      return {
        solution: '',
        steps: [],
        explanation: 'Failed to parse solution'
      };
    }
  }

  protected handleAPIError(error: Error): void {
    console.error('Enhanced Math Content Service Error:', {
      message: error.message,
    });
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    return this.isConfigured();
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this._isConfigured && !!(this.openaiService || this.anthropicService);
  }

  /**
   * Validate the configuration
   */
  async validateConfiguration(): Promise<boolean> {
    return this.isConfigured();
  }
}