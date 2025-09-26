/**
 * Visual Content Generation Service
 * 
 * Prioritizes graphics, diagrams, interactive elements, and creative layouts over text.
 * Provides text density controls and visual-first content generation.
 */

import { GradeBandType, SubjectDomainType } from '../types';

export type TextDensityLevel = 'minimal' | 'moderate' | 'text-heavy';

export interface VisualContentOptions {
  textDensity: TextDensityLevel;
  includeIllustrations: boolean;
  includeDiagrams: boolean;
  includeInteractiveElements: boolean;
  includeColorCoding: boolean;
  creativityLevel: 'standard' | 'high' | 'maximum';
}

export interface VisualContentGuidelines {
  textDensity: TextDensityLevel;
  visualRatio: number; // Percentage of content that should be visual (0-100)
  textPerSection: string;
  visualElements: string[];
  layoutApproaches: string[];
  creativityInstructions: string[];
  interactiveElements: string[];
  colorUsage: string[];
}

export const VISUAL_CONTENT_GUIDELINES: Record<TextDensityLevel, VisualContentGuidelines> = {
  'minimal': {
    textDensity: 'minimal',
    visualRatio: 95, // 95% visual, 5% text
    textPerSection: '20-30 words maximum per section',
    visualElements: [
      'HUGE, full-page colorful illustrations dominating every page',
      'Single-word labels or 3-word phrases maximum',
      'Picture-only instruction sequences with arrows',
      'Icon-only navigation - no text labels',
      'Visual story sequences without text narration',
      'Cartoon characters showing emotions and actions',
      'Real photographs with simple visual overlays',
      'Visual games, puzzles, and hands-on activities'
    ],
    layoutApproaches: [
      'Full-page illustrations with tiny text captions only',
      'Picture book style - images tell the story',
      'Comic strip panels with minimal speech bubbles',
      'Photo-journal style with visual documentation',
      'Interactive picture scenes for exploration',
      'Visual flowcharts using only icons and arrows',
      'Hands-on activity pages with visual instructions only'
    ],
    creativityInstructions: [
      'Use massive, engaging illustrations that fill entire pages',
      'Create lovable mascot characters that guide through visuals',
      'Design each page like a children\'s picture book',
      'Use bright, high-contrast colors for maximum appeal',
      'Create interactive elements: circles to trace, areas to color',
      'Design visual games: matching, sorting, counting activities',
      'Use creative page layouts that surprise and delight'
    ],
    interactiveElements: [
      'Trace-the-path activities with thick dotted lines',
      'Color-by-number using only 3-4 colors maximum',
      'Circle-the-answer with big, obvious visual choices',
      'Draw-your-own picture spaces with visual prompts',
      'Cut-and-paste activities with pre-drawn elements',
      'Sticker placement activities with clear visual guides',
      'Simple matching games with identical picture pairs'
    ],
    colorUsage: [
      'Bright, engaging color schemes',
      'Color-coded learning categories',
      'Visual emphasis through color contrast',
      'Mood-appropriate color choices',
      'Accessibility-friendly color combinations'
    ]
  },

  'moderate': {
    textDensity: 'moderate',
    visualRatio: 65, // 65% visual, 35% text
    textPerSection: '150-250 words maximum',
    visualElements: [
      'Supporting illustrations for key concepts',
      'Diagrams and charts for data representation',
      'Visual examples alongside text explanations',
      'Graphic organizers for information structure',
      'Visual cues and highlighting',
      'Process diagrams and flowcharts',
      'Comparative visual tables'
    ],
    layoutApproaches: [
      'Balanced text-visual layouts',
      'Text blocks with supporting graphics',
      'Visual headers and section dividers',
      'Sidebar graphics and callouts',
      'Integrated visual examples',
      'Two-column layouts with visuals'
    ],
    creativityInstructions: [
      'Use consistent visual themes throughout',
      'Create visually appealing text layouts',
      'Design informative and attractive graphics',
      'Use visual emphasis for key points',
      'Create cohesive visual branding'
    ],
    interactiveElements: [
      'Partially visual, partially text-based activities',
      'Diagram completion exercises',
      'Visual-text matching activities',
      'Chart and graph creation tasks',
      'Visual note-taking frameworks'
    ],
    colorUsage: [
      'Professional yet engaging color schemes',
      'Color-coded organization systems',
      'Visual hierarchy through color',
      'Consistent color themes'
    ]
  },

  'text-heavy': {
    textDensity: 'text-heavy',
    visualRatio: 35, // 35% visual, 65% text
    textPerSection: '400-600 words maximum',
    visualElements: [
      'Strategic illustrations for complex concepts',
      'Technical diagrams and detailed charts',
      'Supplementary visual aids',
      'Professional graphics and layouts',
      'Visual summaries and key point highlights'
    ],
    layoutApproaches: [
      'Text-focused layouts with visual support',
      'Academic-style formatting with graphics',
      'Detailed explanations with visual examples',
      'Professional document structure',
      'Text-heavy with strategic visual breaks'
    ],
    creativityInstructions: [
      'Focus on clear, professional presentation',
      'Use visuals to enhance understanding',
      'Create sophisticated graphic elements',
      'Design for serious academic study',
      'Maintain visual consistency and professionalism'
    ],
    interactiveElements: [
      'Text-based analysis exercises',
      'Written reflection activities',
      'Research and documentation tasks',
      'Detailed problem-solving exercises',
      'Academic writing assignments'
    ],
    colorUsage: [
      'Professional, academic color schemes',
      'Subtle color coding for organization',
      'Emphasis colors for key information',
      'Classic, timeless color choices'
    ]
  }
};

export interface VisualContentTemplate {
  title: string;
  description: string;
  visualElements: string[];
  textStructure: string;
  interactiveComponents: string[];
  creativityNotes: string[];
}

export const SUBJECT_VISUAL_TEMPLATES: Record<SubjectDomainType, VisualContentTemplate> = {
  'mathematics': {
    title: 'Math Visual Learning',
    description: 'Graphic-heavy mathematical concept presentation',
    visualElements: [
      'Colorful number lines and counting objects',
      'Visual fraction representations (pizzas, bars, circles)',
      'Geometric shape illustrations and manipulatives',
      'Graph and chart visualizations',
      'Step-by-step visual problem solving',
      'Mathematical concept comics and stories',
      'Visual patterns and sequences'
    ],
    textStructure: 'Brief explanations with visual demonstrations',
    interactiveComponents: [
      'Draw-and-solve problems',
      'Visual pattern completion',
      'Manipulative-style exercises',
      'Color-coded mathematical operations',
      'Picture-based word problems'
    ],
    creativityNotes: [
      'Use mathematical characters and storylines',
      'Create visual math games and puzzles',
      'Design themed mathematical adventures',
      'Use real-world visual contexts'
    ]
  },

  'science': {
    title: 'Science Visual Discovery',
    description: 'Experiment and discovery-focused visual content',
    visualElements: [
      'Scientific diagram illustrations',
      'Process flow visualizations',
      'Nature photography and illustrations',
      'Experiment setup diagrams',
      'Before/after comparison images',
      'Scientific concept infographics',
      'Visual hypothesis and observation charts'
    ],
    textStructure: 'Observation-based descriptions with visual evidence',
    interactiveComponents: [
      'Visual experiment planning',
      'Draw-your-observations activities',
      'Scientific illustration exercises',
      'Visual data collection templates',
      'Picture-based classification tasks'
    ],
    creativityNotes: [
      'Use scientific adventure themes',
      'Create lab mascot characters',
      'Design visual science stories',
      'Use discovery-based visual narratives'
    ]
  },

  'english_language_arts': {
    title: 'Language Arts Visual Storytelling',
    description: 'Story and language-focused visual content',
    visualElements: [
      'Story illustration sequences',
      'Character and setting visualizations',
      'Visual vocabulary building tools',
      'Grammar concept graphics',
      'Reading comprehension visual aids',
      'Writing process flowcharts',
      'Literary element diagrams'
    ],
    textStructure: 'Story-driven content with visual narrative support',
    interactiveComponents: [
      'Story illustration creation',
      'Visual vocabulary building',
      'Character design activities',
      'Picture-story writing prompts',
      'Visual reading comprehension exercises'
    ],
    creativityNotes: [
      'Create engaging story characters',
      'Use diverse visual storytelling styles',
      'Design interactive story elements',
      'Use visual metaphors for language concepts'
    ]
  },

  'social_studies': {
    title: 'Social Studies Visual Exploration',
    description: 'Culture and society-focused visual content',
    visualElements: [
      'Historical timeline visualizations',
      'Cultural illustration galleries',
      'Map and geography graphics',
      'Social concept infographics',
      'Community and society diagrams',
      'Historical event storyboards',
      'Cultural comparison charts'
    ],
    textStructure: 'Story-based historical and social narratives',
    interactiveComponents: [
      'Map creation and exploration',
      'Timeline building exercises',
      'Cultural artifact identification',
      'Community planning activities',
      'Historical role-playing scenarios'
    ],
    creativityNotes: [
      'Use historical characters and stories',
      'Create immersive cultural experiences',
      'Design visual time travel adventures',
      'Use diverse cultural perspectives'
    ]
  },

  'history': {
    title: 'History Visual Timeline',
    description: 'Historical narrative with rich visual storytelling',
    visualElements: [
      'Detailed historical timelines',
      'Period-accurate illustrations',
      'Historical figure portraits and stories',
      'Event sequence visualizations',
      'Cultural artifact displays',
      'Historical map progressions',
      'Before/after historical comparisons'
    ],
    textStructure: 'Narrative storytelling with visual historical evidence',
    interactiveComponents: [
      'Historical detective activities',
      'Timeline construction exercises',
      'Historical figure research projects',
      'Period-based creative activities',
      'Historical perspective comparisons'
    ],
    creativityNotes: [
      'Create historical adventure narratives',
      'Use time period visual themes',
      'Design historical mystery stories',
      'Use authentic historical visual elements'
    ]
  },

  'geography': {
    title: 'Geography Visual Exploration',
    description: 'Location and environment-focused visual content',
    visualElements: [
      'Interactive map displays',
      'Geographic feature illustrations',
      'Climate and weather visualizations',
      'Cultural geography graphics',
      'Environmental process diagrams',
      'Satellite imagery and photography',
      'Comparative geographic charts'
    ],
    textStructure: 'Location-based descriptions with visual geographic evidence',
    interactiveComponents: [
      'Map creation and annotation',
      'Geographic feature identification',
      'Weather pattern tracking',
      'Cultural geography exploration',
      'Environmental impact visualization'
    ],
    creativityNotes: [
      'Create geographic adventure stories',
      'Use travel and exploration themes',
      'Design virtual geographic expeditions',
      'Use diverse global perspectives'
    ]
  },

  'art': {
    title: 'Art Visual Creation',
    description: 'Creative expression and visual arts content',
    visualElements: [
      'Art technique demonstrations',
      'Color theory visualizations',
      'Art history example galleries',
      'Creative process illustrations',
      'Medium exploration displays',
      'Artistic style comparisons',
      'Visual composition guides'
    ],
    textStructure: 'Creative instruction with visual artistic examples',
    interactiveComponents: [
      'Art creation exercises',
      'Style experimentation activities',
      'Color mixing and exploration',
      'Artistic critique and analysis',
      'Creative expression projects'
    ],
    creativityNotes: [
      'Maximize artistic creativity and expression',
      'Use diverse artistic styles and mediums',
      'Encourage experimental artistic approaches',
      'Celebrate artistic diversity and innovation'
    ]
  },

  'music': {
    title: 'Music Visual Harmony',
    description: 'Musical concept visualization and creative expression',
    visualElements: [
      'Musical notation graphics',
      'Instrument illustration galleries',
      'Sound wave visualizations',
      'Rhythm pattern displays',
      'Musical style comparisons',
      'Composer portrait galleries',
      'Musical structure diagrams'
    ],
    textStructure: 'Musical instruction with visual audio-visual connections',
    interactiveComponents: [
      'Rhythm creation activities',
      'Musical pattern recognition',
      'Instrument exploration exercises',
      'Musical composition projects',
      'Audio-visual music analysis'
    ],
    creativityNotes: [
      'Create musical storytelling experiences',
      'Use diverse musical cultural examples',
      'Design interactive musical activities',
      'Use visual music representation'
    ]
  },

  'physical_education': {
    title: 'Physical Education Visual Movement',
    description: 'Movement and health-focused visual content',
    visualElements: [
      'Exercise demonstration graphics',
      'Movement sequence illustrations',
      'Health and fitness infographics',
      'Sports technique diagrams',
      'Body system visualizations',
      'Nutrition and wellness charts',
      'Physical activity tracking displays'
    ],
    textStructure: 'Action-oriented instruction with movement demonstrations',
    interactiveComponents: [
      'Exercise planning activities',
      'Movement sequence creation',
      'Health goal setting exercises',
      'Physical activity tracking',
      'Sports skill development tasks'
    ],
    creativityNotes: [
      'Use active, energetic visual themes',
      'Create movement-based adventures',
      'Design inclusive physical activities',
      'Use motivational visual elements'
    ]
  },

  'computer_science': {
    title: 'Computer Science Visual Logic',
    description: 'Technology and logic-focused visual content',
    visualElements: [
      'Algorithm flowchart diagrams',
      'Programming concept illustrations',
      'Technology system visualizations',
      'Coding logic graphics',
      'Digital design examples',
      'Computer system diagrams',
      'Technology timeline displays'
    ],
    textStructure: 'Logical instruction with visual programming examples',
    interactiveComponents: [
      'Algorithm design activities',
      'Programming logic exercises',
      'Technology exploration projects',
      'Digital creation tasks',
      'System design challenges'
    ],
    creativityNotes: [
      'Use futuristic and technology themes',
      'Create digital adventure stories',
      'Design interactive technology experiences',
      'Use game-like visual elements'
    ]
  },

  'foreign_language': {
    title: 'Foreign Language Visual Communication',
    description: 'Language learning with cultural visual immersion',
    visualElements: [
      'Cultural photography and illustrations',
      'Visual vocabulary building tools',
      'Language structure diagrams',
      'Cultural comparison graphics',
      'Communication scenario illustrations',
      'Language family trees',
      'Cultural celebration displays'
    ],
    textStructure: 'Cultural immersion with visual language examples',
    interactiveComponents: [
      'Visual vocabulary building',
      'Cultural exploration activities',
      'Language practice scenarios',
      'Cultural comparison projects',
      'Communication skill exercises'
    ],
    creativityNotes: [
      'Use authentic cultural visual elements',
      'Create immersive language experiences',
      'Design cultural adventure stories',
      'Use diverse global perspectives'
    ]
  },

  'other': {
    title: 'Creative Visual Learning',
    description: 'Adaptable visual content for any subject',
    visualElements: [
      'Flexible illustration systems',
      'Adaptable graphic frameworks',
      'Universal visual metaphors',
      'Customizable diagram templates',
      'Versatile visual storytelling',
      'Cross-curricular graphics',
      'General visual learning aids'
    ],
    textStructure: 'Flexible content structure adaptable to any subject',
    interactiveComponents: [
      'Universal learning activities',
      'Adaptable exercise templates',
      'Cross-subject applications',
      'Flexible assessment tools',
      'General creative exercises'
    ],
    creativityNotes: [
      'Maximize creative flexibility',
      'Use universal visual appeal',
      'Design adaptable creative elements',
      'Use inclusive visual approaches'
    ]
  }
};

export class VisualContentService {
  
  /**
   * Get visual content guidelines for a specific text density level
   */
  static getVisualGuidelines(textDensity: TextDensityLevel): VisualContentGuidelines {
    return VISUAL_CONTENT_GUIDELINES[textDensity];
  }

  /**
   * Get subject-specific visual content template
   */
  static getSubjectTemplate(subject: SubjectDomainType): VisualContentTemplate {
    return SUBJECT_VISUAL_TEMPLATES[subject];
  }

  /**
   * Generate comprehensive visual content instructions for AI prompts
   */
  static generateVisualContentPrompt(
    textDensity: TextDensityLevel,
    subject: SubjectDomainType,
    gradeBand: GradeBandType,
    _options: VisualContentOptions
  ): string {
    const guidelines = this.getVisualGuidelines(textDensity);
    const template = this.getSubjectTemplate(subject);

    return `
VISUAL-FIRST CONTENT GENERATION REQUIREMENTS:

TEXT DENSITY LEVEL: ${textDensity.toUpperCase()}
- Visual Content Ratio: ${guidelines.visualRatio}% visual elements
- Text Limit Per Section: ${guidelines.textPerSection}
- Target Audience: ${gradeBand} students

MANDATORY VISUAL ELEMENTS:
${guidelines.visualElements.map(element => `• ${element}`).join('\n')}

SUBJECT-SPECIFIC VISUAL APPROACH (${subject}):
${template.visualElements.map(element => `• ${element}`).join('\n')}

LAYOUT REQUIREMENTS:
${guidelines.layoutApproaches.map(approach => `• ${approach}`).join('\n')}

CREATIVITY INSTRUCTIONS:
${guidelines.creativityInstructions.map(instruction => `• ${instruction}`).join('\n')}
${template.creativityNotes.map(note => `• ${note}`).join('\n')}

INTERACTIVE VISUAL ELEMENTS:
${guidelines.interactiveElements.map(element => `• ${element}`).join('\n')}
${template.interactiveComponents.map(component => `• ${component}`).join('\n')}

COLOR AND DESIGN:
${guidelines.colorUsage.map(usage => `• ${usage}`).join('\n')}

CRITICAL REQUIREMENTS:
- ELIMINATE 90% OF ALL TEXT - use only essential single words or 2-3 word phrases
- Every concept MUST be shown visually, not explained with words
- Replace ALL text explanations with visual demonstrations
- Use HUGE, full-page illustrations that dominate the content
- Text should be limited to: single-word labels, character speech bubbles (3 words max), activity instructions (5 words max)
- Design like a wordless picture book that teaches through images
- Create visual sequences that tell the story without narration
- Use visual metaphors and symbols instead of written explanations
- Every exercise should be visual: circle the picture, draw the answer, match images
- Include specific visual element descriptions for graphic designers to implement

FORMAT: Provide comprehensive visual descriptions with absolute minimal supporting text (under 30 words per section).
REMEMBER: If a young child cannot understand it from pictures alone, add more visuals, not more words!
`;
  }

  /**
   * Get default visual content options (visual-first approach)
   */
  static getDefaultVisualOptions(): VisualContentOptions {
    return {
      textDensity: 'minimal', // Default to minimal text, maximum visuals
      includeIllustrations: true,
      includeDiagrams: true,
      includeInteractiveElements: true,
      includeColorCoding: true,
      creativityLevel: 'high'
    };
  }

  /**
   * Validate content against visual-first requirements
   */
  static validateVisualContent(
    content: string,
    textDensity: TextDensityLevel
  ): {
    isVisualFirst: boolean;
    violations: string[];
    suggestions: string[];
    estimatedVisualRatio: number;
  } {
    const guidelines = this.getVisualGuidelines(textDensity);
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Count visual element mentions
    const visualKeywords = [
      'illustration', 'image', 'picture', 'diagram', 'chart', 'graphic',
      'visual', 'color', 'draw', 'show', 'display', 'icon', 'symbol'
    ];
    
    const visualMentions = visualKeywords.reduce((count, keyword) => {
      return count + (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);

    // Estimate visual ratio based on visual element mentions
    const estimatedVisualRatio = Math.min(100, (visualMentions * 10));

    // Check if meets visual ratio requirements
    if (estimatedVisualRatio < guidelines.visualRatio) {
      violations.push(`Content appears to be only ${estimatedVisualRatio}% visual, but requires ${guidelines.visualRatio}%`);
      suggestions.push(`Add more visual elements, illustrations, and graphic descriptions`);
    }

    // Check text length per section
    const maxWords = parseInt(guidelines.textPerSection.split(' ')[0]) || 100;
    const wordCount = content.split(/\s+/).length;
    if (wordCount > maxWords && textDensity === 'minimal') {
      violations.push(`Text is too long (${wordCount} words) for ${textDensity} density`);
      suggestions.push(`Reduce text to under ${maxWords} words and replace with visual descriptions`);
    }

    return {
      isVisualFirst: violations.length === 0 && estimatedVisualRatio >= guidelines.visualRatio,
      violations,
      suggestions,
      estimatedVisualRatio
    };
  }

  /**
   * Generate visual exercise suggestions
   */
  static generateVisualExercises(
    subject: SubjectDomainType,
    textDensity: TextDensityLevel,
    _gradeBand: GradeBandType
  ): string[] {
    const template = this.getSubjectTemplate(subject);
    const guidelines = this.getVisualGuidelines(textDensity);

    return [
      ...template.interactiveComponents,
      ...guidelines.interactiveElements
    ].filter((item, index, array) => array.indexOf(item) === index);
  }
}