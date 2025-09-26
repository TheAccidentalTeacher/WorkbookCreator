import { BaseAPIService, SimpleRateLimiter } from './BaseAPIService';

export interface VectorArtRequest {
  prompt: string;
  style: 'educational' | 'cartoon' | 'technical' | 'minimalist' | 'detailed';
  category: 'science' | 'math' | 'history' | 'geography' | 'biology' | 'chemistry' | 'physics';
  age_group: 'elementary' | 'middle_school' | 'high_school';
  format: 'svg' | 'png' | 'pdf';
  size?: 'small' | 'medium' | 'large';
  color_scheme?: 'monochrome' | 'colorful' | 'blue_theme' | 'earth_tones';
}

export interface VectorArtResponse {
  image_id: string;
  image_url: string;
  download_url: string;
  format: string;
  width: number;
  height: number;
  file_size: number;
  generation_time: number;
  metadata: {
    style_applied: string;
    colors_used: string[];
    complexity_level: string;
  };
}

export interface GenerationJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimated_completion?: number;
  result?: VectorArtResponse;
  error_message?: string;
}

export interface HealthResponse {
  status: string;
  queue_length: number;
  estimated_wait_time: number;
}

export class VectorArtService extends BaseAPIService {
  private _isConfigured: boolean;

  constructor() {
    const apiKey = process.env.VECTORART_AI_API_KEY;
    
    // Make service optional - don't throw error if API key missing
    if (!apiKey) {
      console.warn('[VectorArtService] API key not configured - service will be unavailable');
      super('', 'https://api.vectorart.ai/v1', 'VectorArt.ai');
      this._isConfigured = false;
      return;
    }
    
    super(apiKey, 'https://api.vectorart.ai/v1', 'VectorArt.ai');
    this._isConfigured = true;
    
    super(apiKey, 'https://api.vectorart.ai/v1', 'VectorArt.ai');
    
    // Set up rate limiting: 20 requests per minute for free tier
    this.rateLimiter = new SimpleRateLimiter(20, 60000);
  }

  /**
   * Generate educational illustrations using VectorArt.ai
   */
  async generateIllustration(request: VectorArtRequest): Promise<VectorArtResponse> {
    if (!this.isConfigured()) {
      console.warn('[VectorArtService] Service not configured - returning empty result');
      // Return a mock response when service is not configured
      return {
        image_id: 'mock_' + Date.now(),
        image_url: '',
        download_url: '',
        format: request.format || 'svg',
        width: 400,
        height: 300,
        file_size: 0,
        generation_time: 0,
        metadata: {
          style_applied: request.style,
          colors_used: [],
          complexity_level: 'unavailable'
        }
      };
    }

    try {
      const response = await this.makeRequest<VectorArtResponse>('/generate', {
        method: 'POST',
        data: {
          prompt: this.enhanceEducationalPrompt(request),
          style: request.style,
          category: request.category,
          age_group: request.age_group,
          format: request.format || 'svg',
          size: request.size || 'medium',
          color_scheme: request.color_scheme || 'colorful',
          educational_safe: true,
          high_quality: true,
        },
      });

      return response;
    } catch (error) {
      throw new Error(`VectorArt illustration generation failed: ${error}`);
    }
  }

  /**
   * Start an asynchronous generation job for complex illustrations
   */
  async startGenerationJob(request: VectorArtRequest): Promise<GenerationJob> {
    try {
      const response = await this.makeRequest<GenerationJob>('/generate/async', {
        method: 'POST',
        data: {
          prompt: this.enhanceEducationalPrompt(request),
          style: request.style,
          category: request.category,
          age_group: request.age_group,
          format: request.format || 'svg',
          size: request.size || 'medium',
          color_scheme: request.color_scheme || 'colorful',
          educational_safe: true,
          high_quality: true,
        },
      });

      return response;
    } catch (error) {
      throw new Error(`VectorArt job creation failed: ${error}`);
    }
  }

  /**
   * Check the status of an asynchronous generation job
   */
  async checkJobStatus(jobId: string): Promise<GenerationJob> {
    try {
      const response = await this.makeRequest<GenerationJob>(`/jobs/${jobId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(`VectorArt job status check failed: ${error}`);
    }
  }

  /**
   * Generate scientific diagrams (e.g., cell structure, solar system)
   */
  async generateScientificDiagram(
    subject: string,
    type: 'anatomy' | 'chemistry' | 'physics' | 'astronomy' | 'biology',
    gradeLevel: 'elementary' | 'middle_school' | 'high_school'
  ): Promise<VectorArtResponse> {
    const request: VectorArtRequest = {
      prompt: `Scientific diagram of ${subject} for ${gradeLevel.replace('_', ' ')} students`,
      style: 'technical',
      category: this.mapScienceTypeToCategory(type),
      age_group: gradeLevel,
      format: 'svg',
      size: 'large',
      color_scheme: 'colorful',
    };

    return this.generateIllustration(request);
  }

  /**
   * Generate mathematical visual aids (e.g., geometric shapes, number lines)
   */
  async generateMathVisual(
    concept: string,
    visualType: 'geometric' | 'algebraic' | 'statistical' | 'numerical',
    gradeLevel: 'elementary' | 'middle_school' | 'high_school'
  ): Promise<VectorArtResponse> {
    const request: VectorArtRequest = {
      prompt: `Mathematical ${visualType} illustration of ${concept} for ${gradeLevel.replace('_', ' ')} students`,
      style: 'educational',
      category: 'math',
      age_group: gradeLevel,
      format: 'svg',
      size: 'medium',
      color_scheme: 'blue_theme',
    };

    return this.generateIllustration(request);
  }

  /**
   * Generate historical timeline illustrations
   */
  async generateHistoricalIllustration(
    event: string,
    period: string,
    gradeLevel: 'elementary' | 'middle_school' | 'high_school'
  ): Promise<VectorArtResponse> {
    const request: VectorArtRequest = {
      prompt: `Historical illustration of ${event} from ${period} for ${gradeLevel.replace('_', ' ')} students`,
      style: 'detailed',
      category: 'history',
      age_group: gradeLevel,
      format: 'svg',
      size: 'large',
      color_scheme: 'earth_tones',
    };

    return this.generateIllustration(request);
  }

  /**
   * Batch generate multiple related illustrations
   */
  async batchGenerate(requests: VectorArtRequest[]): Promise<GenerationJob[]> {
    try {
      const response = await this.makeRequest<{ jobs: GenerationJob[] }>('/generate/batch', {
        method: 'POST',
        data: {
          requests: requests.map(req => ({
            ...req,
            prompt: this.enhanceEducationalPrompt(req),
            educational_safe: true,
            high_quality: true,
          })),
        },
      });

      return response.jobs;
    } catch (error) {
      throw new Error(`VectorArt batch generation failed: ${error}`);
    }
  }

  /**
   * Get available styles and categories
   */
  async getAvailableOptions(): Promise<{
    styles: string[];
    categories: string[];
    formats: string[];
    color_schemes: string[];
  }> {
    try {
      const response = await this.makeRequest<{
        styles: string[];
        categories: string[];
        formats: string[];
        color_schemes: string[];
      }>('/options', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new Error(`VectorArt options retrieval failed: ${error}`);
    }
  }

  /**
   * Enhance the prompt with educational context and safety guidelines
   */
  private enhanceEducationalPrompt(request: VectorArtRequest): string {
    const ageContext = this.getAgeAppropriateContext(request.age_group);
    const subjectContext = this.getSubjectContext(request.category);
    
    return `${ageContext} ${subjectContext} ${request.prompt}

Requirements:
- Educational and informative
- Age-appropriate content
- Clear and easy to understand
- Safe for classroom use
- Professional quality
- Scientifically/historically accurate where applicable

Style: ${request.style}
Target audience: ${request.age_group.replace('_', ' ')} students`;
  }

  private getAgeAppropriateContext(ageGroup: string): string {
    const contexts = {
      elementary: "For young elementary students (K-5):",
      middle_school: "For middle school students (6-8):",
      high_school: "For high school students (9-12):",
    };
    return contexts[ageGroup as keyof typeof contexts] || "";
  }

  private getSubjectContext(category: string): string {
    const contexts = {
      science: "In science education,",
      math: "In mathematics education,",
      history: "In history education,",
      geography: "In geography education,",
      biology: "In biology education,",
      chemistry: "In chemistry education,",
      physics: "In physics education,",
    };
    return contexts[category as keyof typeof contexts] || "";
  }

  private mapScienceTypeToCategory(type: string): VectorArtRequest['category'] {
    const mapping = {
      anatomy: 'biology' as const,
      chemistry: 'chemistry' as const,
      physics: 'physics' as const,
      astronomy: 'science' as const,
      biology: 'biology' as const,
    };
    return mapping[type as keyof typeof mapping] || 'science';
  }

  /**
   * Download generated image to local storage
   */
  async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await this.client.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`VectorArt image download failed: ${error}`);
    }
  }

  protected handleAPIError(error: Error): void {
    console.error('VectorArt API Error:', {
      message: error.message,
    });
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
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('VectorArt configuration validation failed:', error);
      return false;
    }
  }

  /**
   * Health check for VectorArt service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest<HealthResponse>('/health', {
        method: 'GET',
      });
      return true;
    } catch (error) {
      console.error('VectorArt health check failed:', error);
      return false;
    }
  }
}