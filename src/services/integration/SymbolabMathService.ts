import { BaseAPIService, SimpleRateLimiter } from './BaseAPIService';

export interface MathProblem {
  id: string;
  problem: string;
  solution: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  grade_level: number;
}

export interface SymbolabRequest {
  problem_type: 'algebra' | 'calculus' | 'geometry' | 'statistics';
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  grade_level?: number;
  count?: number;
}

export interface SymbolabResponse {
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

export class SymbolabMathService extends BaseAPIService {
  private _isConfigured: boolean;

  constructor() {
    const apiKey = process.env.SYMBOLAB_API_KEY;
    
    // Make service optional - don't throw error if API key missing
    if (!apiKey) {
      console.warn('[SymbolabMathService] API key not configured - service will be unavailable');
      super('', 'https://api.symbolab.com/v1', 'Symbolab');
      this._isConfigured = false;
      return;
    }
    
    super(apiKey, 'https://api.symbolab.com/v1', 'Symbolab');
    this._isConfigured = true;
    
    // Set up rate limiting: 100 requests per minute for free tier
    this.rateLimiter = new SimpleRateLimiter(100, 60000);
  }

  /**
   * Generate math problems based on specified criteria
   */
  async generateMathProblems(request: SymbolabRequest): Promise<MathProblem[]> {
    if (!this.isConfigured()) {
      console.warn('[SymbolabMathService] Service not configured - returning empty result');
      return [];
    }

    try {
      const response = await this.makeRequest<SymbolabResponse>('/problems/generate', {
        method: 'POST',
        data: {
          problem_type: request.problem_type,
          topic: request.topic,
          difficulty: request.difficulty || 'medium',
          grade_level: request.grade_level || 8,
          count: request.count || 5,
        },
      });

      return response.problems;
    } catch (error) {
      throw new Error(
        `Symbolab math problem generation failed: ${error}`
      );
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
      console.warn('[SymbolabMathService] Service not configured - returning empty result');
      return {
        solution: '',
        steps: [],
        explanation: 'Symbolab service not configured'
      };
    }

    try {
      const response = await this.makeRequest<SolveResponse>('/solver/solve', {
        method: 'POST',
        data: {
          problem: problem,
          show_steps: true,
          include_explanation: true,
        },
      });

      return {
        solution: response.solution,
        steps: response.steps || [],
        explanation: response.explanation || '',
      };
    } catch (error) {
      throw new Error(
        `Symbolab problem solving failed: ${error}`
      );
    }
  }

  /**
   * Generate problems for specific curriculum standards
   */
  async generateStandardsAlignedProblems(
    standard: string,
    count: number = 5
  ): Promise<MathProblem[]> {
    try {
      const response = await this.makeRequest<SymbolabResponse>('/problems/standards', {
        method: 'POST',
        data: {
          standard: standard,
          count: count,
        },
      });

      return response.problems;
    } catch (error) {
      throw new Error(
        `Symbolab standards-aligned generation failed: ${error}`
      );
    }
  }

  /**
   * Get available topics for a specific problem type
   */
  async getAvailableTopics(problemType: string): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ topics: string[] }>('/topics', {
        method: 'GET',
        params: {
          problem_type: problemType,
        },
      });

      return response.topics;
    } catch (error) {
      throw new Error(
        `Symbolab topics retrieval failed: ${error}`
      );
    }
  }

  protected handleAPIError(error: Error): void {
    console.error('Symbolab API Error:', {
      message: error.message,
    });
  }

  /**
   * Check service health and API key validity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest<HealthResponse>('/health', {
        method: 'GET',
      });
      return true;
    } catch (error) {
      console.error('Symbolab health check failed:', error);
      return false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this._isConfigured;
  }

  /**
   * Validate the configuration by testing API connectivity
   */
  async validateConfiguration(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      return await this.healthCheck();
    } catch (error) {
      console.error('Symbolab configuration validation failed:', error);
      return false;
    }
  }
}