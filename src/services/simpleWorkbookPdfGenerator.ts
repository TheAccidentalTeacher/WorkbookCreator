import { SimpleWorkbook } from './simpleGenerationEngine';

export class SimpleWorkbookPdfGenerator {
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
   * Generate PDF from SimpleWorkbook with embedded images
   */
  public static async generateSimpleWorkbookPdf(workbook: SimpleWorkbook): Promise<Blob> {
    const pdfMake = await this.initializePdfMake();
    
    console.log('🔄 Generating PDF with embedded images...');
    
    // Build the document definition with embedded images
    const docDefinition = {
      content: [
        // Title Page
        {
          text: workbook.title,
          style: 'title',
          alignment: 'center',
          margin: [0, 50, 0, 30]
        },
        {
          text: workbook.topic,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 50]
        },
        
        // Page Break
        { text: '', pageBreak: 'after' },
        
        // Sections with embedded images
        ...workbook.sections.flatMap((section, sectionIndex) => [
          // Section header
          {
            text: `Section ${sectionIndex + 1}: ${section.title}`,
            style: 'sectionHeader',
            margin: [0, 20, 0, 15]
          },
          
          // Process section content with embedded images
          ...this.processContentWithImages(section.content, section.images),
          
          // Exercises
          ...section.exercises.flatMap((exercise, exerciseIndex) => [
            {
              text: `Exercise ${exerciseIndex + 1}: ${exercise.question}`,
              style: 'exerciseHeader',
              margin: [0, 20, 0, 10]
            },
            ...(exercise.type === 'multiple_choice' && exercise.options ? 
              exercise.options.map((option: string) => ({
                text: option,
                margin: [20, 5, 0, 0]
              })) : 
              [{
                text: 'Answer: _____________________________________',
                margin: [20, 5, 0, 15]
              }]
            )
          ]),
          
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
            text: `Section ${sectionIndex + 1}, Exercise ${exerciseIndex + 1}: ${exercise.answer}`,
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
        imageCaption: {
          fontSize: 10,
          italics: true,
          color: '#6b7280',
          alignment: 'center'
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
          console.log('✅ PDF generated successfully with embedded images');
          resolve(blob);
        });
      } catch (error) {
        console.error('❌ Failed to generate PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Process content text and replace image references with actual embedded images
   */
  private static processContentWithImages(
    content: string, 
    images?: SimpleWorkbook['sections'][0]['images']
  ): Array<Record<string, unknown>> {
    const elements: Array<Record<string, unknown>> = [];
    
    if (!images || images.length === 0) {
      // No images, just add text content
      const cleanContent = content.replace(/\[IMAGE:[^\]]+\]/g, '').trim();
      if (cleanContent) {
        elements.push({
          text: cleanContent,
          margin: [0, 0, 0, 20]
        });
      }
      return elements;
    }

    // Split content by image references
    const imagePattern = /\[IMAGE:([^\]]+)\]/g;
    const contentParts = content.split(imagePattern);
    
    for (let i = 0; i < contentParts.length; i++) {
      const part = contentParts[i].trim();
      
      if (part && !part.startsWith('http')) { // Text content
        elements.push({
          text: part,
          margin: [0, 0, 0, 15]
        });
      }
      
      // Check if next part is an image URL
      if (i + 1 < contentParts.length) {
        const nextPart = contentParts[i + 1];
        const imageUrl = nextPart.includes(':') ? nextPart.split(':')[0] : null;
        
        if (imageUrl) {
          // Find the corresponding image data
          const imageData = images.find(img => img.url === imageUrl);
          
          if (imageData && imageData.base64Data) {
            console.log('🖼️ Embedding image in PDF:', imageData.description);
            
            // Add embedded image
            elements.push({
              image: imageData.base64Data,
              width: 400, // Adjust size as needed
              alignment: 'center',
              margin: [0, 15, 0, 10]
            });
            
            // Add image caption
            elements.push({
              text: imageData.description,
              style: 'imageCaption',
              margin: [0, 0, 0, 20]
            });
          } else {
            // Fallback to text description if image data not available
            console.warn('⚠️ Image data not found, using text fallback for:', imageData?.description);
            elements.push({
              text: `[Image: ${imageData?.description || 'Educational illustration'}]`,
              alignment: 'center',
              italics: true,
              margin: [0, 15, 0, 20],
              color: '#6b7280'
            });
          }
        }
        
        i++; // Skip the image URL part
      }
    }
    
    return elements;
  }
}