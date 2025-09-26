/**
 * Content Validation Service
 * Validates, scores, and filters educational content for safety and quality
 */

import { GeneratedContent } from './APICoordinatorServiceEnhanced';

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0.0 - 1.0
  safetyScore: number; // 0.0 - 1.0
  readabilityScore: number; // 0.0 - 1.0
  educationalValue: number; // 0.0 - 1.0
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'safety' | 'quality' | 'readability' | 'accuracy' | 'age_appropriateness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string; // Where in content the issue was found
}

export interface ValidationCriteria {
  minQualityScore: number;
  minSafetyScore: number;
  maxReadingLevel: number;
  strictSafetyCheck: boolean;
  checkFactualAccuracy: boolean;
  gradeLevel: number;
}

export class ContentValidationService {
  private static readonly FORBIDDEN_WORDS = [
    // Add inappropriate words that should be flagged
    'inappropriate', 'dangerous', 'harmful'
  ];

  private static readonly EDUCATIONAL_INDICATORS = [
    'learn', 'understand', 'practice', 'solve', 'calculate', 'explain', 
    'analyze', 'compare', 'identify', 'describe', 'demonstrate'
  ];

  /**
   * Validate educational content against quality and safety criteria
   */
  async validateContent(
    content: GeneratedContent,
    criteria: ValidationCriteria
  ): Promise<ValidationResult> {
    console.log(`[ContentValidator] Validating content: ${content.type}`);

    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];

    // Run all validation checks
    const safetyScore = this.validateSafety(content.content, issues);
    const qualityScore = this.validateQuality(content.content, content.type, issues);
    const readabilityScore = this.validateReadability(content.content, criteria.gradeLevel, issues);
    const educationalValue = this.validateEducationalValue(content.content, issues);

    // Add suggestions based on issues found
    this.generateSuggestions(issues, suggestions);

    // Determine if content passes validation
    const isValid = this.determineValidity(
      safetyScore, 
      qualityScore, 
      readabilityScore, 
      criteria, 
      issues
    );

    return {
      isValid,
      qualityScore,
      safetyScore,
      readabilityScore,
      educationalValue,
      issues,
      suggestions,
    };
  }

  /**
   * Batch validate multiple content pieces
   */
  async validateBatch(
    contents: GeneratedContent[],
    criteria: ValidationCriteria
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const content of contents) {
      const result = await this.validateContent(content, criteria);
      results.set(content.id, result);
    }

    return results;
  }

  /**
   * Safety validation - check for inappropriate content
   */
  private validateSafety(content: string, issues: ValidationIssue[]): number {
    let safetyScore = 1.0;
    const contentLower = content.toLowerCase();

    // Check for forbidden words
    for (const word of ContentValidationService.FORBIDDEN_WORDS) {
      if (contentLower.includes(word.toLowerCase())) {
        issues.push({
          type: 'safety',
          severity: 'critical',
          message: `Contains inappropriate content: "${word}"`,
          location: this.findWordLocation(content, word),
        });
        safetyScore -= 0.3;
      }
    }

    // Check for overly complex or potentially harmful instructions
    const dangerousPatterns = [
      /dangerous|harmful|unsafe|risky/gi,
      /personal information|home address|phone number/gi,
    ];

    for (const pattern of dangerousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'safety',
          severity: 'high',
          message: `Potentially unsafe content detected: ${matches[0]}`,
        });
        safetyScore -= 0.2;
      }
    }

    return Math.max(0, safetyScore);
  }

  /**
   * Quality validation - check content structure and completeness
   */
  private validateQuality(content: string, contentType: string, issues: ValidationIssue[]): number {
    let qualityScore = 0.5; // Start with base score

    // Check minimum length
    if (content.length < 50) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        message: 'Content is too short to be educational',
      });
      qualityScore -= 0.2;
    } else {
      qualityScore += 0.1;
    }

    // Check for educational structure
    if (contentType === 'explanations' || contentType === 'examples') {
      // Look for clear structure
      if (content.includes('#') || content.includes('##')) {
        qualityScore += 0.1; // Has headings
      }
      
      if (content.includes('•') || content.includes('-') || /\d+\./g.test(content)) {
        qualityScore += 0.1; // Has bullet points or numbered lists
      }
    }

    // Check for mathematical accuracy (basic)
    if (contentType === 'problems' || contentType === 'word_problems') {
      qualityScore += this.validateMathematicalContent(content, issues);
    }

    // Check for educational vocabulary
    const educationalWords = ContentValidationService.EDUCATIONAL_INDICATORS.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    
    qualityScore += Math.min(0.2, educationalWords * 0.05);

    return Math.min(1.0, qualityScore);
  }

  /**
   * Readability validation - check if content is appropriate for grade level
   */
  private validateReadability(content: string, gradeLevel: number, issues: ValidationIssue[]): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
      issues.push({
        type: 'readability',
        severity: 'high',
        message: 'Content has no readable sentences or words',
      });
      return 0;
    }

    // Calculate average sentence length
    const avgSentenceLength = words.length / sentences.length;
    
    // Calculate average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Simple reading level estimation (simplified Flesch-Kincaid)
    const estimatedGradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgWordLength / 4.7) - 15.59;
    
    // Check if reading level is appropriate
    const targetRange = [gradeLevel - 1, gradeLevel + 2]; // Allow some flexibility
    
    if (estimatedGradeLevel < targetRange[0]) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: `Content may be too simple for grade ${gradeLevel} (estimated: grade ${Math.round(estimatedGradeLevel)})`,
      });
      return 0.7;
    } else if (estimatedGradeLevel > targetRange[1]) {
      issues.push({
        type: 'readability',
        severity: 'medium',
        message: `Content may be too complex for grade ${gradeLevel} (estimated: grade ${Math.round(estimatedGradeLevel)})`,
      });
      return 0.6;
    }
    
    return 0.9; // Good readability
  }

  /**
   * Educational value validation - check if content is truly educational
   */
  private validateEducationalValue(content: string, issues: ValidationIssue[]): number {
    let educationalScore = 0.3; // Base score

    // Check for learning objectives
    if (content.toLowerCase().includes('objective') || content.toLowerCase().includes('goal')) {
      educationalScore += 0.1;
    }

    // Check for examples and practice
    if (content.toLowerCase().includes('example') || content.toLowerCase().includes('practice')) {
      educationalScore += 0.1;
    }

    // Check for assessment or questions
    if (content.includes('?') || content.toLowerCase().includes('question')) {
      educationalScore += 0.1;
    }

    // Check for explanations and reasoning
    if (content.toLowerCase().includes('because') || content.toLowerCase().includes('therefore') || 
        content.toLowerCase().includes('explain')) {
      educationalScore += 0.1;
    }

    // Check for interactive elements
    if (content.toLowerCase().includes('solve') || content.toLowerCase().includes('calculate') ||
        content.toLowerCase().includes('identify')) {
      educationalScore += 0.1;
    }

    // Penalize if content lacks educational indicators
    const educationalIndicatorCount = ContentValidationService.EDUCATIONAL_INDICATORS.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;

    if (educationalIndicatorCount === 0) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        message: 'Content lacks clear educational indicators or learning objectives',
      });
      educationalScore -= 0.2;
    }

    return Math.min(1.0, Math.max(0, educationalScore));
  }

  /**
   * Validate mathematical content for accuracy
   */
  private validateMathematicalContent(content: string, issues: ValidationIssue[]): number {
    let mathScore = 0;

    // Check for mathematical symbols and expressions
    const mathPatterns = [
      /\d+\s*[\+\-\*\/]\s*\d+/g, // Basic arithmetic
      /=\s*\d+/g, // Equals signs with numbers
      /x\s*[\+\-\*\/]/g, // Variable expressions
    ];

    let hasMathContent = false;
    for (const pattern of mathPatterns) {
      if (pattern.test(content)) {
        hasMathContent = true;
        mathScore += 0.1;
      }
    }

    if (!hasMathContent) {
      issues.push({
        type: 'accuracy',
        severity: 'low',
        message: 'Mathematical content lacks clear mathematical expressions',
      });
    }

    // Basic arithmetic validation (very simplified)
    const simpleEquations = content.match(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/g);
    if (simpleEquations) {
      for (const equation of simpleEquations) {
        const match = equation.match(/(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/);
        if (match) {
          const [, a, b, result] = match;
          const expectedResult = parseInt(a) + parseInt(b);
          if (expectedResult !== parseInt(result)) {
            issues.push({
              type: 'accuracy',
              severity: 'high',
              message: `Incorrect arithmetic: ${equation} (should be ${expectedResult})`,
              location: equation,
            });
            mathScore -= 0.2;
          }
        }
      }
    }

    return Math.max(0, mathScore);
  }

  /**
   * Generate improvement suggestions based on issues found
   */
  private generateSuggestions(issues: ValidationIssue[], suggestions: string[]): void {
    const issueTypes = new Set(issues.map(issue => issue.type));

    if (issueTypes.has('safety')) {
      suggestions.push('Review content for age-appropriate language and remove any potentially harmful information');
    }

    if (issueTypes.has('quality')) {
      suggestions.push('Add more structure with headings, bullet points, or numbered lists');
      suggestions.push('Include more educational vocabulary and clear learning objectives');
    }

    if (issueTypes.has('readability')) {
      suggestions.push('Adjust sentence length and vocabulary complexity for the target grade level');
    }

    if (issueTypes.has('accuracy')) {
      suggestions.push('Double-check mathematical calculations and factual information');
    }

    // Add general suggestions if no specific issues found
    if (issues.length === 0) {
      suggestions.push('Content looks good! Consider adding interactive elements or practice questions to enhance engagement');
    }
  }

  /**
   * Determine if content passes validation based on scores and criteria
   */
  private determineValidity(
    safetyScore: number,
    qualityScore: number,
    readabilityScore: number,
    criteria: ValidationCriteria,
    issues: ValidationIssue[]
  ): boolean {
    // Check critical safety issues
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      return false;
    }

    // Check minimum score requirements
    if (safetyScore < criteria.minSafetyScore) {
      return false;
    }

    if (qualityScore < criteria.minQualityScore) {
      return false;
    }

    // For strict safety check, be more conservative
    if (criteria.strictSafetyCheck && safetyScore < 0.9) {
      return false;
    }

    return true;
  }

  /**
   * Find the location of a word in content
   */
  private findWordLocation(content: string, word: string): string {
    const index = content.toLowerCase().indexOf(word.toLowerCase());
    if (index === -1) return 'Unknown';
    
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + word.length + 20);
    return `"...${content.substring(start, end)}..."`;
  }

  /**
   * Get default validation criteria for a grade level
   */
  static getDefaultCriteria(gradeLevel: number): ValidationCriteria {
    return {
      minQualityScore: 0.6,
      minSafetyScore: 0.8,
      maxReadingLevel: gradeLevel + 2,
      strictSafetyCheck: gradeLevel <= 8, // Stricter for younger students
      checkFactualAccuracy: true,
      gradeLevel: gradeLevel,
    };
  }

  /**
   * Create a summary report for validation results
   */
  createValidationReport(results: Map<string, ValidationResult>): {
    totalContent: number;
    validContent: number;
    averageQuality: number;
    averageSafety: number;
    commonIssues: string[];
    recommendations: string[];
  } {
    const values = Array.from(results.values());
    
    const totalContent = values.length;
    const validContent = values.filter(r => r.isValid).length;
    const averageQuality = values.reduce((sum, r) => sum + r.qualityScore, 0) / totalContent;
    const averageSafety = values.reduce((sum, r) => sum + r.safetyScore, 0) / totalContent;
    
    // Find common issues
    const allIssues = values.flatMap(r => r.issues);
    const issueTypes = allIssues.map(issue => issue.type);
    const commonIssues = Array.from(new Set(issueTypes))
      .filter(type => issueTypes.filter(t => t === type).length > totalContent * 0.3);
    
    // Generate recommendations
    const recommendations = [];
    if (averageQuality < 0.7) {
      recommendations.push('Focus on improving content structure and educational value');
    }
    if (averageSafety < 0.9) {
      recommendations.push('Review content for safety and age-appropriateness');
    }
    if (validContent / totalContent < 0.8) {
      recommendations.push('Consider regenerating content that failed validation');
    }
    
    return {
      totalContent,
      validContent,
      averageQuality,
      averageSafety,
      commonIssues,
      recommendations,
    };
  }
}