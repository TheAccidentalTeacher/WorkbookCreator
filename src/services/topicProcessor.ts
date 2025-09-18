import { SubjectDomainType, GradeBandType } from '@/types';
import { debugSystem } from '../utils/debugSystem';

// Subject domain keywords for classification
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  mathematics: [
    'math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics', 
    'arithmetic', 'trigonometry', 'numbers', 'equations', 'graphs', 'probability',
    'fractions', 'decimals', 'multiplication', 'division', 'addition', 'subtraction'
  ],
  science: [
    'science', 'biology', 'chemistry', 'physics', 'earth science', 'astronomy',
    'ecology', 'genetics', 'evolution', 'atoms', 'molecules', 'energy', 'motion',
    'plants', 'animals', 'cells', 'ecosystem', 'weather', 'climate', 'space'
  ],
  english_language_arts: [
    'english', 'language arts', 'reading', 'writing', 'literature', 'grammar',
    'vocabulary', 'spelling', 'essay', 'story', 'poem', 'paragraph', 'sentence',
    'comprehension', 'fiction', 'non-fiction', 'character', 'plot', 'theme'
  ],
  social_studies: [
    'social studies', 'civics', 'government', 'democracy', 'citizenship',
    'community', 'culture', 'society', 'economics', 'politics', 'constitution'
  ],
  history: [
    'history', 'historical', 'ancient', 'medieval', 'revolution', 'war', 'civilization',
    'timeline', 'historical events', 'past', 'colonial', 'independence', 'empire'
  ],
  geography: [
    'geography', 'maps', 'continents', 'countries', 'capitals', 'landforms',
    'rivers', 'mountains', 'climate zones', 'latitude', 'longitude', 'regions'
  ],
  computer_science: [
    'coding', 'programming', 'computer science', 'algorithm', 'software', 'app',
    'website', 'technology', 'digital', 'internet', 'data', 'database'
  ],
  art: ['art', 'drawing', 'painting', 'creative', 'visual'],
  music: ['music', 'sound', 'rhythm', 'melody', 'instrument'],
  physical_education: ['physical', 'exercise', 'sports', 'fitness', 'health'],
  foreign_language: ['language', 'spanish', 'french', 'german', 'chinese'],
  other: []
};

// Grade level indicators
const GRADE_INDICATORS = {
  'k-2': [
    'kindergarten', 'first grade', 'second grade', 'early elementary',
    'young learners', 'basic', 'simple', 'counting', 'letters'
  ],
  '3-5': [
    'third grade', 'fourth grade', 'fifth grade', 'elementary',
    'intermediate elementary', 'middle elementary'
  ],
  '6-8': [
    'sixth grade', 'seventh grade', 'eighth grade', 'middle school',
    'junior high', 'pre-teen', 'adolescent'
  ],
  '9-10': [
    'ninth grade', 'tenth grade', 'freshman', 'sophomore', 'high school',
    'secondary', 'teen', 'adolescent'
  ],
  '11-12': [
    'eleventh grade', 'twelfth grade', 'junior', 'senior', 'high school',
    'advanced', 'college prep', 'ap', 'advanced placement'
  ]
};

// Complexity indicators
const COMPLEXITY_INDICATORS = {
  basic: ['simple', 'basic', 'introduction', 'beginner', 'easy', 'fundamental'],
  intermediate: ['intermediate', 'moderate', 'standard', 'typical', 'average'],
  advanced: ['advanced', 'complex', 'challenging', 'difficult', 'sophisticated', 'expert']
};

export interface TopicAnalysis {
  originalTopic: string;
  normalizedTopic: string;
  subjectDomain: SubjectDomainType;
  suggestedGradeBand: GradeBandType;
  confidence: number;
  complexity: 'basic' | 'intermediate' | 'advanced';
  keywords: string[];
  prerequisites: string[];
  relatedTopics: string[];
  estimatedSections: number;
  estimatedExercises: number;
  warnings: string[];
}

export class TopicProcessor {
  /**
   * Analyzes a topic input and extracts metadata for workbook generation
   */
  static async analyzeTopic(topic: string, gradeBand?: GradeBandType): Promise<TopicAnalysis> {
    const perfLabel = 'topicProcessor.analyzeTopic';
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('Topic Processor', 'Starting topic analysis', {
      originalTopic: topic,
      providedGradeBand: gradeBand,
      timestamp: new Date().toISOString()
    });

    const normalizedTopic = topic.toLowerCase().trim();
    const words = normalizedTopic.split(/\s+/);
    
    debugSystem.debug('Topic Processor', 'Topic normalized', {
      originalTopic: topic,
      normalizedTopic,
      wordCount: words.length,
      words: words.slice(0, 10) // First 10 words for debugging
    });
    
    // Classify subject domain
    const subjectDomain = this.classifySubjectDomain(normalizedTopic);
    debugSystem.debug('Topic Processor', 'Subject domain classified', { subjectDomain });
    
    // Determine grade band if not provided
    const suggestedGradeBand = gradeBand || this.inferGradeBand(normalizedTopic);
    debugSystem.debug('Topic Processor', 'Grade band determined', { 
      provided: gradeBand, 
      suggested: suggestedGradeBand,
      wasInferred: !gradeBand
    });
    
    // Assess complexity
    const complexity = this.assessComplexity(normalizedTopic);
    debugSystem.debug('Topic Processor', 'Complexity assessed', { complexity });
    
    // Extract keywords
    const keywords = this.extractKeywords(normalizedTopic, subjectDomain);
    debugSystem.debug('Topic Processor', 'Keywords extracted', { keywordCount: keywords.length, keywords });
    
    // Determine prerequisites
    const prerequisites = await this.identifyPrerequisites(normalizedTopic, subjectDomain, suggestedGradeBand);
    debugSystem.debug('Topic Processor', 'Prerequisites identified', { 
      prerequisiteCount: prerequisites.length, 
      prerequisites 
    });
    
    // Find related topics
    const relatedTopics = this.findRelatedTopics(normalizedTopic, subjectDomain);
    debugSystem.debug('Topic Processor', 'Related topics found', { 
      relatedTopicCount: relatedTopics.length, 
      relatedTopics 
    });
    
    // Estimate workbook structure
    const { sections, exercises } = this.estimateStructure(normalizedTopic, complexity, suggestedGradeBand);
    debugSystem.debug('Topic Processor', 'Structure estimated', { 
      estimatedSections: sections, 
      estimatedExercises: exercises 
    });
    
    // Check for potential issues
    const warnings = this.validateTopic(normalizedTopic, subjectDomain, suggestedGradeBand);
    debugSystem.debug('Topic Processor', 'Topic validated', { 
      warningCount: warnings.length, 
      warnings 
    });

    const confidence = this.calculateConfidence(normalizedTopic, subjectDomain);
    
    const result: TopicAnalysis = {
      originalTopic: topic,
      normalizedTopic: normalizedTopic,
      subjectDomain,
      suggestedGradeBand,
      confidence,
      complexity,
      keywords,
      prerequisites,
      relatedTopics,
      estimatedSections: sections,
      estimatedExercises: exercises,
      warnings
    };

    debugSystem.endPerformance(perfLabel, 'Topic Processor');
    debugSystem.info('Topic Processor', 'Topic analysis completed', {
      subjectDomain: result.subjectDomain,
      gradeBand: result.suggestedGradeBand,
      confidence: result.confidence,
      complexity: result.complexity,
      sections: result.estimatedSections,
      exercises: result.estimatedExercises,
      warningCount: result.warnings.length
    });
    
    return result;
  }

  private static classifySubjectDomain(topic: string): SubjectDomainType {
    debugSystem.debug('Topic Processor', 'Classifying subject domain', { topic });
    
    let bestMatch: SubjectDomainType = 'other';
    let maxScore = 0;
    const domainScores: Record<string, number> = {};

    for (const [domain, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
      const score = keywords.reduce((count, keyword) => {
        const hasKeyword = topic.includes(keyword);
        if (hasKeyword) {
          debugSystem.trace('Topic Processor', `Keyword match found`, { 
            domain, 
            keyword, 
            topic: topic.substring(0, 50) + '...' 
          });
        }
        return count + (hasKeyword ? 1 : 0);
      }, 0);

      domainScores[domain] = score;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = domain as SubjectDomainType;
      }
    }

    debugSystem.debug('Topic Processor', 'Subject domain classification complete', {
      bestMatch,
      maxScore,
      domainScores: Object.entries(domainScores)
        .filter(([, score]) => score > 0)
        .reduce((acc, [domain, score]) => ({ ...acc, [domain]: score }), {})
    });

    return bestMatch;
  }

  private static inferGradeBand(topic: string): GradeBandType {
    for (const [grade, indicators] of Object.entries(GRADE_INDICATORS)) {
      for (const indicator of indicators) {
        if (topic.includes(indicator)) {
          return grade as GradeBandType;
        }
      }
    }

    // Default based on complexity if no grade indicators found
    if (topic.includes('advanced') || topic.includes('calculus') || topic.includes('complex')) {
      return '11-12';
    } else if (topic.includes('basic') || topic.includes('simple') || topic.includes('introduction')) {
      return '3-5';
    }

    return '6-8'; // Default middle grade
  }

  private static assessComplexity(topic: string): 'basic' | 'intermediate' | 'advanced' {
    for (const [level, indicators] of Object.entries(COMPLEXITY_INDICATORS)) {
      for (const indicator of indicators) {
        if (topic.includes(indicator)) {
          return level as 'basic' | 'intermediate' | 'advanced';
        }
      }
    }

    return 'intermediate'; // Default
  }

  private static extractKeywords(topic: string, domain: SubjectDomainType): string[] {
    const words = topic.split(/\s+/);
    const domainKeywords = SUBJECT_KEYWORDS[domain] || [];
    
    // Find relevant keywords in the topic
    const foundKeywords = words.filter((word: string) => 
      domainKeywords.some((keyword: string) => 
        keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())
      )
    );

    // Add important terms from the topic
    const importantTerms = words.filter((word: string) => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'from', 'into', 'about', 'that', 'this'].includes(word)
    );

    return [...new Set([...foundKeywords, ...importantTerms])];
  }

  private static async identifyPrerequisites(
    topic: string, 
    domain: SubjectDomainType, 
    grade: GradeBandType
  ): Promise<string[]> {
    // Simple prerequisite mapping - in production, this could use AI or a knowledge graph
    // Future enhancement: use domain and grade for more sophisticated prerequisite detection
    console.log(`Analyzing prerequisites for ${domain} topic at ${grade} level`);
    
    const prerequisites: Record<string, string[]> = {
      'algebra': ['arithmetic', 'basic math operations', 'fractions', 'integers'],
      'geometry': ['basic shapes', 'measurement', 'coordinate system'],
      'fractions': ['division', 'multiplication', 'number sense'],
      'multiplication': ['addition', 'counting', 'number patterns'],
      'division': ['multiplication', 'subtraction', 'basic math facts'],
      'writing': ['letter recognition', 'phonics', 'basic vocabulary'],
      'reading comprehension': ['phonics', 'sight words', 'basic reading'],
      'chemistry': ['basic math', 'scientific method', 'measurement'],
      'biology': ['scientific method', 'basic chemistry', 'observation skills']
    };

    const topicPrereqs: string[] = [];
    
    for (const [key, reqs] of Object.entries(prerequisites)) {
      if (topic.includes(key)) {
        topicPrereqs.push(...reqs);
      }
    }

    return [...new Set(topicPrereqs)];
  }

  private static findRelatedTopics(topic: string, domain: SubjectDomainType): string[] {
    // Future enhancement: use domain for more sophisticated related topic detection
    console.log(`Finding related topics for ${domain} domain`);
    
    // Simple related topic mapping
    const relatedTopicsMap: Record<string, string[]> = {
      'fractions': ['decimals', 'percentages', 'ratios', 'division'],
      'algebra': ['equations', 'variables', 'graphing', 'functions'],
      'geometry': ['shapes', 'area', 'perimeter', 'angles', 'measurement'],
      'reading': ['comprehension', 'vocabulary', 'phonics', 'fluency'],
      'writing': ['grammar', 'paragraphs', 'essays', 'creative writing'],
      'biology': ['life science', 'ecology', 'genetics', 'anatomy'],
      'chemistry': ['atoms', 'molecules', 'reactions', 'periodic table']
    };

    const related: string[] = [];
    
    for (const [key, topics] of Object.entries(relatedTopicsMap)) {
      if (topic.includes(key)) {
        related.push(...topics);
      }
    }

    return [...new Set(related)];
  }

  private static estimateStructure(
    topic: string, 
    complexity: string, 
    grade: GradeBandType
  ): { sections: number; exercises: number } {
    let baseSections = 3;
    let baseExercises = 2;

    // Adjust based on complexity
    if (complexity === 'basic') {
      baseSections = 2;
      baseExercises = 2;
    } else if (complexity === 'advanced') {
      baseSections = 5;
      baseExercises = 4;
    }

    // Adjust based on grade level
    if (grade === 'k-2') {
      baseSections = Math.max(2, baseSections - 1);
      baseExercises = Math.max(1, baseExercises - 1);
    } else if (grade === '11-12') {
      baseSections += 1;
      baseExercises += 1;
    }

    return {
      sections: baseSections,
      exercises: baseExercises
    };
  }

  private static calculateConfidence(topic: string, domain: SubjectDomainType): number {
    const domainKeywords = SUBJECT_KEYWORDS[domain] || [];
    const words = topic.split(/\s+/);
    
    const matchCount = domainKeywords.reduce((count: number, keyword: string) => {
      return count + (topic.includes(keyword) ? 1 : 0);
    }, 0);

    // Base confidence on keyword matches
    const confidence = Math.min(0.9, 0.3 + (matchCount / words.length) * 0.6);
    
    return Math.round(confidence * 100) / 100;
  }

  private static validateTopic(
    topic: string, 
    domain: SubjectDomainType, 
    grade: GradeBandType
  ): string[] {
    const warnings: string[] = [];

    // Check topic length
    if (topic.length < 10) {
      warnings.push('Topic is quite short - consider providing more detail for better results');
    }

    if (topic.length > 200) {
      warnings.push('Topic is very long - consider breaking it into smaller, focused topics');
    }

    // Check for potentially inappropriate content
    const inappropriateTerms = ['violence', 'weapon', 'drug', 'alcohol'];
    if (inappropriateTerms.some(term => topic.toLowerCase().includes(term))) {
      warnings.push('Topic may contain content that requires careful handling for the target age group');
    }

    // Grade-specific warnings
    if (grade === 'k-2' && topic.includes('complex')) {
      warnings.push('Topic complexity may be too high for kindergarten through 2nd grade');
    }

    // Subject domain warnings
    if (domain === 'other') {
      warnings.push('Could not clearly identify subject domain - please specify or refine the topic');
    }

    return warnings;
  }
}