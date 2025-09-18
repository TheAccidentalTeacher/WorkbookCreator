import { z } from 'zod';
import { SubjectDomain, GradeBand } from './enums';

// API Request/Response schemas

// Topic input from user
export const TopicInputSchema = z.object({
  topic: z.string().min(3).max(500),
  subjectDomain: SubjectDomain.optional(),
  gradeBand: GradeBand,
  language: z.string().default('en'),
  depth: z.enum(['basic', 'standard', 'comprehensive']).default('standard'),
  maxSections: z.number().min(1).max(20).default(5),
  exercisesPerSection: z.number().min(1).max(10).default(3),
  includeImages: z.boolean().default(false),
  customInstructions: z.string().optional(),
  timeConstraint: z.number().min(5).max(180).optional(), // minutes
  difficultyLevel: z.enum(['mixed', 'basic', 'intermediate', 'advanced']).default('mixed')
});

// Generation configuration
export const GenerationConfigSchema = z.object({
  models: z.object({
    primary: z.string().default('gpt-4'),
    fallback: z.string().default('gpt-3.5-turbo'),
    vision: z.string().default('gpt-4-vision-preview').optional(),
    image: z.string().default('dall-e-3').optional()
  }).default(() => ({
    primary: 'gpt-4',
    fallback: 'gpt-3.5-turbo',
    vision: 'gpt-4-vision-preview',
    image: 'dall-e-3'
  })),
  constraints: z.object({
    maxTokens: z.number().default(50000),
    timeoutMinutes: z.number().default(30),
    retryAttempts: z.number().default(3)
  }).default(() => ({
    maxTokens: 50000,
    timeoutMinutes: 30,
    retryAttempts: 3
  })),
  quality: z.object({
    enableFactChecking: z.boolean().default(false),
    enablePlagiarismCheck: z.boolean().default(false),
    strictPedagogy: z.boolean().default(true),
    requireMisconceptions: z.boolean().default(true)
  }).default(() => ({
    enableFactChecking: false,
    enablePlagiarismCheck: false,
    strictPedagogy: true,
    requireMisconceptions: true
  })),
  features: z.object({
    generateImages: z.boolean().default(false),
    generateDiagrams: z.boolean().default(true),
    includeAccessibility: z.boolean().default(true),
    enableAnalytics: z.boolean().default(false)
  }).default(() => ({
    generateImages: false,
    generateDiagrams: true,
    includeAccessibility: true,
    enableAnalytics: false
  }))
});

// Generation progress/status
export const GenerationProgressSchema = z.object({
  jobId: z.string(),
  state: z.string(),
  currentStep: z.string(),
  progress: z.number().min(0).max(100),
  estimatedTimeRemaining: z.number().optional(),
  tokenUsage: z.number().default(0),
  estimatedCost: z.number().default(0),
  errorMessage: z.string().optional(),
  lastUpdated: z.date()
});

// Export options
export const ExportOptionsSchema = z.object({
  format: z.enum(['json', 'html', 'pdf']),
  includeAnswerKey: z.boolean().default(true),
  includeMetadata: z.boolean().default(false),
  theme: z.string().default('default'),
  branding: z.object({
    logo: z.string().optional(),
    institutionName: z.string().optional(),
    customCSS: z.string().optional()
  }).optional(),
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    largeText: z.boolean().default(false),
    includeAltText: z.boolean().default(true)
  }).default(() => ({
    highContrast: false,
    largeText: false,
    includeAltText: true
  }))
});

// Error response
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional()
  }),
  timestamp: z.date(),
  requestId: z.string().optional()
});

// Success response wrapper
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.date(),
    requestId: z.string().optional()
  });

// Pagination
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean()
    })
  });

// Workbook list item (summary for listings)
export const WorkbookSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  subjectDomain: z.string(),
  gradeBand: z.string(),
  status: z.enum(['draft', 'generating', 'complete', 'error']),
  progress: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
  sectionCount: z.number(),
  exerciseCount: z.number(),
  estimatedDuration: z.number() // minutes
});

// Analytics schemas
export const UsageStatsSchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']),
  totalWorkbooks: z.number(),
  totalTokens: z.number(),
  totalCost: z.number(),
  averageGenerationTime: z.number(),
  successRate: z.number(),
  popularSubjects: z.array(z.object({
    subject: z.string(),
    count: z.number()
  })),
  popularGrades: z.array(z.object({
    grade: z.string(),
    count: z.number()
  }))
});

// Export type definitions
export type TopicInput = z.infer<typeof TopicInputSchema>;
export type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
export type GenerationProgress = z.infer<typeof GenerationProgressSchema>;
export type ExportOptions = z.infer<typeof ExportOptionsSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type WorkbookSummary = z.infer<typeof WorkbookSummarySchema>;
export type UsageStats = z.infer<typeof UsageStatsSchema>;