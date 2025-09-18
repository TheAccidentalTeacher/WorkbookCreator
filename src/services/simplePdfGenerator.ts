// Simple PDF Generator using client-side approach
import { Workbook } from '@/types/workbook';

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
   * Generate educational workbook PDF
   */
  public static async generateWorkbookPdf(workbook: Workbook): Promise<Blob> {
    const pdfMake = await this.initializePdfMake();
    
    const docDefinition = {
      content: [
        // Title Page
        {
          text: workbook.title,
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
        ...workbook.sections.flatMap((section, sectionIndex) => [
          {
            text: `Section ${sectionIndex + 1}: ${section.title}`,
            style: 'sectionHeader',
            margin: [0, 20, 0, 15]
          },
          {
            text: section.conceptExplanation,
            margin: [0, 0, 0, 20]
          },
          
          // Exercises
          ...section.exercises.map((exercise, exerciseIndex) => [
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
          ]).flat(),
          
          // Page break after each section
          { text: '', pageBreak: 'after' }
        ]),
        
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