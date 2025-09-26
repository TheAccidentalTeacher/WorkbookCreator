import { BaseAPIService, SimpleRateLimiter } from './BaseAPIService';
import { GoogleAuth } from 'google-auth-library';

export interface VertexAIRequest {
  prompt: string;
  context?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  content_type: 'word_problem' | 'explanation' | 'question' | 'scenario';
  subject: 'math' | 'science' | 'english' | 'social_studies';
  grade_level: number;
}

export interface VertexAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface ContentGenerationResult {
  content: string;
  metadata: {
    word_count: number;
    reading_level: number;
    safety_approved: boolean;
    citations?: string[];
  };
}

export interface HealthResponse {
  status: string;
  model_versions: string[];
  quota_remaining: number;
}

export class VertexAIService extends BaseAPIService {
  private projectId: string;
  private location: string;
  private auth: GoogleAuth | null;
  private _isConfigured: boolean;

  constructor() {
    const projectId = process.env.GOOGLE_VERTEX_AI_PROJECT_ID;
    const location = process.env.GOOGLE_VERTEX_AI_LOCATION || 'us-central1';
    
    // Initialize parent class first
    super('', `https://${location}-aiplatform.googleapis.com/v1`, 'VertexAI');
    
    // Initialize properties
    this.projectId = projectId || '';
    this.location = location;
    this.auth = null;
    this._isConfigured = false;
    
    // Make service optional - don't throw error if project ID missing
    if (!projectId) {
      console.warn('[VertexAIService] Project ID not configured - service will be unavailable');
      return;
    }
    
    try {
      this.auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
      this._isConfigured = true;
      
      // Set up rate limiting: 60 requests per minute for standard quota
      this.rateLimiter = new SimpleRateLimiter(60, 60000);
    } catch (error) {
      console.warn('[VertexAIService] Failed to initialize Google Auth - service will be unavailable:', error);
      this._isConfigured = false;
    }
  }

  /**
   * Generate educational content using Vertex AI's text generation model
   */
  async generateContent(request: VertexAIRequest): Promise<ContentGenerationResult> {
    if (!this._isConfigured || !this.auth) {
      console.warn('[VertexAIService] Service not configured - returning mock response');
      return {
        content: `Mock educational content for ${request.subject} at grade ${request.grade_level}: ${request.prompt}`,
        metadata: {
          word_count: 50,
          reading_level: request.grade_level || 5,
          safety_approved: true,
          citations: []
        }
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const endpoint = `/projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-1.5-flash:generateContent`;
      
      const prompt = this.buildEducationalPrompt(request);
      
      const response = await this.makeAuthenticatedRequest<VertexAIResponse>(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.max_tokens || 1024,
            topP: request.top_p || 0.8,
          },
        },
      });

      // Extract the generated text from Gemini response
      const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        content: generatedText,
        metadata: {
          word_count: this.countWords(generatedText),
          reading_level: this.estimateReadingLevel(generatedText),
          safety_approved: this.checkSafetyRatings(response.candidates?.[0]?.safetyRatings || []),
          citations: [], // Gemini API doesn't provide citations in the same format
        },
      };
    } catch (error: unknown) {
      // Enhanced error handling with specific guidance
      const errorObj = error as { response?: { status?: number }; message?: string };
      
      if (errorObj?.response?.status === 404) {
        throw new Error(`Vertex AI model not found. This usually means:\n` +
          `1. The Vertex AI Generative AI API is not enabled for project '${this.projectId}'\n` +
          `2. The model '${this.getModelName()}' is not available in location '${this.location}'\n` +
          `3. Your service account needs additional permissions\n\n` +
          `To fix this:\n` +
          `1. Go to https://console.cloud.google.com/apis/library/aiplatform.googleapis.com\n` +
          `2. Select project '${this.projectId}'\n` +
          `3. Enable the "Vertex AI API"\n` +
          `4. Also enable "Generative AI Studio API" if available\n` +
          `5. Ensure your service account has the 'Vertex AI User' role\n\n` +
          `Original error: ${errorObj?.message || error}`);
      } else if (errorObj?.response?.status === 403) {
        throw new Error(`Vertex AI access denied. Please ensure:\n` +
          `1. Your service account has the 'Vertex AI User' role\n` +
          `2. The Vertex AI API is enabled for project '${this.projectId}'\n` +
          `3. Your project has access to Gemini models\n\n` +
          `Original error: ${errorObj?.message || error}`);
      } else {
        throw new Error(`Vertex AI content generation failed: ${errorObj?.message || error}`);
      }
    }
  }

  private getModelName(): string {
    return 'gemini-1.5-flash';
  }

  /**
   * Generate math word problems with specific parameters
   */
  async generateMathWordProblem(
    topic: string,
    gradeLevel: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<{
    problem: string;
    solution: string;
    hints: string[];
  }> {
    const request: VertexAIRequest = {
      prompt: `Create a ${difficulty} ${topic} word problem appropriate for grade ${gradeLevel}`,
      content_type: 'word_problem',
      subject: 'math',
      grade_level: gradeLevel,
      temperature: 0.8,
      max_tokens: 512,
    };

    const result = await this.generateContent(request);
    
    return this.parseMathWordProblem(result.content);
  }

  /**
   * Generate educational explanations for concepts
   */
  async generateExplanation(
    concept: string,
    subject: 'math' | 'science' | 'english' | 'social_studies',
    gradeLevel: number
  ): Promise<{
    explanation: string;
    examples: string[];
    key_points: string[];
  }> {
    const request: VertexAIRequest = {
      prompt: `Explain ${concept} for grade ${gradeLevel} students`,
      content_type: 'explanation',
      subject: subject,
      grade_level: gradeLevel,
      temperature: 0.6,
      max_tokens: 800,
    };

    const result = await this.generateContent(request);
    
    return this.parseExplanation(result.content);
  }

  /**
   * Build educational prompt with appropriate context and constraints
   */
  private buildEducationalPrompt(request: VertexAIRequest): string {
    const gradeContext = this.getGradeContext(request.grade_level);
    const subjectContext = this.getSubjectContext(request.subject);
    
    return `${gradeContext} ${subjectContext}

${request.context || ''}

Task: ${request.prompt}

Requirements:
- Age-appropriate language for grade ${request.grade_level}
- Educational and engaging content
- Clear and easy to understand
- Safe and appropriate for classroom use

Generate content:`;
  }

  private getGradeContext(gradeLevel: number): string {
    if (gradeLevel <= 3) return "For elementary school students (K-3):";
    if (gradeLevel <= 5) return "For upper elementary students (4-5):";
    if (gradeLevel <= 8) return "For middle school students (6-8):";
    return "For high school students (9-12):";
  }

  private getSubjectContext(subject: string): string {
    const contexts = {
      math: "In mathematics education,",
      science: "In science learning,",
      english: "In language arts,",
      social_studies: "In social studies,",
    };
    return contexts[subject as keyof typeof contexts] || "";
  }

  private async getAccessToken(): Promise<string> {
    if (!this.auth) {
      throw new Error('Google Auth not initialized');
    }
    
    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    
    if (!token.token) {
      throw new Error('Failed to obtain access token from Google Auth');
    }
    
    return token.token;
  }

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: {
      method: string;
      headers: Record<string, string>;
      data?: unknown;
    }
  ): Promise<T> {
    const response = await this.client.request({
      url: endpoint,
      ...options,
    });
    
    if (response.data.predictions && response.data.predictions.length > 0) {
      return response.data.predictions[0] as T;
    }
    
    throw new Error('No predictions returned from Vertex AI');
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private estimateReadingLevel(text: string): number {
    // Simple reading level estimation based on sentence and word length
    const sentences = text.split(/[.!?]+/).length;
    const words = this.countWords(text);
    const avgWordsPerSentence = words / sentences;
    
    // Basic Flesch-Kincaid-like calculation
    let estimatedLevel = Math.round(avgWordsPerSentence * 0.4);
    
    // Adjust based on word complexity (simplified)
    const complexWords = text.split(/\s+/).filter(word => word.length > 6).length;
    const complexityRatio = complexWords / words;
    estimatedLevel += Math.round(complexityRatio * 5);
    
    return Math.max(1, Math.min(12, estimatedLevel));
  }

  private checkSafetyRatings(ratings: Array<{ category: string; probability: string }>): boolean {
    if (!ratings) return true;
    
    return ratings.every(rating => 
      rating.probability === 'NEGLIGIBLE' || rating.probability === 'LOW'
    );
  }

  private parseMathWordProblem(content: string): {
    problem: string;
    solution: string;
    hints: string[];
  } {
    // Simple parsing logic - could be enhanced with more sophisticated NLP
    const lines = content.split('\n').filter(line => line.trim());
    
    let problem = '';
    let solution = '';
    const hints: string[] = [];
    
    let currentSection = 'problem';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('solution') || line.toLowerCase().includes('answer')) {
        currentSection = 'solution';
        continue;
      }
      if (line.toLowerCase().includes('hint') || line.toLowerCase().includes('clue')) {
        currentSection = 'hints';
        continue;
      }
      
      if (currentSection === 'problem') {
        problem += line + ' ';
      } else if (currentSection === 'solution') {
        solution += line + ' ';
      } else if (currentSection === 'hints') {
        hints.push(line.trim());
      }
    }
    
    return {
      problem: problem.trim(),
      solution: solution.trim(),
      hints: hints.filter(h => h.length > 0),
    };
  }

  private parseExplanation(content: string): {
    explanation: string;
    examples: string[];
    key_points: string[];
  } {
    const lines = content.split('\n').filter(line => line.trim());
    
    let explanation = '';
    const examples: string[] = [];
    const keyPoints: string[] = [];
    
    let currentSection = 'explanation';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('example')) {
        currentSection = 'examples';
        continue;
      }
      if (line.toLowerCase().includes('key point') || line.toLowerCase().includes('important')) {
        currentSection = 'keyPoints';
        continue;
      }
      
      if (currentSection === 'explanation') {
        explanation += line + ' ';
      } else if (currentSection === 'examples') {
        examples.push(line.trim());
      } else if (currentSection === 'keyPoints') {
        keyPoints.push(line.trim());
      }
    }
    
    return {
      explanation: explanation.trim(),
      examples: examples.filter(e => e.length > 0),
      key_points: keyPoints.filter(k => k.length > 0),
    };
  }

  protected handleAPIError(error: Error): void {
    console.error('Vertex AI API Error:', {
      message: error.message,
    });
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_VERTEX_AI_PROJECT_ID &&
      (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT)
    );
  }

  /**
   * Validate the configuration by testing API connectivity
   */
  async validateConfiguration(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const accessToken = await this.getAccessToken();
      return !!accessToken;
    } catch (error) {
      console.error('Vertex AI configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Health check for Vertex AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.validateConfiguration();
    } catch (error) {
      console.error('Vertex AI health check failed:', error);
      return false;
    }
  }
}