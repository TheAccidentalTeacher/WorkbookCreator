import { TextDensityLevel, VisualContentService, VisualContentOptions } from './visualContentService';

export interface SimpleWorkbookRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  pageCount?: number;
  textDensity?: TextDensityLevel;
  visualOptions?: VisualContentOptions;
  fastMode?: boolean;
}

export class ClientSafeSimplePromptGenerator {
  /**
   * Generate just the prompts without making API calls - for export/manual use
   * This is client-safe and doesn't import any Node.js modules
   */
  generatePrompts(request: SimpleWorkbookRequest): {
    workbookPrompt: string;
    imagePrompts?: string[];
  } {
    const workbookPrompt = this.buildCompleteWorkbookPrompt(request);
    
    // Generate optional image prompts for major sections
    const imagePrompts = this.generateImagePrompts(request);
    
    return {
      workbookPrompt,
      imagePrompts: imagePrompts.length > 0 ? imagePrompts : undefined
    };
  }

  private buildCompleteWorkbookPrompt(request: SimpleWorkbookRequest): string {
    const visualInstructions = request.textDensity ? 
      VisualContentService.generateVisualContentPrompt(
        request.textDensity,
        request.subject as 'mathematics' | 'science' | 'english_language_arts' | 'social_studies' | 'history' | 'geography' | 'art' | 'music' | 'physical_education' | 'computer_science' | 'foreign_language' | 'other',
        request.gradeLevel as 'k-2' | '3-5' | '6-8' | '9-10' | '11-12' | 'adult',
        request.visualOptions || VisualContentService.getDefaultVisualOptions()
      ) : '';

    const pageCount = request.pageCount || 4;
    const sectionCount = Math.max(2, Math.min(6, pageCount - 1)); // 2-6 sections based on page count

    return `# Create a Complete Educational Workbook

## Topic: ${request.topic}
## Subject: ${request.subject}
## Grade Level: ${request.gradeLevel}
## Target Pages: ${pageCount}
## Sections: ${sectionCount}

${visualInstructions}

## CRITICAL REQUIREMENTS:

### 1. WORKBOOK STRUCTURE
Create a complete workbook with exactly ${sectionCount} main learning sections plus introduction and conclusion.

### 2. VISUAL CONTENT REQUIREMENTS
${this.getVisualRequirements(request)}

### 3. LEARNING PROGRESSION
- Start with foundational concepts
- Build complexity gradually
- Include hands-on activities
- End with synthesis and review

### 4. AGE-APPROPRIATE CONTENT
${this.getAgeSpecificRequirements(request.gradeLevel)}

### 5. SECTION REQUIREMENTS
Each section must include:
- Clear learning objective
- Engaging introduction
- Core concept explanation
- Visual elements (VISUAL SCENE DESCRIPTION: [detailed description])
- Practice activities/exercises
- Quick assessment questions
- Real-world connections

### 6. OUTPUT FORMAT
Return a complete workbook in this exact JSON structure:

\`\`\`json
{
  "title": "Complete workbook title",
  "introduction": "Engaging workbook introduction with learning goals",
  "sections": [
    {
      "title": "Section 1 Title",
      "objective": "What students will learn",
      "content": "Complete section content with VISUAL SCENE DESCRIPTION: [detailed visual descriptions] embedded throughout",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "assessment": "Quick check questions or mini-quiz"
    }
  ],
  "conclusion": "Summary and next steps for continued learning"
}
\`\`\`

### 7. VISUAL INTEGRATION
Throughout the content, embed visual descriptions using this format:
VISUAL SCENE DESCRIPTION: [Detailed description of illustration, diagram, or interactive element that would help students understand the concept]

### 8. QUALITY STANDARDS
- Content must be educationally sound
- Age-appropriate language and concepts
- Engaging and interactive
- Practical and applicable
- Properly scaffolded learning

Create the complete workbook now following all requirements above.`;
  }

  private getVisualRequirements(request: SimpleWorkbookRequest): string {
    const density = request.textDensity || 'minimal';
    
    switch (density) {
      case 'minimal':
        return `- ULTRA VISUAL-FIRST: 85-90% visual content, minimal text
- Every concept explained through visuals first
- Rich illustrations, diagrams, and interactive elements
- Text serves only to support visuals
- Maximum creativity and engagement`;
        
      case 'moderate':
        return `- BALANCED VISUAL-TEXT: 65% visual, 35% text
- Strong visual support for all concepts
- Complementary text explanations
- Good balance of creativity and information`;
        
      case 'text-heavy':
        return `- TEXT-SUPPORTED: 35% visual, 65% text
- Traditional text-based learning with strategic visual support
- Detailed explanations with supporting diagrams
- Academic approach with visual reinforcement`;
        
      default:
        return `- VISUAL-FIRST approach with creative elements`;
    }
  }

  private getAgeSpecificRequirements(gradeLevel: string): string {
    switch (gradeLevel) {
      case 'k-2':
        return `- Very simple language (kindergarten-2nd grade level)
- Large, colorful visuals and minimal text
- Hands-on activities and games
- Concrete examples from daily life
- Short attention span activities (5-10 minutes)
- Interactive and playful approach`;
        
      case '3-5':
        return `- Elementary language (3rd-5th grade level)
- Clear visual supports with moderate text
- Group activities and collaborative learning
- Beginning abstract thinking with concrete examples
- 15-20 minute activity segments
- Fun and engaging approach`;
        
      case '6-8':
        return `- Middle school language (6th-8th grade level)
- Good balance of visual and textual information
- Individual and group work opportunities
- Abstract thinking with practical applications
- 20-30 minute activity segments
- Age-appropriate topics and examples`;
        
      case '9-10':
        return `- High school language (9th-10th grade level)
- Complex visual aids supporting detailed content
- Independent learning opportunities
- Higher-order thinking skills
- 30-45 minute activity segments
- Real-world applications and career connections`;
        
      case '11-12':
        return `- Advanced high school language (11th-12th grade level)
- Sophisticated visual analysis tools
- Independent research and critical thinking
- College and career preparation focus
- Extended project-based activities
- Advanced applications and case studies`;
        
      case 'adult':
        return `- Adult learning principles
- Professional and practical applications
- Self-directed learning opportunities
- Real-world problem solving
- Flexible pacing and modular content
- Career and life skill focus`;
        
      default:
        return `- Age-appropriate content and language
- Engaging visual and interactive elements
- Practical applications and examples`;
    }
  }

  private generateImagePrompts(request: SimpleWorkbookRequest): string[] {
    const imagePrompts: string[] = [];
    const sectionCount = Math.max(2, Math.min(6, (request.pageCount || 4) - 1));
    
    // Generate prompts for key visual elements
    for (let i = 1; i <= Math.min(sectionCount, 3); i++) {
      imagePrompts.push(`Educational illustration for ${request.subject} topic "${request.topic}" suitable for grade ${request.gradeLevel}, section ${i}. Professional, clear, engaging, and age-appropriate visual that helps explain key concepts. Bright colors, clean design, educational style.`);
    }
    
    return imagePrompts;
  }
}