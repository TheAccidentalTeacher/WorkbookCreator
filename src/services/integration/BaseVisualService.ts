/**
 * Base Visual Rendering Service
 * Provides common functionality for creating visual worksheet elements
 */

import React from 'react';

export interface VisualConfig {
  width: number | 'auto';
  height: number | 'auto';
  backgroundColor?: string;
  theme?: 'light' | 'dark';
  responsive?: boolean;
}

export interface ExportOptions {
  format: 'svg' | 'canvas' | 'png' | 'pdf';
  quality?: number;
  scale?: number;
}

export interface VisualElement {
  id: string;
  type: string;
  data: unknown;
  config: VisualConfig;
}

export abstract class BaseVisualService {
  protected containerRef: React.RefObject<HTMLDivElement | null>;
  protected config: VisualConfig;
  protected isInitialized: boolean = false;

  constructor(config: VisualConfig) {
    this.config = config;
    this.containerRef = React.createRef();
  }

  // Abstract methods to be implemented by concrete services
  abstract render(data: unknown): Promise<void>;
  abstract exportToSVG(): Promise<string>;
  abstract exportToCanvas(): Promise<HTMLCanvasElement>;
  abstract clear(): void;
  abstract resize(width: number, height: number): void;

  // Common utility methods
  protected generateId(): string {
    return `visual-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected validateData(data: unknown, requiredFields: string[]): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const dataObj = data as Record<string, unknown>;
    return requiredFields.every(field => field in dataObj);
  }

  protected applyResponsiveConfig(): VisualConfig {
    if (!this.config.responsive) {
      return this.config;
    }

    // Apply responsive adjustments based on container size
    const container = this.containerRef.current;
    if (!container) {
      return this.config;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const width = this.config.width === 'auto' ? containerWidth : 
                  Math.min(this.config.width, containerWidth);
    const height = this.config.height === 'auto' ? containerHeight : 
                   Math.min(this.config.height, containerHeight);

    return {
      ...this.config,
      width,
      height
    };
  }

  // Export functionality
  async exportTo(options: ExportOptions): Promise<string | HTMLCanvasElement> {
    switch (options.format) {
      case 'svg':
        return await this.exportToSVG();
      case 'canvas':
        return await this.exportToCanvas();
      case 'png':
        const canvas = await this.exportToCanvas();
        return canvas.toDataURL('image/png', options.quality || 0.9);
      default:
        throw new Error(`Export format ${options.format} not supported`);
    }
  }

  // Lifecycle methods
  protected onMount(): void {
    this.isInitialized = true;
  }

  protected onUnmount(): void {
    this.clear();
    this.isInitialized = false;
  }

  // Error handling
  protected handleRenderError(error: Error): void {
    console.error(`[${this.constructor.name}] Render error:`, error);
    throw new Error(`Visual rendering failed: ${error.message}`);
  }
}

/**
 * Visual Component Factory
 * Creates appropriate visual components based on type
 */
export class VisualComponentFactory {
  private static components: Map<string, new (config: VisualConfig) => BaseVisualService> = new Map();

  static register(type: string, component: new (config: VisualConfig) => BaseVisualService): void {
    this.components.set(type, component);
  }

  static create(type: string, config: VisualConfig): BaseVisualService {
    const ComponentClass = this.components.get(type);
    if (!ComponentClass) {
      throw new Error(`Visual component type '${type}' not registered`);
    }

    return new ComponentClass(config);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.components.keys());
  }
}

/**
 * Content-Visual Mapping
 * Maps content types to appropriate visual components
 */
export interface ContentVisualMapping {
  [contentType: string]: {
    visualType: string;
    defaultConfig: Partial<VisualConfig>;
    dataTransform?: (data: unknown) => unknown;
  };
}

export const DefaultContentVisualMapping: ContentVisualMapping = {
  'number-line': {
    visualType: 'number-line',
    defaultConfig: { width: 600, height: 100, responsive: true }
  },
  'coordinate-grid': {
    visualType: 'coordinate-grid',
    defaultConfig: { width: 400, height: 400, responsive: true }
  },
  'math-equation': {
    visualType: 'katex-equation',
    defaultConfig: { width: 'auto', height: 'auto', responsive: true }
  },
  'food-chain': {
    visualType: 'flow-diagram',
    defaultConfig: { width: 800, height: 400, responsive: true }
  },
  'vocabulary-matching': {
    visualType: 'interactive-matching',
    defaultConfig: { width: 600, height: 500, responsive: true }
  },
  'chart': {
    visualType: 'chart-js',
    defaultConfig: { width: 500, height: 300, responsive: true }
  }
};