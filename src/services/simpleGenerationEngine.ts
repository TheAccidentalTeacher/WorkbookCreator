import { AIService } from './aiService';
import { TextDensityLevel, VisualContentOptions } from './visualContentService';
import { educationalImageSearchService } from './educationalImageSearchService';

export interface SimpleWorkbookRequest {
  topic: string;
  subject: string;
  gradeLevel: string;
  pageCount?: number;
  textDensity?: TextDensityLevel;
  visualOptions?: VisualContentOptions;
  includeImages?: boolean;
  fastMode?: boolean; // Skip images for ultra-fast generation
}

export interface SimpleWorkbookSection {
  title: string;
  content: string;
  exercises: Array<{
    type: 'multiple_choice' | 'fill_blank' | 'short_answer' | 'drawing';
    question: string;
    options?: string[];
    answer: string;
    explanation?: string;
  }>;
  images?: Array<{
    url: string;
    localPath?: string; // Path to downloaded local image for web access
    base64Data?: string; // Base64 encoded image data for PDF embedding
    description: string;
    placement: 'header' | 'inline';
  }>;
}

export interface SimpleWorkbook {
  id: string;
  title: string;
  topic: string;
  sections: SimpleWorkbookSection[];
  generatedAt: Date;
  generationTime: number;
  metadata: {
    mode: 'simple' | 'fast';
    apiCalls: number;
    cost: number;
  };
}

export class SimpleGenerationEngine {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate a complete workbook using the simple approach
   */
  async generateWorkbook(request: SimpleWorkbookRequest): Promise<SimpleWorkbook> {
    const startTime = Date.now();
    const workbookId = `wb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🚀 Starting simple generation for: ${request.topic}`);

    // Build the prompt for workbook generation
    const prompt = this.buildCompleteWorkbookPrompt(request);

    console.log('🔍 [DEBUG] Generated Prompt Length:', prompt.length);
    console.log('🔍 [DEBUG] Include Images in Prompt:', request.includeImages);
    console.log('🔍 [DEBUG] Prompt Preview (first 800 chars):', prompt.substring(0, 800));

    // Generate the complete workbook in one call
    const response = await this.aiService.generateCompletion(prompt, 'gpt-4', {
      temperature: 0.7
    });

    console.log('🚨 [CRITICAL DEBUG] About to parse workbook response!');
    console.log('🚨 [CRITICAL DEBUG] Response content length:', response.content.length);

    // Parse the response
    const workbookData = this.parseWorkbookResponse(response.content);

    let apiCalls = 1;
    let totalCost = response.cost || 0;

    // Generate images if requested and not in fast mode
    let sectionsWithImages = workbookData.sections;
    
    console.log('🔍 [DEBUG] request.includeImages:', request.includeImages);
    console.log('🔍 [DEBUG] request.fastMode:', request.fastMode);
    console.log('🔍 [DEBUG] Will generate images:', request.includeImages && !request.fastMode);

    if (request.includeImages && !request.fastMode) {
      console.log('🎨 Generating images for sections...');
      sectionsWithImages = await this.generateSectionImages(
        workbookData.sections,
        request.gradeLevel,
        request.subject
      );
      
      // Estimate additional API calls and cost
      apiCalls += sectionsWithImages.filter(s => s.images && s.images.length > 0).reduce((sum, s) => sum + (s.images?.length || 0), 0);
      totalCost += apiCalls * 0.02; // Rough estimate
    } else {
      console.log('⏭️ Skipping image generation - includeImages:', request.includeImages, 'fastMode:', request.fastMode);
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    console.log(`✅ Simple generation completed in ${Math.round(generationTime / 1000)}s with ${apiCalls} API calls`);

    return {
      id: workbookId,
      title: workbookData.title,
      topic: request.topic,
      sections: sectionsWithImages,
      generatedAt: new Date(),
      generationTime,
      metadata: {
        mode: request.fastMode ? 'fast' : 'simple',
        apiCalls,
        cost: totalCost
      }
    };
  }

  /**
   * Generate just the prompts without making API calls - for export/manual use
   */
  generatePrompts(request: SimpleWorkbookRequest): {
    workbookPrompt: string;
    imagePrompts?: string[];
  } {
    const workbookPrompt = this.buildCompleteWorkbookPrompt(request);
    
    let imagePrompts: string[] = [];
    if (request.includeImages) {
      // Generate sample image prompts based on typical sections
      const sampleSections = ['Introduction', 'Core Concepts', 'Practice Problems', 'Real-World Applications'];
      imagePrompts = sampleSections.map(section => 
        `Create a colorful, educational illustration for "${section}" in ${request.topic}. Grade level: ${request.gradeLevel}. Subject: ${request.subject}. Style: cartoon, bright colors, simple design, no text in image.`
      );
    }

    return {
      workbookPrompt,
      imagePrompts: request.includeImages ? imagePrompts : undefined
    };
  }

  /**
   * Build a comprehensive prompt that generates the entire workbook in one go
   */
  private buildCompleteWorkbookPrompt(request: SimpleWorkbookRequest): string {
    const sectionCount = request.pageCount ? Math.max(3, request.pageCount - 1) : 4;

    return `Create a complete educational workbook about "${request.topic}" for ${request.gradeLevel} students in ${request.subject}.

REQUIREMENTS:
- Generate ${sectionCount} main sections
- Each section should be substantial enough for learning
- Include 2-3 exercises per section with varied types
- Make content ${request.textDensity} text density
- Grade level: ${request.gradeLevel}
- Keep vocabulary appropriate for ${request.gradeLevel} students
- Use clear, simple sentence structure

${request.includeImages ? `
IMAGE GENERATION INSTRUCTIONS:
- Include "VISUAL SCENE DESCRIPTION: [detailed description]" in content where images should appear
- Maximum 1-2 image descriptions per section
- Descriptions should be detailed enough for AI image generation
- Images should be educational, colorful, and age-appropriate
- No text should appear in the described images
` : ''}

RESPONSE FORMAT - Return valid JSON only:
{
  "title": "Engaging workbook title",
  "sections": [
    {
      "title": "Section title",
      "content": "Complete educational content including concepts, examples, and explanations. ${request.includeImages ? 'Include VISUAL SCENE DESCRIPTION: [detailed image description] where appropriate.' : ''}",
      "exercises": [
        {
          "type": "multiple_choice",
          "question": "Question text",
          "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          "answer": "A) Correct answer",
          "explanation": "Why this is correct"
        },
        {
          "type": "fill_blank",
          "question": "Fill in the blank: The _____ is important because _____.",
          "answer": "correct word",
          "explanation": "Explanation of the answer"
        },
        {
          "type": "short_answer",
          "question": "Explain why...",
          "answer": "Sample answer for teacher reference",
          "explanation": "What students should understand"
        }
      ]
    }
  ]
}

IMPORTANT: Return ONLY the JSON response with no other text, explanations, or markdown formatting.`;
  }

  /**
   * Parse the AI response into workbook data
   */
  private parseWorkbookResponse(response: string): { title: string; sections: SimpleWorkbookSection[] } {
    console.log('🔍 [DEBUG] Raw AI Response Length:', response.length);
    console.log('🔍 [DEBUG] Raw AI Response (first 500 chars):', response.substring(0, 500));
    console.log('🔍 [DEBUG] Raw AI Response (last 500 chars):', response.substring(Math.max(0, response.length - 500)));

    try {
      // Clean the response - remove any markdown code blocks or extra text
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      cleanResponse = cleanResponse.replace(/^```\s*/i, '').replace(/```\s*$/, '');
      
      console.log('🔍 [DEBUG] Extracted JSON:', cleanResponse);

      const data = JSON.parse(cleanResponse);
      
      console.log('🔍 [DEBUG] Parsed JSON structure:', JSON.stringify(data, null, 2));

      // Normalize the sections to ensure all exercises have required fields
      const normalizedSections = data.sections.map((section: SimpleWorkbookSection) => ({
        ...section,
        exercises: (section.exercises || []).map((exercise) => ({
          ...exercise,
          // Add correctAnswer field that maps to answer
          correctAnswer: exercise.answer || (exercise as {correctAnswer?: string}).correctAnswer,
          // Add prompt field that maps to question
          prompt: exercise.question || (exercise as {prompt?: string}).prompt
        }))
      }));

      console.log('🔍 [DEBUG] Fixed sections:', JSON.stringify(normalizedSections, null, 2));

      return {
        title: data.title,
        sections: normalizedSections
      };
    } catch (error) {
      console.error('❌ Failed to parse workbook response:', error);
      console.error('Response content:', response);
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  /**
   * Generate images for workbook sections using real educational images
   */
  private async generateSectionImages(
    sections: SimpleWorkbookSection[],
    gradeLevel: string,
    subject: string
  ): Promise<SimpleWorkbookSection[]> {
    const sectionsWithImages = [];

    for (const section of sections) {
      const sectionWithImages = { ...section };
      
      // Extract visual descriptions from content
      const visualPattern = /VISUAL SCENE DESCRIPTION:\s*([^.!?]*[.!?])/gi;
      const matches = section.content.match(visualPattern);
      
      if (matches && matches.length > 0) {
        const images = [];
        
        for (let i = 0; i < Math.min(matches.length, 1); i++) { // Max 1 image per section to reduce API calls
          const description = matches[i].replace(/VISUAL SCENE DESCRIPTION:\s*/i, '').trim();
          
          try {
            // Create search query from the section title and description
            const searchQuery = this.extractSearchTerms(section.title, description, subject);
            console.log(`🔍 [Educational Images] Searching for: "${searchQuery}" for section: ${section.title}`);
            
            // Search for real educational images instead of generating with DALL-E
            const searchResults = await educationalImageSearchService.searchEducationalImages({
              query: searchQuery,
              subject: this.mapSubjectToCategory(subject),
              gradeLevel: gradeLevel as 'k-2' | '3-5' | '6-8' | '9-12',
              imageType: 'any',
              maxResults: 1
            });

            if (searchResults.length > 0) {
              const bestImage = searchResults[0];
              
              // Download and convert the educational image to base64
              const imageData = await educationalImageSearchService.downloadAndConvertImage(
                bestImage.url,
                bestImage.description
              );

              images.push({
                url: bestImage.url, // Keep original URL for web display
                localPath: imageData.localPath, // Add local path reference
                base64Data: imageData.base64Data, // Add base64 for PDF embedding
                description: bestImage.description,
                placement: i === 0 ? 'header' as const : 'inline' as const
              });

              // Replace the visual description with image reference
              sectionWithImages.content = sectionWithImages.content.replace(
                matches[i],
                `[IMAGE:${bestImage.url}:${bestImage.description}]`
              );

              console.log(`✅ [Educational Images] Found real educational image from ${bestImage.source}: ${bestImage.title}`);
            } else {
              console.warn(`⚠️ [Educational Images] No suitable educational images found for: ${searchQuery}`);
              // Remove the visual description if no image found
              sectionWithImages.content = sectionWithImages.content.replace(matches[i], '');
            }

          } catch (error) {
            console.error(`❌ [Educational Images] Failed to find educational image for section "${section.title}":`, error);
            // Remove the visual description if image search fails
            sectionWithImages.content = sectionWithImages.content.replace(matches[i], '');
          }
        }
        
        if (images.length > 0) {
          sectionWithImages.images = images;
        }
      }
      
      sectionsWithImages.push(sectionWithImages);
    }

    return sectionsWithImages;
  }

  /**
   * Extract search terms from section content for educational image search
   */
  private extractSearchTerms(title: string, description: string, subject: string): string {
    // Remove common educational phrases to get core concepts
    const cleanDescription = description
      .replace(/educational illustration for.*students/gi, '')
      .replace(/cartoon style.*design/gi, '')
      .replace(/professional educational art/gi, '')
      .replace(/no text in image/gi, '')
      .replace(/bright colors/gi, '')
      .trim();

    // Extract key terms from title and description
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    const descriptionWords = cleanDescription.toLowerCase().split(' ')
      .filter(word => word.length > 3 && !['with', 'that', 'this', 'they', 'have', 'been', 'will'].includes(word))
      .slice(0, 5); // Take first 5 meaningful words

    // Combine and create search query
    const searchTerms = [...new Set([...titleWords, ...descriptionWords])].slice(0, 3);
    return searchTerms.join(' ').trim() || subject;
  }

  /**
   * Map our subject names to image search categories
   */
  private mapSubjectToCategory(subject: string): string {
    const subjectMap: { [key: string]: string } = {
      'science': 'science',
      'biology': 'science',
      'chemistry': 'science',
      'physics': 'science',
      'anatomy': 'science',
      'math': 'education',
      'mathematics': 'education',
      'history': 'education',
      'geography': 'education',
      'social studies': 'education',
      'english': 'education',
      'language arts': 'education'
    };

    return subjectMap[subject.toLowerCase()] || 'education';
  }

  /**
   * Get estimated generation time and cost
   */
  getEstimates(request: SimpleWorkbookRequest): {
    estimatedTime: string;
    estimatedCost: string;
    apiCalls: number;
  } {
    const baseApiCalls = 1; // One main generation call
    const imageApiCalls = request.includeImages && !request.fastMode ? 
      Math.min(6, Math.max(2, (request.pageCount || 4) - 1)) : 0;
    
    const totalApiCalls = baseApiCalls + imageApiCalls;
    const estimatedTime = request.fastMode ? '10-20 seconds' : 
                         request.includeImages ? '30-60 seconds' : '15-30 seconds';
    const estimatedCost = `$${(totalApiCalls * 0.03).toFixed(3)} - $${(totalApiCalls * 0.06).toFixed(3)}`;

    return {
      estimatedTime,
      estimatedCost,
      apiCalls: totalApiCalls
    };
  }
}