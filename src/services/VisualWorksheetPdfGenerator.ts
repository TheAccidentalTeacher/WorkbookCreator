/**
 * Visual Fraction Worksheet PDF Generator
 * Creates clean, printable fraction worksheets with visual elements
 */

import { VisualFractionGenerator, VisualProblem } from './VisualFractionGenerator';

// TypeScript interfaces for pdfMake
interface PdfMakeStatic {
  createPdf(documentDefinition: PdfDocumentDefinition): {
    download(filename?: string): void;
    getBlob(callback: (result: Blob) => void): void;
  };
  vfs: Record<string, string>;
}

interface PdfDocumentDefinition {
  content: PdfContent[];
  pageSize?: string;
  pageMargins?: number | [number, number] | [number, number, number, number];
  styles?: Record<string, PdfStyle>;
  header?: PdfContent;
  footer?: PdfContent;
}

interface PdfContent {
  text?: string;
  table?: {
    body: PdfTableCell[][];
    widths?: (string | number)[];
    heights?: (string | number)[];
  };
  columns?: PdfColumn[];
  stack?: PdfContent[];
  canvas?: PdfCanvasElement[];
  style?: string;
  pageBreak?: 'before' | 'after';
  margin?: number | [number, number] | [number, number, number, number];
  alignment?: 'left' | 'center' | 'right' | 'justify';
  width?: string | number;
}

interface PdfColumn {
  text?: string;
  stack?: PdfContent[];
  canvas?: PdfCanvasElement[];
  width?: string | number;
  style?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

interface PdfTableCell {
  text?: string;
  canvas?: PdfCanvasElement[];
  style?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  colSpan?: number;
  rowSpan?: number;
}

interface PdfCanvasElement {
  type: 'rect' | 'line' | 'ellipse' | 'polyline';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  r1?: number; // for ellipse
  r2?: number; // for ellipse
  points?: Array<{ x: number; y: number }>;
  lineWidth?: number;
  lineColor?: string;
  color?: string;
}

interface VisualElement {
  type: string;
  totalParts: number;
  shadedParts: number;
}

interface PdfStyle {
  fontSize?: number;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  margin?: number | [number, number] | [number, number, number, number];
}

export class VisualWorksheetPdfGenerator {
  private static pdfMake: PdfMakeStatic | null = null;
  private visualGenerator: VisualFractionGenerator;

  constructor() {
    this.visualGenerator = new VisualFractionGenerator();
  }

  /**
   * Initialize PDFMake with fonts (client-side only)
   */
  private static async initializePdfMake(): Promise<PdfMakeStatic> {
    if (this.pdfMake) return this.pdfMake;
    
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in the browser');
    }
    
    // Dynamic imports for client-side only
    const pdfMakeModule = await import('pdfmake/build/pdfmake') as { default?: PdfMakeStatic } & PdfMakeStatic;
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts') as { default?: { vfs: Record<string, string> } } & { vfs: Record<string, string> };
    
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const vfs = pdfFontsModule.default || pdfFontsModule;
    
    // Set up fonts
    pdfMake.vfs = (vfs as { pdfMake?: { vfs: Record<string, string> } }).pdfMake?.vfs || (vfs as { vfs: Record<string, string> }).vfs || vfs;
    
    this.pdfMake = pdfMake;
    return pdfMake;
  }

  /**
   * Generate a visual fraction worksheet PDF
   */
  public async generateVisualWorksheetPdf(
    topic: string = 'Fractions Practice',
    gradeLevel: number = 3,
    problemTypes: VisualProblem['type'][] = ['identify_fraction', 'color_fraction', 'compare_fractions']
  ): Promise<Blob> {
    const pdfMake = await VisualWorksheetPdfGenerator.initializePdfMake();
    
    // Generate worksheet pages
    const worksheetPage = await this.visualGenerator.generateWorksheetPage(
      topic,
      problemTypes,
      gradeLevel
    );

    const docDefinition = {
      content: [
        // Header
        {
          columns: [
            { text: 'Name: ________________________', style: 'nameField' },
            { text: `Date: ____________`, style: 'dateField', alignment: 'right' as const }
          ],
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },
        
        // Title
        {
          text: worksheetPage.title,
          style: 'title',
          alignment: 'center' as const,
          margin: [0, 0, 0, 25] as [number, number, number, number]
        },
        
        // Problems in grid layout
        ...this.createProblemsLayout(worksheetPage.problems),
        
        // Answer section (on separate page for easy removal)
        { text: '', pageBreak: 'after' as const },
        {
          text: 'Answer Key',
          style: 'answerKeyTitle',
          alignment: 'center' as const,
          margin: [0, 20, 0, 20] as [number, number, number, number]
        },
        ...this.createAnswerKey(worksheetPage.problems)
      ],
      
      styles: {
        title: {
          fontSize: 18,
          bold: true,
          color: '#2c3e50'
        },
        nameField: {
          fontSize: 11,
          margin: [0, 5, 0, 0] as [number, number, number, number]
        },
        dateField: {
          fontSize: 11,
          margin: [0, 5, 0, 0] as [number, number, number, number]
        },
        problemInstruction: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number]
        },
        problemNumber: {
          fontSize: 11,
          bold: true,
          margin: [0, 5, 0, 5] as [number, number, number, number]
        },
        answerLine: {
          fontSize: 11,
          margin: [0, 5, 0, 10] as [number, number, number, number]
        },
        answerKeyTitle: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50'
        },
        answerKeyItem: {
          fontSize: 11,
          margin: [0, 2, 0, 2] as [number, number, number, number]
        }
      },
      
      defaultStyle: {
        fontSize: 11,
        lineHeight: 1.4,
        font: 'Helvetica'
      },
      
      pageMargins: [50, 40, 50, 40] as [number, number, number, number],
      pageSize: 'LETTER'
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

  /**
   * Create problems layout in grid format
   */
  private createProblemsLayout(problems: VisualProblem[]): PdfContent[] {
    const layout: PdfContent[] = [];
    
    // Group problems into rows of 2
    for (let i = 0; i < problems.length; i += 2) {
      const leftProblem = problems[i];
      const rightProblem = problems[i + 1];
      
      const row: PdfContent = {
        columns: [
          {
            width: '48%',
            stack: this.createProblemContent(leftProblem, i + 1)
          },
          {
            width: '4%',
            text: '' // Spacer
          },
          rightProblem ? {
            width: '48%',
            stack: this.createProblemContent(rightProblem, i + 2)
          } : { width: '48%', text: '' }
        ],
        margin: [0, 0, 0, 25] as [number, number, number, number]
      };
      
      layout.push(row);
    }
    
    return layout;
  }

  /**
   * Create individual problem content
   */
  private createProblemContent(problem: VisualProblem, problemNumber: number): PdfContent[] {
    const content: PdfContent[] = [];
    
    // Problem number and instruction
    content.push({
      text: `${problemNumber}. ${problem.instruction}`,
      style: 'problemNumber'
    });
    
    // Add visual elements
    if (problem.visuals && problem.visuals.length > 0) {
      const visualContent = this.createVisualContent(problem);
      if (visualContent) {
        content.push(visualContent);
      }
    }
    
    // Add answer choices or answer line
    if (problem.choices && problem.choices.length > 0) {
      const choicesText = problem.choices.map((choice, index) => 
        `${String.fromCharCode(65 + index)}. ${choice}`
      ).join('    ');
      
      content.push({
        text: choicesText,
        margin: [10, 5, 0, 5]
      });
    } else {
      // Add answer line for fill-in problems
      content.push({
        text: 'Answer: _________________',
        style: 'answerLine'
      });
    }
    
    return content;
  }

  /**
   * Create visual content for problems
   */
  private createVisualContent(problem: VisualProblem): PdfContent {
    // For now, create placeholder rectangles where SVGs would go
    // In a full implementation, you'd convert SVG to PDFMake format
    
    if (problem.visuals.length === 1) {
      // Single visual
      return {
        canvas: this.createVisualPlaceholder(problem.visuals[0]),
        margin: [0, 5, 0, 10]
      };
    } else if (problem.visuals.length === 2) {
      // Side-by-side visuals (like comparison problems)
      return {
        columns: [
          {
            width: '45%',
            canvas: this.createVisualPlaceholder(problem.visuals[0])
          },
          {
            width: '10%',
            text: '' // Spacer
          },
          {
            width: '45%',
            canvas: this.createVisualPlaceholder(problem.visuals[1])
          }
        ],
        margin: [0, 5, 0, 10]
      };
    } else {
      // Multiple visuals in grid
      const gridColumns: PdfColumn[] = [];
      
      problem.visuals.forEach((visual, index) => {
        if (index > 0) {
          gridColumns.push({ width: '5%', text: '' }); // Spacer
        }
        gridColumns.push({
          width: `${90 / problem.visuals.length}%`,
          canvas: this.createVisualPlaceholder(visual)
        });
      });
      
      return {
        columns: gridColumns,
        margin: [0, 5, 0, 10]
      };
    }
  }

  /**
   * Create visual placeholder (simplified representation)
   */
  private createVisualPlaceholder(visual: VisualElement): PdfCanvasElement[] {
    const canvas: PdfCanvasElement[] = [];
    
    if (visual.type === 'circle') {
      // Draw circle with segments
      canvas.push({
        type: 'ellipse',
        x: 30,
        y: 30,
        r1: 25,
        r2: 25,
        lineWidth: 2
      });
      
      // Add pie segments based on fraction
      const totalParts = visual.totalParts;
      const shadedParts = visual.shadedParts;
      const anglePerPart = 360 / totalParts;
      
      for (let i = 0; i < totalParts; i++) {
        const startAngle = i * anglePerPart;
        // const endAngle = (i + 1) * anglePerPart; // unused for now
        
        if (i < shadedParts) {
          // This would be shaded in a real implementation
          canvas.push({
            type: 'line',
            x1: 30,
            y1: 30,
            x2: 30 + 25 * Math.cos((startAngle - 90) * Math.PI / 180),
            y2: 30 + 25 * Math.sin((startAngle - 90) * Math.PI / 180),
            lineWidth: 1
          });
        }
      }
    } else if (visual.type === 'rectangle' || visual.type === 'bar_model') {
      // Draw rectangle divided into parts
      const totalWidth = 60;
      const height = 25;
      const partWidth = totalWidth / visual.totalParts;
      
      for (let i = 0; i < visual.totalParts; i++) {
        const x = i * partWidth;
        canvas.push({
          type: 'rect',
          x: x,
          y: 10,
          w: partWidth,
          h: height,
          lineWidth: 1
        });
        
        // Add shading indicator for shaded parts
        if (i < visual.shadedParts) {
          // Add diagonal lines to indicate shading
          canvas.push({
            type: 'line',
            x1: x,
            y1: 10,
            x2: x + partWidth,
            y2: 10 + height,
            lineWidth: 0.5
          });
          canvas.push({
            type: 'line',
            x1: x + partWidth,
            y1: 10,
            x2: x,
            y2: 10 + height,
            lineWidth: 0.5
          });
        }
      }
    } else if (visual.type === 'number_line') {
      // Draw number line
      canvas.push({
        type: 'line',
        x1: 10,
        y1: 20,
        x2: 70,
        y2: 20,
        lineWidth: 2
      });
      
      // Add tick marks
      const totalWidth = 60;
      const partWidth = totalWidth / visual.totalParts;
      
      for (let i = 0; i <= visual.totalParts; i++) {
        const x = 10 + i * partWidth;
        canvas.push({
          type: 'line',
          x1: x,
          y1: 15,
          x2: x,
          y2: 25,
          lineWidth: 1
        });
      }
    }
    
    return canvas;
  }

  /**
   * Create answer key section
   */
  private createAnswerKey(problems: VisualProblem[]): PdfContent[] {
    const answerKey: PdfContent[] = [];
    
    problems.forEach((problem, index) => {
      if (problem.answer) {
        answerKey.push({
          text: `${index + 1}. ${problem.answer}`,
          style: 'answerKeyItem'
        });
      }
    });
    
    return answerKey;
  }

  /**
   * Generate fraction practice worksheets by type
   */
  public async generateFractionPracticeSheets(): Promise<{
    identifyFractions: Blob;
    colorFractions: Blob;
    compareFractions: Blob;
    numberLines: Blob;
    mixed: Blob;
  }> {
    return {
      identifyFractions: await this.generateVisualWorksheetPdf(
        'Identifying Fractions',
        3,
        ['identify_fraction']
      ),
      colorFractions: await this.generateVisualWorksheetPdf(
        'Coloring Fractions',
        3,
        ['color_fraction']
      ),
      compareFractions: await this.generateVisualWorksheetPdf(
        'Comparing Fractions',
        4,
        ['compare_fractions']
      ),
      numberLines: await this.generateVisualWorksheetPdf(
        'Fractions on Number Lines',
        4,
        ['number_line']
      ),
      mixed: await this.generateVisualWorksheetPdf(
        'Fraction Practice',
        3,
        ['identify_fraction', 'color_fraction', 'compare_fractions']
      )
    };
  }
}