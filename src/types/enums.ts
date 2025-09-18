import { z } from 'zod';

// Bloom's Taxonomy levels
export const BloomLevel = z.enum([
  'remember',
  'understand', 
  'apply',
  'analyze',
  'evaluate',
  'create'
]);

// Subject domains
export const SubjectDomain = z.enum([
  'mathematics',
  'science',
  'english_language_arts',
  'social_studies',
  'history',
  'geography',
  'art',
  'music',
  'physical_education',
  'computer_science',
  'foreign_language',
  'other'
]);

// Grade bands
export const GradeBand = z.enum([
  'k-2',
  '3-5', 
  '6-8',
  '9-10',
  '11-12',
  'adult'
]);

// Difficulty levels
export const DifficultyLevel = z.enum([
  'basic',
  'intermediate', 
  'advanced',
  'expert'
]);

// Exercise types
export const ExerciseType = z.enum([
  'multiple_choice',
  'fill_in_blank',
  'matching',
  'open_response',
  'coding',
  'numeric',
  'multi_step',
  'drag_and_drop',
  'ordering',
  'true_false'
]);

// Asset types
export const AssetType = z.enum([
  'generated_image',
  'diagram_svg', 
  'chart',
  'table',
  'video',
  'audio'
]);

// Section purposes
export const SectionPurpose = z.enum([
  'introduction',
  'concept_explanation',
  'guided_practice',
  'independent_practice',
  'assessment',
  'extension',
  'summary',
  'reflection'
]);

// Generation states for the pipeline
export const GenerationState = z.enum([
  'init',
  'topic_parse',
  'objective_gen',
  'outline_gen', 
  'section_draft',
  'exercise_gen',
  'solution_gen',
  'misconception_gen',
  'asset_plan',
  'asset_gen',
  'qa_validate',
  'layout_build',
  'export',
  'complete',
  'error'
]);

export type BloomLevelType = z.infer<typeof BloomLevel>;
export type SubjectDomainType = z.infer<typeof SubjectDomain>;
export type GradeBandType = z.infer<typeof GradeBand>;
export type DifficultyLevelType = z.infer<typeof DifficultyLevel>;
export type ExerciseTypeType = z.infer<typeof ExerciseType>;
export type AssetTypeType = z.infer<typeof AssetType>;
export type SectionPurposeType = z.infer<typeof SectionPurpose>;
export type GenerationStateType = z.infer<typeof GenerationState>;