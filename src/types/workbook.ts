import { z } from 'zod';
import { 
  BloomLevel, 
  SubjectDomain, 
  GradeBand, 
  DifficultyLevel, 
  ExerciseType, 
  AssetType, 
  SectionPurpose,
  GenerationState
} from './enums';

// Learning Objective Schema
export const LearningObjectiveSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(10).max(500),
  bloomLevel: BloomLevel,
  smartCriteria: z.object({
    specific: z.boolean(),
    measurable: z.boolean(),
    achievable: z.boolean(),
    relevant: z.boolean(),
    timeBound: z.boolean()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Asset Schema
export const AssetSchema = z.object({
  id: z.string().uuid(),
  type: AssetType,
  title: z.string(),
  description: z.string().optional(),
  generationPrompt: z.string().optional(),
  url: z.string().url().optional(),
  localPath: z.string().optional(),
  altText: z.string(),
  license: z.string().default('CC-BY-4.0'),
  usageRefs: z.array(z.string().uuid()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Exercise Schema
export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  type: ExerciseType,
  prompt: z.string().min(10),
  instructions: z.string().optional(),
  mediaRefs: z.array(z.string().uuid()).default([]),
  
  // Multiple choice specific
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean()
  })).optional(),
  
  // Fill in blank specific
  blanks: z.array(z.object({
    id: z.string(),
    correctAnswers: z.array(z.string()),
    caseSensitive: z.boolean().default(false)
  })).optional(),
  
  // Open response
  sampleAnswer: z.string().optional(),
  rubric: z.string().optional(),
  
  // Numeric
  numericAnswer: z.number().optional(),
  tolerance: z.number().optional(),
  
  // General answer key and explanations
  correctAnswer: z.string(),
  rationale: z.string(),
  commonMistakes: z.array(z.string()).default([]),
  
  // Pedagogical metadata
  bloomLevel: BloomLevel,
  difficultyLevel: DifficultyLevel,
  estimatedTimeMinutes: z.number().min(1).max(120),
  objectiveIds: z.array(z.string().uuid()),
  variationSeed: z.string().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date()
});

// Misconception Schema
export const MisconceptionSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  commonTriggers: z.array(z.string()),
  clarification: z.string(),
  remedyExercises: z.array(z.string().uuid()).default([]),
  frequency: z.enum(['rare', 'uncommon', 'common', 'very_common']).default('common')
});

// Section Schema
export const SectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  purpose: SectionPurpose,
  order: z.number().min(0),
  
  // Content
  conceptExplanation: z.string(),
  examples: z.array(z.string()).default([]),
  keyTerms: z.array(z.object({
    term: z.string(),
    definition: z.string()
  })).default([]),
  
  // Exercises and assessments
  exercises: z.array(ExerciseSchema),
  
  // Learning support
  misconceptions: z.array(MisconceptionSchema).default([]),
  summary: z.string().optional(),
  crossLinks: z.array(z.object({
    sectionId: z.string().uuid(),
    description: z.string()
  })).default([]),
  
  // Pedagogical metadata
  estimatedTimeMinutes: z.number().min(5).max(180),
  difficultyProgression: z.array(DifficultyLevel),
  
  createdAt: z.date(),
  updatedAt: z.date()
});

// Target Audience Schema
export const TargetAudienceSchema = z.object({
  gradeBand: GradeBand,
  language: z.string().default('en'),
  priorKnowledge: z.array(z.string()).default([]),
  learningStyles: z.array(z.enum(['visual', 'auditory', 'kinesthetic', 'reading'])).default([]),
  accommodations: z.array(z.string()).default([])
});

// Pedagogy Compliance Schema
export const PedagogyComplianceSchema = z.object({
  bloomDistribution: z.object({
    remember: z.number().min(0).max(1),
    understand: z.number().min(0).max(1), 
    apply: z.number().min(0).max(1),
    analyze: z.number().min(0).max(1),
    evaluate: z.number().min(0).max(1),
    create: z.number().min(0).max(1)
  }),
  scaffoldingScore: z.number().min(0).max(100),
  exerciseVarietyScore: z.number().min(0).max(100),
  misconceptionCoverage: z.number().min(0).max(100),
  readabilityScore: z.number().min(0).max(100),
  accessibilityScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  issues: z.array(z.object({
    type: z.enum(['warning', 'error']),
    message: z.string(),
    suggestion: z.string().optional()
  })).default([])
});

// Generation Metadata Schema
export const GenerationMetadataSchema = z.object({
  standardsAlignment: z.array(z.object({
    standard: z.string(),
    code: z.string(),
    description: z.string()
  })).default([]),
  generationHistory: z.array(z.object({
    timestamp: z.date(),
    state: GenerationState,
    model: z.string(),
    tokenUsage: z.number(),
    cost: z.number().optional(),
    duration: z.number(),
    success: z.boolean(),
    errorMessage: z.string().optional()
  })).default([]),
  version: z.string().default('1.0.0'),
  createdBy: z.string().uuid().optional(),
  totalTokenUsage: z.number().default(0),
  totalCost: z.number().default(0),
  generationDuration: z.number().default(0)
});

// Main Workbook Schema
export const WorkbookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  topic: z.string().min(3).max(500),
  
  // Classification
  subjectDomain: SubjectDomain,
  subjectTags: z.array(z.string()).default([]),
  targetAudience: TargetAudienceSchema,
  
  // Learning design
  learningObjectives: z.array(LearningObjectiveSchema),
  sections: z.array(SectionSchema),
  
  // Assessments
  formativeAssessments: z.array(ExerciseSchema).default([]),
  summativeAssessments: z.array(ExerciseSchema).default([]),
  
  // Supporting materials
  glossary: z.array(z.object({
    term: z.string(),
    definition: z.string(),
    examples: z.array(z.string()).default([])
  })).default([]),
  assets: z.array(AssetSchema).default([]),
  
  // Quality and metadata
  pedagogyCompliance: PedagogyComplianceSchema.optional(),
  generationMetadata: GenerationMetadataSchema,
  
  // Accessibility
  accessibility: z.object({
    altTextComplete: z.boolean().default(false),
    readingLevel: z.string().optional(),
    colorContrastSafe: z.boolean().default(true),
    keyboardNavigable: z.boolean().default(true)
  }).default(() => ({
    altTextComplete: false,
    colorContrastSafe: true,
    keyboardNavigable: true
  })),
  
  // Export status
  exportStatus: z.object({
    json: z.boolean().default(false),
    html: z.boolean().default(false),
    pdf: z.boolean().default(false),
    lastExportAt: z.date().optional()
  }).default(() => ({
    json: false,
    html: false,
    pdf: false
  })),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional()
});

// Export all schemas as types
export type LearningObjective = z.infer<typeof LearningObjectiveSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Misconception = z.infer<typeof MisconceptionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;
export type PedagogyCompliance = z.infer<typeof PedagogyComplianceSchema>;
export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;
export type Workbook = z.infer<typeof WorkbookSchema>;