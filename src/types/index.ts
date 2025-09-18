// Re-export all types and schemas for easy importing
export * from './enums';
export * from './workbook';
export * from './api';

// Utility types
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: Date;
  requestId?: string;
}

// Generation pipeline types
export interface GenerationContext {
  workbookId: string;
  input: Record<string, unknown>;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  artifacts: Record<string, unknown>;
}

export interface PipelineStep {
  name: string;
  description: string;
  execute: (context: GenerationContext) => Promise<GenerationContext>;
  validate?: (context: GenerationContext) => Promise<boolean>;
  rollback?: (context: GenerationContext) => Promise<void>;
}

// AI Model interfaces
export interface ModelConfig {
  name: string;
  endpoint: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface ModelResponse {
  content: string;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  cost?: number;
  model: string;
  finishReason: string;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
  severity: number;
}

// Event types for real-time updates
export interface GenerationEvent {
  type: 'progress' | 'step_complete' | 'error' | 'complete';
  jobId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}