// Visual Fraction Worksheet PDF Generator using client-side approach
import { Workbook } from '@/types/workbook';
import { MathRenderer } from '@/utils/mathRenderer';
import { VisualWorksheetPdfGenerator } from './VisualWorksheetPdfGenerator';

// Dynamic import approach for client-side only
export class SimplePdfGenerator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static pdfMake: any = null;
  
  /**
   * Initialize PDFMake with fonts (client-side only)
   */
  private static async initializePdfMake() {
    if (this.pdfMake) return this.pdfMake;
    
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in the browser');
    }
    
    // Dynamic imports for client-side only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfMakeModule = await import('pdfmake/build/pdfmake') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts') as any;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vfs = (pdfFontsModule as any).default || pdfFontsModule;
    
    // Set up fonts
    pdfMake.vfs = vfs.pdfMake?.vfs || vfs.vfs || vfs;
    
    this.pdfMake = pdfMake;
    return pdfMake;
  }
  
  /**
   * Process text content to handle LaTeX math expressions and image placeholders
   */
  private static processMathContent(text: string): string {
    return MathRenderer.processMixedContent(text, 'plaintext');
  }

  /**
   * Process content with embedded images and return PDFMake content array
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static processContentWithImages(content: string, imageData?: any[]): any[] {
    // Clean up any leftover visual scene descriptions aggressively
    content = content.replace(/VISUAL SCENE DESCRIPTION:\s*/gi, '');
    content = content.replace(/^VISUAL SCENE DESCRIPTION:/gmi, '');
    content = content.replace(/\bVISUAL SCENE DESCRIPTION:\s*/g, '');
    
    // Handle raw DALL-E blob URLs that got embedded directly in content
    content = content.replace(/\[IMAGE:(https:\/\/[^\]]+)\]/g, (match, url) => {
      // Convert raw blob URL to a placeholder for PDF processing
      const parts = match.split(':');
      const description = parts.length > 2 ? parts.slice(2).join(':').replace(/\]$/, '') : 'Educational illustration';
      return `[RAW_IMAGE:${url}:${description}]`;
    });
    
    if (!imageData || imageData.length === 0) {
      // Handle raw image URLs even without imageData
      const result = [];
      const parts = content.split(/\[RAW_IMAGE:([^:]+):?\s*([^\]]+)\]/);
      
      for (let i = 0; i < parts.length; i++) {
        if (i % 3 === 0) {
          // Text part
          if (parts[i].trim()) {
            const cleanText = parts[i].replace(/VISUAL SCENE DESCRIPTION:\s*/gi, '').trim();
            if (cleanText) {
              result.push({ text: this.processMathContent(cleanText), margin: [0, 5, 0, 5] });
            }
          }
        } else if (i % 3 === 1) {
          // Raw image URL and description
          const imageDescription = parts[i + 1];
          
          // For raw URLs, show placeholder text in PDF
          result.push({
            text: `[Image: ${imageDescription}]`,
            style: 'imagePlaceholder',
            alignment: 'center',
            margin: [0, 10, 0, 10]
          });
          i++; // Skip the description part
        }
      }
      
      // If no raw images found, return plain text with cleanup
      if (result.length === 0) {
        return [{ text: this.processMathContent(content) }];
      }
      return result;
    }

    const result = [];
    
    // Split content by image placeholders (both formats with flexible spacing)
    const parts = content.split(/\[(?:IMAGE_(\d+)|RAW_IMAGE:([^:]+)):?\s*([^\]]+)\]/);
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 4 === 0) {
        // Text part
        if (parts[i].trim()) {
          // Clean up any remaining visual scene descriptions in text parts
          const cleanText = parts[i].replace(/VISUAL SCENE DESCRIPTION:\s*/gi, '').trim();
          if (cleanText) {
            result.push({ text: this.processMathContent(cleanText), margin: [0, 5, 0, 5] });
          }
        }
      } else if (i % 4 === 1) {
        // Image index (for IMAGE_X format)
        const imageIndex = parts[i] ? parseInt(parts[i], 10) : null;
        const imageDescription = parts[i + 2];
        
        if (imageIndex !== null && imageData[imageIndex] && imageData[imageIndex].base64Data) {
          console.log(`🖼️ [PDF] Embedding image ${imageIndex}: ${imageDescription}`);
          
          // Add image to PDF
          result.push({
            image: imageData[imageIndex].base64Data,
            width: 400,
            height: 300,
            alignment: 'center',
            margin: [0, 10, 0, 10]
          });
          
          // Add image caption
          result.push({
            text: imageDescription,
            style: 'caption',
            alignment: 'center',
            margin: [0, 0, 0, 15]
          });
        } else {
          // Fallback to text description if no base64 data
          result.push({
            text: `[Image: ${imageDescription}]`,
            style: 'imagePlaceholder',
            alignment: 'center',
            margin: [0, 10, 0, 10]
          });
        }
        i += 2; // Skip the URL and description parts as we've already used them
      }
    }

    return result;
  }

  /**
   * Generate educational workbook PDF with enhanced math support
   */
  public static async generateWorkbookPdf(workbook: Workbook): Promise<Blob> {
    // Check if this is a fraction-focused workbook
    const isFractionWorkbook = this.isFractionTopic(workbook);
    
    if (isFractionWorkbook) {
      // Use visual fraction worksheet generator
      const visualGenerator = new VisualWorksheetPdfGenerator();
      return await visualGenerator.generateVisualWorksheetPdf(
        workbook.title,
        this.extractGradeLevel(workbook.targetAudience.gradeBand),
        ['identify_fraction', 'color_fraction', 'compare_fractions']
      );
    }
    
    // Fall back to original PDF generation for non-fraction topics
    return this.generateTraditionalWorkbookPdf(workbook);
  }

  /**
   * Check if workbook is focused on fractions
   */
  private static isFractionTopic(workbook: Workbook): boolean {
    const fractionKeywords = ['fraction', 'fractions', 'numerator', 'denominator', 'part', 'whole'];
    const topicLower = workbook.topic.toLowerCase();
    const titleLower = workbook.title.toLowerCase();
    
    return fractionKeywords.some(keyword => 
      topicLower.includes(keyword) || titleLower.includes(keyword)
    );
  }

  /**
   * Extract numeric grade level from grade band
   */
  private static extractGradeLevel(gradeBand: string): number {
    const match = gradeBand.match(/\d+/);
    return match ? parseInt(match[0], 10) : 3; // Default to 3rd grade
  }

  /**
   * Generate traditional workbook PDF (original method)
   */
  private static async generateTraditionalWorkbookPdf(workbook: Workbook): Promise<Blob> {
    const pdfMake = await this.initializePdfMake();
    
    const docDefinition = {
      content: [
        // Title Page
        {
          text: this.processMathContent(workbook.title),
          style: 'title',
          alignment: 'center',
          margin: [0, 50, 0, 20]
        },
        {
          text: workbook.subjectDomain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        {
          text: `Grade ${workbook.targetAudience.gradeBand}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 50]
        },
        
        // Page Break
        { text: '', pageBreak: 'after' },
        
        // Table of Contents
        {
          text: 'Table of Contents',
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        ...workbook.sections.map((section, index) => ({
          text: `${index + 1}. ${section.title}`,
          style: 'tocItem',
          margin: [0, 5, 0, 0]
        })),
        
        // Page Break
        { text: '', pageBreak: 'after' },
        
        // Learning Objectives
        {
          text: 'Learning Objectives',
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        ...workbook.learningObjectives.map(objective => ({
          text: `• ${objective.text}`,
          margin: [0, 5, 0, 0]
        })),
        
        // Page Break
        { text: '', pageBreak: 'after' },
        
        // Sections Content
        ...workbook.sections.flatMap((section, sectionIndex) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sectionContent: any[] = [
            {
              text: `Section ${sectionIndex + 1}: ${section.title}`,
              style: 'sectionHeader',
              margin: [0, 20, 0, 15]
            }
          ];
          
          // Process concept explanation with potential images
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageData = (section as any).__imageData;
          const conceptContent = this.processContentWithImages(
            section.conceptExplanation || '',
            imageData
          );
          
          sectionContent.push(...conceptContent);
          
          // Add exercises
          const exerciseContent = section.exercises.map((exercise, exerciseIndex) => [
            {
              text: `Exercise ${exerciseIndex + 1}: ${exercise.prompt}`,
              style: 'exerciseHeader',
              margin: [0, 15, 0, 10]
            },
            {
              text: exercise.type === 'multiple_choice' 
                ? exercise.options?.map((option, i) => `${String.fromCharCode(65 + i)}. ${option.text}`).join('\n') || ''
                : 'Answer: _____________________',
              margin: [20, 0, 0, 15]
            }
          ]).flat();
          
          sectionContent.push(...exerciseContent);
          
          // Page break after each section
          sectionContent.push({ text: '', pageBreak: 'after' });
          
          return sectionContent;
        }),
        
        // Answer Key
        {
          text: 'Answer Key',
          style: 'header',
          margin: [0, 0, 0, 20]
        },
        ...workbook.sections.flatMap((section, sectionIndex) => 
          section.exercises.map((exercise, exerciseIndex) => ({
            text: `Section ${sectionIndex + 1}, Exercise ${exerciseIndex + 1}: ${exercise.correctAnswer || 'Teacher discretion'}`,
            margin: [0, 5, 0, 0]
          }))
        )
      ],
      
      styles: {
        title: {
          fontSize: 24,
          bold: true,
          color: '#2563eb'
        },
        subtitle: {
          fontSize: 16,
          color: '#64748b'
        },
        header: {
          fontSize: 18,
          bold: true,
          color: '#2563eb',
          decoration: 'underline'
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          color: '#1e40af'
        },
        exerciseHeader: {
          fontSize: 14,
          bold: true,
          color: '#374151'
        },
        tocItem: {
          fontSize: 12,
          color: '#4b5563'
        },
        caption: {
          fontSize: 10,
          color: '#6b7280',
          italics: true
        },
        imagePlaceholder: {
          fontSize: 12,
          color: '#9ca3af',
          italics: true,
          background: '#f3f4f6',
          padding: 5
        }
      },
      
      defaultStyle: {
        fontSize: 12,
        lineHeight: 1.5
      },
      
      pageMargins: [60, 60, 60, 60]
    };
    
    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}