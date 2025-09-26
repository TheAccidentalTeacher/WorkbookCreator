/**
 * Grade-Level Content Guidelines Service
 * 
 * Provides specific, actionable guidelines for content generation at each grade level.
 * This ensures AI-generated content is developmentally appropriate and pedagogically sound.
 */

import { GradeBandType } from '../types';

export interface GradeLevelGuidelines {
  gradeBand: GradeBandType;
  ageRange: string;
  cognitiveCapabilities: string[];
  vocabularyLevel: {
    maxSyllables: number;
    avoidTerms: string[];
    preferredTerms: string[];
    exampleSentenceLength: string;
  };
  mathematicalConcepts: {
    appropriate: string[];
    tooAdvanced: string[];
    problemTypes: string[];
    numberRange: string;
  };
  instructionalApproaches: {
    recommended: string[];
    avoid: string[];
    attentionSpan: string;
    scaffolding: string[];
  };
  exerciseTypes: {
    effective: string[];
    inappropriate: string[];
    maxStepsPerProblem: number;
    supportNeeded: string[];
  };
  contentStructure: {
    maxSectionsRecommended: number;
    idealSectionLength: string;
    repetitionNeeded: boolean;
    conceptIntroductionStyle: string;
  };
}

export const GRADE_LEVEL_GUIDELINES: Record<GradeBandType, GradeLevelGuidelines> = {
  'k-2': {
    gradeBand: 'k-2',
    ageRange: '5-8 years old',
    cognitiveCapabilities: [
      'Concrete operational thinking only',
      'Learning through hands-on experiences',
      'Visual and auditory processing dominant',
      'Beginning to understand symbols and representations',
      'Can follow 2-3 step instructions maximum'
    ],
    vocabularyLevel: {
      maxSyllables: 2,
      avoidTerms: [
        'analyze', 'synthesize', 'evaluate', 'complex', 'sophisticated',
        'advanced', 'abstract', 'theoretical', 'conceptual framework',
        'methodology', 'systematic approach', 'comprehensive analysis'
      ],
      preferredTerms: [
        'count', 'find', 'show', 'tell', 'draw', 'color', 'circle',
        'match', 'look', 'see', 'make', 'do', 'try', 'help'
      ],
      exampleSentenceLength: '5-8 words maximum'
    },
    mathematicalConcepts: {
      appropriate: [
        'Counting 1-20', 'Number recognition', 'Basic shapes',
        'Patterns (AB, ABC)', 'Size comparisons (big/small)',
        'Sorting by one attribute', 'Simple addition to 10',
        'Basic measurement concepts'
      ],
      tooAdvanced: [
        'Multiplication', 'Division', 'Fractions beyond halves',
        'Multi-step word problems', 'Abstract thinking',
        'Complex patterns', 'Area and perimeter',
        'Any operation beyond single digits'
      ],
      problemTypes: [
        'Direct counting with pictures',
        'One-step addition with objects',
        'Pattern completion with visuals',
        'Matching numbers to quantities',
        'Simple sorting activities'
      ],
      numberRange: '0-20 maximum, prefer 0-10'
    },
    instructionalApproaches: {
      recommended: [
        'Use pictures and objects for every concept',
        'Repeat key ideas multiple times',
        'Connect to familiar experiences',
        'Use songs, rhymes, or games',
        'Provide immediate feedback',
        'Use simple, direct language'
      ],
      avoid: [
        'Abstract explanations',
        'Multi-step reasoning',
        'Complex vocabulary',
        'Long explanations',
        'Theoretical frameworks',
        'Advanced terminology'
      ],
      attentionSpan: '5-10 minutes per activity',
      scaffolding: [
        'Start with concrete objects',
        'Move to pictures',
        'Finally introduce symbols',
        'Lots of practice at each stage'
      ]
    },
    exerciseTypes: {
      effective: [
        'Circle the correct answer',
        'Draw lines to match',
        'Color or circle objects',
        'Trace numbers or shapes',
        'Simple fill-in-the-blank with pictures'
      ],
      inappropriate: [
        'Multi-step word problems',
        'Written explanations',
        'Complex reasoning tasks',
        'Abstract thinking exercises',
        'Problems requiring calculation strategies'
      ],
      maxStepsPerProblem: 1,
      supportNeeded: [
        'Visual cues for every problem',
        'Simple, clear instructions',
        'Examples shown first',
        'Pictures to support text'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 4,
      idealSectionLength: '200-300 words maximum',
      repetitionNeeded: true,
      conceptIntroductionStyle: 'Start with real objects/pictures, use simple language, repeat key points'
    }
  },

  '3-5': {
    gradeBand: '3-5',
    ageRange: '8-11 years old',
    cognitiveCapabilities: [
      'Developing abstract thinking',
      'Can handle 2-3 step processes',
      'Beginning logical reasoning',
      'Can understand basic relationships',
      'Developing reading comprehension'
    ],
    vocabularyLevel: {
      maxSyllables: 3,
      avoidTerms: [
        'sophisticated', 'comprehensive', 'methodology', 'theoretical',
        'paradigm', 'synthesis', 'abstract concepts', 'complex analysis'
      ],
      preferredTerms: [
        'explain', 'compare', 'describe', 'solve', 'organize',
        'identify', 'classify', 'order', 'estimate', 'predict'
      ],
      exampleSentenceLength: '8-12 words'
    },
    mathematicalConcepts: {
      appropriate: [
        'Multi-digit addition/subtraction', 'Basic multiplication',
        'Simple fractions (halves, thirds, fourths)',
        'Basic geometry shapes and properties',
        'Simple word problems', 'Basic measurement',
        'Data collection and simple graphs'
      ],
      tooAdvanced: [
        'Complex fractions', 'Algebra', 'Advanced geometry',
        'Complex multi-step problems', 'Theoretical math',
        'Advanced statistics', 'Complex problem-solving strategies'
      ],
      problemTypes: [
        '2-3 step word problems',
        'Basic strategy development',
        'Pattern analysis',
        'Simple mathematical reasoning',
        'Concrete to abstract transitions'
      ],
      numberRange: '0-1000, comfortable with 0-100'
    },
    instructionalApproaches: {
      recommended: [
        'Use visual models when possible',
        'Connect to real-world examples',
        'Build on prior knowledge',
        'Use step-by-step explanations',
        'Encourage strategy sharing'
      ],
      avoid: [
        'Overly abstract concepts',
        'Complex theoretical explanations',
        'Too many steps at once',
        'Advanced vocabulary without explanation'
      ],
      attentionSpan: '15-20 minutes per activity',
      scaffolding: [
        'Use concrete examples first',
        'Introduce visual models',
        'Practice with guidance',
        'Move toward independence'
      ]
    },
    exerciseTypes: {
      effective: [
        'Multi-step word problems',
        'Comparing and contrasting',
        'Pattern completion',
        'Simple reasoning tasks',
        'Show your work problems'
      ],
      inappropriate: [
        'Highly abstract reasoning',
        'Complex theoretical problems',
        'Advanced mathematical proofs',
        'Multi-layered complex problems'
      ],
      maxStepsPerProblem: 3,
      supportNeeded: [
        'Clear step-by-step instructions',
        'Visual supports when helpful',
        'Examples provided',
        'Structured problem format'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 5,
      idealSectionLength: '300-500 words',
      repetitionNeeded: true,
      conceptIntroductionStyle: 'Build from familiar concepts, use examples, provide practice'
    }
  },

  '6-8': {
    gradeBand: '6-8',
    ageRange: '11-14 years old',
    cognitiveCapabilities: [
      'Developing formal operational thinking',
      'Can handle abstract concepts with support',
      'Multi-step reasoning abilities',
      'Beginning to understand complex relationships',
      'Can work with hypothetical situations'
    ],
    vocabularyLevel: {
      maxSyllables: 4,
      avoidTerms: [
        'paradigmatic', 'epistemological', 'heuristic', 'pedagogical framework',
        'meta-cognitive strategies', 'theoretical construct'
      ],
      preferredTerms: [
        'analyze', 'evaluate', 'synthesize', 'investigate', 'construct',
        'demonstrate', 'justify', 'critique', 'design', 'develop'
      ],
      exampleSentenceLength: '10-15 words'
    },
    mathematicalConcepts: {
      appropriate: [
        'Pre-algebra concepts', 'Ratios and proportions',
        'Advanced fractions and decimals', 'Basic geometry proofs',
        'Statistical analysis', 'Functions and relationships',
        'Problem-solving strategies'
      ],
      tooAdvanced: [
        'Advanced calculus', 'Complex theoretical proofs',
        'Advanced statistics', 'Abstract algebra',
        'Complex mathematical modeling'
      ],
      problemTypes: [
        'Multi-step problem solving',
        'Mathematical reasoning',
        'Real-world applications',
        'Pattern analysis and extension',
        'Beginning proof techniques'
      ],
      numberRange: 'No specific limits, focus on understanding'
    },
    instructionalApproaches: {
      recommended: [
        'Use inquiry-based learning',
        'Connect to real-world applications',
        'Encourage mathematical discourse',
        'Develop problem-solving strategies',
        'Use multiple representations'
      ],
      avoid: [
        'Overly theoretical approaches',
        'Too much abstraction without foundation',
        'Complex notation without explanation'
      ],
      attentionSpan: '25-30 minutes per activity',
      scaffolding: [
        'Review prerequisite concepts',
        'Use guided practice',
        'Provide multiple examples',
        'Encourage independent application'
      ]
    },
    exerciseTypes: {
      effective: [
        'Complex word problems',
        'Investigation tasks',
        'Proof construction',
        'Real-world modeling',
        'Multiple solution strategies'
      ],
      inappropriate: [
        'Extremely abstract theoretical work',
        'Advanced mathematical research',
        'College-level complexity'
      ],
      maxStepsPerProblem: 5,
      supportNeeded: [
        'Clear problem structure',
        'Strategy hints when needed',
        'Multiple approaches shown',
        'Connection to prior learning'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 6,
      idealSectionLength: '400-600 words',
      repetitionNeeded: false,
      conceptIntroductionStyle: 'Build conceptual understanding, connect to applications, develop fluency'
    }
  },

  '9-10': {
    gradeBand: '9-10',
    ageRange: '14-16 years old',
    cognitiveCapabilities: [
      'Formal operational thinking developing',
      'Can handle abstract concepts',
      'Multi-layered reasoning',
      'Hypothetical and deductive reasoning',
      'Can work with complex systems'
    ],
    vocabularyLevel: {
      maxSyllables: 5,
      avoidTerms: [
        'Highly specialized academic jargon without context'
      ],
      preferredTerms: [
        'analyze critically', 'synthesize information', 'evaluate evidence',
        'construct arguments', 'develop theories', 'apply principles'
      ],
      exampleSentenceLength: '12-18 words'
    },
    mathematicalConcepts: {
      appropriate: [
        'Algebra I & II', 'Geometry', 'Advanced functions',
        'Trigonometry basics', 'Statistics and probability',
        'Mathematical modeling', 'Logical reasoning'
      ],
      tooAdvanced: [
        'Advanced calculus', 'Abstract algebra',
        'Advanced mathematical analysis', 'Graduate-level theory'
      ],
      problemTypes: [
        'Complex multi-step problems',
        'Mathematical modeling',
        'Proof construction',
        'Advanced problem-solving',
        'Application projects'
      ],
      numberRange: 'No limits, include complex numbers as appropriate'
    },
    instructionalApproaches: {
      recommended: [
        'Project-based learning',
        'Mathematical investigations',
        'Technology integration',
        'Collaborative problem solving',
        'Real-world connections'
      ],
      avoid: [
        'Overly theoretical without application',
        'Excessive computational practice without understanding'
      ],
      attentionSpan: '35-45 minutes per activity',
      scaffolding: [
        'Build on prior knowledge',
        'Use guided discovery',
        'Provide challenging extensions',
        'Encourage mathematical communication'
      ]
    },
    exerciseTypes: {
      effective: [
        'Extended investigations',
        'Complex modeling tasks',
        'Proof development',
        'Multi-part projects',
        'Technology-enhanced problems'
      ],
      inappropriate: [
        'Graduate-level research',
        'Highly specialized topics without foundation'
      ],
      maxStepsPerProblem: 8,
      supportNeeded: [
        'Clear expectations',
        'Scaffolded complexity',
        'Resources for extension',
        'Peer collaboration opportunities'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 7,
      idealSectionLength: '500-700 words',
      repetitionNeeded: false,
      conceptIntroductionStyle: 'Present complex ideas clearly, connect to broader themes, encourage deep thinking'
    }
  },

  '11-12': {
    gradeBand: '11-12',
    ageRange: '16-18 years old',
    cognitiveCapabilities: [
      'Full formal operational thinking',
      'Advanced abstract reasoning',
      'Complex system analysis',
      'Independent research abilities',
      'Advanced critical thinking'
    ],
    vocabularyLevel: {
      maxSyllables: 6,
      avoidTerms: [],
      preferredTerms: [
        'critically analyze', 'synthesize complex information',
        'evaluate multiple perspectives', 'construct sophisticated arguments',
        'develop original theories', 'apply advanced principles'
      ],
      exampleSentenceLength: '15-25 words'
    },
    mathematicalConcepts: {
      appropriate: [
        'Calculus', 'Advanced statistics', 'Advanced algebra',
        'Mathematical analysis', 'Abstract thinking',
        'Advanced problem-solving', 'Mathematical research'
      ],
      tooAdvanced: [
        'Graduate-level mathematical research',
        'Highly specialized advanced topics'
      ],
      problemTypes: [
        'Research projects',
        'Advanced mathematical modeling',
        'Complex proof construction',
        'Independent investigations',
        'Capstone projects'
      ],
      numberRange: 'No limits, full mathematical scope'
    },
    instructionalApproaches: {
      recommended: [
        'Independent research',
        'Advanced project work',
        'Seminar-style discussions',
        'Peer teaching',
        'Technology integration',
        'Real-world applications'
      ],
      avoid: [
        'Overly simplistic approaches',
        'Lack of intellectual challenge'
      ],
      attentionSpan: '45-60 minutes per activity',
      scaffolding: [
        'Provide advanced resources',
        'Encourage independent discovery',
        'Support original thinking',
        'Facilitate peer collaboration'
      ]
    },
    exerciseTypes: {
      effective: [
        'Research projects',
        'Advanced modeling',
        'Independent investigations',
        'Capstone experiences',
        'Peer presentations'
      ],
      inappropriate: [
        'Overly simplistic tasks',
        'Repetitive drill work'
      ],
      maxStepsPerProblem: 12,
      supportNeeded: [
        'Advanced resources',
        'Mentorship opportunities',
        'Research guidance',
        'Technology access'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 8,
      idealSectionLength: '600-1000 words',
      repetitionNeeded: false,
      conceptIntroductionStyle: 'Present advanced concepts, encourage original thinking, connect to career paths'
    }
  },

  'adult': {
    gradeBand: 'adult',
    ageRange: '18+ years old',
    cognitiveCapabilities: [
      'Mature cognitive abilities',
      'Life experience integration',
      'Self-directed learning',
      'Complex reasoning',
      'Professional application focus'
    ],
    vocabularyLevel: {
      maxSyllables: 8,
      avoidTerms: [],
      preferredTerms: [
        'professional application', 'real-world implementation',
        'career development', 'practical skills', 'industry standards'
      ],
      exampleSentenceLength: '15-30 words'
    },
    mathematicalConcepts: {
      appropriate: [
        'All mathematical concepts',
        'Professional applications',
        'Industry-specific math',
        'Advanced research',
        'Specialized topics'
      ],
      tooAdvanced: [],
      problemTypes: [
        'Professional scenarios',
        'Real-world applications',
        'Industry problems',
        'Research questions',
        'Practical implementations'
      ],
      numberRange: 'No limits, full scope'
    },
    instructionalApproaches: {
      recommended: [
        'Self-directed learning',
        'Professional development focus',
        'Real-world applications',
        'Flexible pacing',
        'Technology integration',
        'Peer collaboration'
      ],
      avoid: [
        'Overly academic without application',
        'Rigid structured approaches'
      ],
      attentionSpan: '60+ minutes, self-paced',
      scaffolding: [
        'Build on life experience',
        'Connect to professional goals',
        'Provide multiple pathways',
        'Support self-assessment'
      ]
    },
    exerciseTypes: {
      effective: [
        'Case studies',
        'Professional scenarios',
        'Portfolio development',
        'Capstone projects',
        'Certification preparation'
      ],
      inappropriate: [
        'Overly simplistic approaches',
        'Child-oriented activities'
      ],
      maxStepsPerProblem: 15,
      supportNeeded: [
        'Professional resources',
        'Industry connections',
        'Certification pathways',
        'Flexible scheduling'
      ]
    },
    contentStructure: {
      maxSectionsRecommended: 10,
      idealSectionLength: '700-1200 words',
      repetitionNeeded: false,
      conceptIntroductionStyle: 'Focus on practical application, connect to career goals, provide comprehensive coverage'
    }
  }
};

export class GradeLevelContentService {
  
  /**
   * Get comprehensive guidelines for a specific grade band
   */
  static getGuidelines(gradeBand: GradeBandType): GradeLevelGuidelines {
    return GRADE_LEVEL_GUIDELINES[gradeBand];
  }

  /**
   * Generate grade-appropriate content constraints for AI prompts
   */
  static getContentConstraints(gradeBand: GradeBandType): string {
    const guidelines = this.getGuidelines(gradeBand);
    
    return `
GRADE LEVEL: ${guidelines.gradeBand} (Ages ${guidelines.ageRange})

CRITICAL CONTENT CONSTRAINTS:
- Maximum syllables per word: ${guidelines.vocabularyLevel.maxSyllables}
- Sentence length: ${guidelines.vocabularyLevel.exampleSentenceLength}
- Attention span: ${guidelines.instructionalApproaches.attentionSpan}
- Max steps per problem: ${guidelines.exerciseTypes.maxStepsPerProblem}
- Section length: ${guidelines.contentStructure.idealSectionLength}

FORBIDDEN VOCABULARY: ${guidelines.vocabularyLevel.avoidTerms.join(', ')}

REQUIRED APPROACH:
${guidelines.instructionalApproaches.recommended.map(approach => `- ${approach}`).join('\n')}

AVOID:
${guidelines.instructionalApproaches.avoid.map(avoid => `- ${avoid}`).join('\n')}

EXERCISE TYPES TO USE:
${guidelines.exerciseTypes.effective.map(type => `- ${type}`).join('\n')}

EXERCISE TYPES TO AVOID:
${guidelines.exerciseTypes.inappropriate.map(type => `- ${type}`).join('\n')}
`;
  }

  /**
   * Generate math-specific constraints
   */
  static getMathConstraints(gradeBand: GradeBandType): string {
    const guidelines = this.getGuidelines(gradeBand);
    
    return `
MATHEMATICS CONSTRAINTS FOR ${gradeBand.toUpperCase()}:

APPROPRIATE CONCEPTS: ${guidelines.mathematicalConcepts.appropriate.join(', ')}

TOO ADVANCED (DO NOT USE): ${guidelines.mathematicalConcepts.tooAdvanced.join(', ')}

NUMBER RANGE: ${guidelines.mathematicalConcepts.numberRange}

PROBLEM TYPES: ${guidelines.mathematicalConcepts.problemTypes.join(', ')}
`;
  }

  /**
   * Validate if content is appropriate for grade level
   */
  static validateContent(content: string, gradeBand: GradeBandType): {
    isAppropriate: boolean;
    violations: string[];
    suggestions: string[];
  } {
    const guidelines = this.getGuidelines(gradeBand);
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check for forbidden vocabulary
    const lowerContent = content.toLowerCase();
    guidelines.vocabularyLevel.avoidTerms.forEach(term => {
      if (lowerContent.includes(term.toLowerCase())) {
        violations.push(`Contains inappropriate vocabulary: "${term}"`);
        suggestions.push(`Replace "${term}" with simpler language`);
      }
    });

    // Check sentence length (approximate)
    const sentences = content.split(/[.!?]+/);
    const longSentences = sentences.filter(sentence => {
      const wordCount = sentence.trim().split(/\s+/).length;
      const maxWords = parseInt(guidelines.vocabularyLevel.exampleSentenceLength.split(' ')[0]) + 5;
      return wordCount > maxWords;
    });

    if (longSentences.length > 0) {
      violations.push(`Contains sentences that are too long for grade level`);
      suggestions.push(`Break long sentences into shorter, simpler ones`);
    }

    // Check for inappropriate math concepts
    if (gradeBand === 'k-2') {
      if (lowerContent.includes('multiplication') || lowerContent.includes('division')) {
        violations.push(`Contains advanced math concepts (multiplication/division) inappropriate for K-2`);
        suggestions.push(`Focus on counting, simple addition, and visual representations`);
      }
    }

    return {
      isAppropriate: violations.length === 0,
      violations,
      suggestions
    };
  }

  /**
   * Get example appropriate content for a grade level
   */
  static getExampleContent(gradeBand: GradeBandType, topic: string): string {
    switch (gradeBand) {
      case 'k-2':
        return `Let's count together! Look at the pictures. Can you count how many apples you see? Point to each apple as you count: 1, 2, 3. Great job! Now try counting the balls.`;
      
      case '3-5':
        return `In this section, we will learn about ${topic}. First, let's review what we already know. Then we'll practice with examples. Finally, you'll try some problems on your own.`;
      
      case '6-8':
        return `Understanding ${topic} requires us to analyze the relationship between different elements. We'll investigate patterns, develop strategies for problem-solving, and apply our knowledge to real-world situations.`;
      
      case '9-10':
        return `In this comprehensive exploration of ${topic}, we will critically examine the underlying principles, construct mathematical models, and evaluate multiple approaches to complex problems.`;
      
      case '11-12':
        return `This advanced study of ${topic} will challenge you to synthesize complex information, develop original approaches to sophisticated problems, and conduct independent research in the field.`;
      
      case 'adult':
        return `This professional development module on ${topic} will provide practical skills for workplace application, industry-standard methodologies, and career advancement opportunities.`;
      
      default:
        return `Content about ${topic} appropriate for your level.`;
    }
  }
}