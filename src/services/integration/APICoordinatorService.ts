/**
 * API Coordinator Service
 * Orchestrates workflow between content generation APIs and visual rendering
 */

import { BaseAPIService } from './BaseAPIService';
import { BaseVisualService, VisualConfig, ContentVisualMapping, DefaultContentVisualMapping } from './BaseVisualService';

export interface WorksheetSection {
  id: string;
  type: string;
  title?: string;
  requirements: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WorksheetRequest {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  sections: WorksheetSection[];
  preferences?: {
    style?: 'simple' | 'illustrated' | 'interactive';
    difficulty?: 'easy' | 'medium' | 'hard';
    visualTheme?: 'light' | 'dark';
  };
}

export interface GeneratedContent {
  sectionId: string;
  contentType: string;
  data: unknown;
  metadata: {
    source: string;
    generatedAt: Date;
    quality?: number;
  };
}

export interface RenderedVisual {
  sectionId: string;
  visualType: string;
  element: string | HTMLCanvasElement;
  metadata: {
    format: 'svg' | 'canvas' | 'png';
    dimensions: { width: number; height: number };
    generatedAt: Date;
  };
}

export interface GeneratedWorksheet {
  id: string;
  title: string;
  contents: GeneratedContent[];
  visuals: RenderedVisual[];
  metadata: {
    totalSections: number;
    generatedAt: Date;
    processingTime: number;
    apis: string[];
  };
}

export class APICoordinatorService {
  private contentServices: Map<string, BaseAPIService> = new Map();
  private visualServices: Map<string, BaseVisualService> = new Map();
  private contentVisualMapping: ContentVisualMapping;

  constructor(mapping?: ContentVisualMapping) {
    this.contentVisualMapping = mapping || DefaultContentVisualMapping;
  }

  // Register services
  registerContentService(name: string, service: BaseAPIService): void {
    this.contentServices.set(name, service);
  }

  registerVisualService(name: string, service: BaseVisualService): void {
    this.visualServices.set(name, service);
  }

  // Main workflow method
  async generateWorksheet(request: WorksheetRequest): Promise<GeneratedWorksheet> {
    const startTime = Date.now();
    const usedAPIs: string[] = [];

    try {
      console.log(`[Coordinator] Starting worksheet generation: ${request.title}`);

      // Phase 1: Content Generation
      const contentTasks = request.sections.map(section => 
        this.generateSectionContent(section, usedAPIs)
      );
      const contents = await Promise.all(contentTasks);

      // Phase 2: Visual Rendering
      const visualTasks = contents.map(content => 
        this.renderSectionVisual(content, request.preferences)
      );
      const visuals = await Promise.all(visualTasks);

      // Phase 3: Compile Results
      const processingTime = Date.now() - startTime;
      
      const worksheet: GeneratedWorksheet = {
        id: request.id,
        title: request.title,
        contents,
        visuals,
        metadata: {
          totalSections: request.sections.length,
          generatedAt: new Date(),
          processingTime,
          apis: [...new Set(usedAPIs)]
        }
      };

      console.log(`[Coordinator] Worksheet generated in ${processingTime}ms`);
      return worksheet;

    } catch (error) {
      console.error('[Coordinator] Worksheet generation failed:', error);
      throw new Error(`Worksheet generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Content generation for a single section
  private async generateSectionContent(
    section: WorksheetSection, 
    usedAPIs: string[]
  ): Promise<GeneratedContent> {
    const contentService = this.selectContentService(section.type);
    
    if (!contentService) {
      throw new Error(`No content service available for section type: ${section.type}`);
    }

    usedAPIs.push(contentService.constructor.name);

    // Generate content based on section requirements
    const data = await this.generateContentData(contentService, section);

    return {
      sectionId: section.id,
      contentType: section.type,
      data,
      metadata: {
        source: contentService.constructor.name,
        generatedAt: new Date(),
        quality: this.assessContentQuality(data)
      }
    };
  }

  // Visual rendering for a single section
  private async renderSectionVisual(
    content: GeneratedContent,
    preferences?: WorksheetRequest['preferences']
  ): Promise<RenderedVisual> {
    const mapping = this.contentVisualMapping[content.contentType];
    
    if (!mapping) {
      throw new Error(`No visual mapping for content type: ${content.contentType}`);
    }

    const visualService = this.visualServices.get(mapping.visualType);
    
    if (!visualService) {
      throw new Error(`Visual service not found: ${mapping.visualType}`);
    }

    // Apply preferences to visual config
    const config: VisualConfig = {
      width: 600,
      height: 400,
      ...mapping.defaultConfig,
      theme: preferences?.visualTheme || 'light',
      responsive: true
    };

    // Transform data if needed
    const visualData = mapping.dataTransform 
      ? mapping.dataTransform(content.data)
      : content.data;

    // Render the visual
    await visualService.render(visualData);
    const element = await visualService.exportToSVG();

    return {
      sectionId: content.sectionId,
      visualType: mapping.visualType,
      element,
      metadata: {
        format: 'svg',
        dimensions: { 
          width: typeof config.width === 'number' ? config.width : 600,
          height: typeof config.height === 'number' ? config.height : 400
        },
        generatedAt: new Date()
      }
    };
  }

  // Helper methods
  private selectContentService(sectionType: string): BaseAPIService | null {
    // Logic to select the most appropriate content service
    // This could be based on content type, availability, or load balancing
    
    const servicePreferences: Record<string, string[]> = {
      'math-problems': ['symbolab', 'vertex-ai'],
      'science-facts': ['knowledge-graph', 'vertex-ai'],
      'vocabulary': ['vertex-ai', 'openai'],
      'reading-comprehension': ['vertex-ai', 'anthropic']
    };

    const preferredServices = servicePreferences[sectionType] || ['vertex-ai'];
    
    for (const serviceName of preferredServices) {
      const service = this.contentServices.get(serviceName);
      if (service && service.isConfigured()) {
        return service;
      }
    }

    return null;
  }

  private async generateContentData(
    service: BaseAPIService, 
    section: WorksheetSection
  ): Promise<unknown> {
    // This would be implemented by specific content services
    // For now, return a placeholder structure
    return {
      type: section.type,
      requirements: section.requirements,
      generated: true,
      timestamp: new Date().toISOString()
    };
  }

  private assessContentQuality(data: unknown): number {
    // Simple quality assessment
    // In practice, this would analyze content completeness, accuracy, etc.
    if (!data) return 0;
    
    const dataStr = JSON.stringify(data);
    if (dataStr.length < 50) return 0.3;
    if (dataStr.length < 200) return 0.6;
    return 0.9;
  }

  // Validation methods
  async validateServices(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate content services
    for (const [name, service] of this.contentServices) {
      try {
        if (!service.isConfigured()) {
          errors.push(`Content service ${name} is not properly configured`);
        } else {
          const isValid = await service.validateConfiguration();
          if (!isValid) {
            errors.push(`Content service ${name} configuration validation failed`);
          }
        }
      } catch (error) {
        errors.push(`Content service ${name} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Status and monitoring
  getServiceStatus(): Record<string, { configured: boolean; available: boolean }> {
    const status: Record<string, { configured: boolean; available: boolean }> = {};

    for (const [name, service] of this.contentServices) {
      status[name] = {
        configured: service.isConfigured(),
        available: true // This could check actual availability
      };
    }

    return status;
  }
}