import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { Workbook, Section, Exercise } from '@/types/workbook';

// Set up fonts for PDFMake - initialize when needed
let isInitialized = false;

function initializePdfMake() {
  if (!isInitialized) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfMake as any).vfs = (pdfFonts as any).vfs;
    isInitialized = true;
  }
}

/**
 * Educational PDF Generator
 * Creates professionally formatted educational workbooks using PDFMake
 * Implements educational publishing standards researched from major publishers
 */
export class EducationalPdfGenerator {
  
  /**
   * Educational color palette based on research
   */
  private static readonly COLORS = {
    primary: '#2563eb',     // Professional blue
    secondary: '#64748b',   // Neutral gray
    accent: '#f59e0b',      // Warm amber for highlights
    text: '#1f2937',        // Dark gray for readability
    lightBg: '#f8fafc',     // Light background
    border: '#e2e8f0'       // Subtle borders
  };

  /**
   * Educational typography standards
   */
  private static readonly FONTS = {
    title: { size: 24, bold: true },
    sectionHeader: { size: 18, bold: true },
    subsectionHeader: { size: 14, bold: true },
    body: { size: 12 },
    instruction: { size: 11, italics: true },
    small: { size: 10 }
  };

  /**
   * Professional margins and spacing (following educational publishing standards)
   */
  private static readonly LAYOUT = {
    pageMargins: [60, 80, 60, 80] as [number, number, number, number], // [left, top, right, bottom] - generous margins
    sectionSpacing: 20,
    paragraphSpacing: 12,
    exerciseSpacing: 16,
    columnGap: 20
  };

  /**
   * Generate educational workbook PDF
   */
  public static async generateWorkbookPdf(workbook: Workbook): Promise<Blob> {
    initializePdfMake(); // Initialize fonts
    
    const docDefinition = this.createDocumentDefinition(workbook);
    
    return new Promise((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    });
  }

  /**
   * Create PDFMake document definition with educational formatting
   */
  private static createDocumentDefinition(workbook: Workbook): TDocumentDefinitions {
    const content: Content[] = [];

    // Title Page
    content.push(this.createTitlePage(workbook));
    
    // Page break after title
    content.push({ text: '', pageBreak: 'after' });

    // Table of Contents (if multiple sections)
    if (workbook.sections.length > 1) {
      content.push(this.createTableOfContents(workbook));
      content.push({ text: '', pageBreak: 'after' });
    }

    // Learning Objectives Page
    content.push(this.createLearningObjectivesPage(workbook));
    content.push({ text: '', pageBreak: 'after' });

    // Content Sections
    workbook.sections.forEach((section: Section, index: number) => {
      content.push(this.createSectionContent(section, index + 1));
      
      // Page break between sections (except last)
      if (index < workbook.sections.length - 1) {
        content.push({ text: '', pageBreak: 'after' });
      }
    });

    // Answer Key (if exercises exist)
    if (this.hasExercises(workbook)) {
      content.push({ text: '', pageBreak: 'after' });
      content.push(this.createAnswerKey(workbook));
    }

    return {
      content,
      pageSize: 'LETTER', // Standard US educational format
      pageMargins: this.LAYOUT.pageMargins,
      header: this.createHeader(workbook),
      footer: this.createFooter(),
      defaultStyle: {
        font: 'Helvetica', // Professional, readable font
        fontSize: this.FONTS.body.size,
        color: this.COLORS.text,
        lineHeight: 1.4
      },
      styles: this.createStyles()
    };
  }

  /**
   * Create professional title page following educational standards
   */
  private static createTitlePage(workbook: Workbook): Content {
    return {
      stack: [
        // Main title - centered, large
        {
          text: workbook.title,
          style: 'titlePage',
          alignment: 'center',
          margin: [0, 80, 0, 30]
        },
        // Subject and grade level
        {
          text: `${workbook.subjectDomain} • Grade ${workbook.targetAudience.gradeBand}`,
          style: 'subtitle',
          alignment: 'center',
          margin: [0, 0, 0, 40]
        },
        // Description
        {
          text: workbook.description || workbook.topic,
          style: 'description',
          alignment: 'center',
          margin: [0, 0, 0, 60]
        },
        // Educational branding box
        {
          table: {
            widths: ['*'],
            body: [[{
              text: 'Educational Workbook\nAI-Generated Content',
              style: 'brandingBox',
              alignment: 'center'
            }]]
          },
          margin: [100, 0, 100, 0]
        }
      ]
    };
  }

  /**
   * Create table of contents with page numbers
   */
  private static createTableOfContents(workbook: Workbook): Content {
    const tocItems: Content[] = [
      {
        text: 'Table of Contents',
        style: 'sectionTitle',
        margin: [0, 0, 0, 20]
      }
    ];

    // Learning objectives
    tocItems.push({
      columns: [
        { text: 'Learning Objectives', style: 'tocItem' },
        { text: '3', style: 'tocPage', alignment: 'right' }
      ],
      columnGap: 10,
      margin: [0, 5]
    });

    // Sections
    workbook.sections.forEach((section: Section, index: number) => {
      tocItems.push({
        columns: [
          { text: `${index + 1}. ${section.title}`, style: 'tocItem' },
          { text: `${4 + index}`, style: 'tocPage', alignment: 'right' }
        ],
        columnGap: 10,
        margin: [0, 5]
      });
    });

    // Answer key
    if (this.hasExercises(workbook)) {
      tocItems.push({
        columns: [
          { text: 'Answer Key', style: 'tocItem' },
          { text: `${4 + workbook.sections.length}`, style: 'tocPage', alignment: 'right' }
        ],
        columnGap: 10,
        margin: [0, 5]
      });
    }

    return { stack: tocItems };
  }

  /**
   * Create learning objectives page with proper educational formatting
   */
  private static createLearningObjectivesPage(workbook: Workbook): Content {
    const objectives = workbook.learningObjectives || [];
    
    if (objectives.length === 0) {
      return {
        text: 'Learning Objectives\n\nObjectives will be defined based on workbook content.',
        style: 'sectionTitle'
      };
    }

    const content: Content[] = [
      {
        text: 'Learning Objectives',
        style: 'sectionTitle',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'By completing this workbook, students will be able to:',
        style: 'instructionText',
        margin: [0, 0, 0, 15]
      }
    ];

    // Numbered objectives list
    objectives.forEach((objective, index: number) => {
      content.push({
        columns: [
          { text: `${index + 1}.`, width: 20, style: 'objectiveNumber' },
          { text: objective.text, width: '*', style: 'objectiveText' }
        ],
        columnGap: 10,
        margin: [0, 8]
      });
    });

    return { stack: content };
  }

  /**
   * Create section content with educational formatting
   */
  private static createSectionContent(section: Section, sectionNumber: number): Content {
    const content: Content[] = [
      // Section header
      {
        text: `Section ${sectionNumber}: ${section.title}`,
        style: 'sectionTitle',
        margin: [0, 0, 0, 20]
      }
    ];

    // Section content - concept explanation
    if (section.conceptExplanation) {
      content.push({
        text: section.conceptExplanation,
        style: 'bodyText',
        margin: [0, 0, 0, this.LAYOUT.paragraphSpacing]
      });
    }

    // Examples
    if (section.examples && section.examples.length > 0) {
      content.push({
        text: 'Examples',
        style: 'subsectionTitle',
        margin: [0, 20, 0, 10]
      });
      
      section.examples.forEach((example: string) => {
        content.push({
          text: `• ${example}`,
          style: 'bodyText',
          margin: [15, 0, 0, this.LAYOUT.paragraphSpacing]
        });
      });
    }

    // Key terms (if available)
    if (section.keyTerms && section.keyTerms.length > 0) {
      content.push({
        text: 'Key Terms',
        style: 'subsectionTitle',
        margin: [0, 20, 0, 10]
      });

      section.keyTerms.forEach((term: { term: string; definition: string }) => {
        content.push({
          columns: [
            { text: term.term, width: 100, style: 'keyTerm' },
            { text: term.definition, width: '*', style: 'keyDefinition' }
          ],
          columnGap: 15,
          margin: [0, 5]
        });
      });
    }

    // Exercises
    if (section.exercises && section.exercises.length > 0) {
      content.push({
        text: 'Practice Exercises',
        style: 'subsectionTitle',
        margin: [0, 25, 0, 15]
      });

      section.exercises.forEach((exercise: Exercise, index: number) => {
        content.push(this.createExercise(exercise, index + 1));
      });
    }

    return { stack: content };
  }

  /**
   * Create individual exercise with proper educational formatting
   */
  private static createExercise(exercise: Exercise, exerciseNumber: number): Content {
    const exerciseContent: Content[] = [
      {
        text: `Exercise ${exerciseNumber}`,
        style: 'exerciseTitle',
        margin: [0, 15, 0, 8]
      },
      {
        text: exercise.prompt,
        style: 'exerciseQuestion',
        margin: [0, 0, 0, 10]
      }
    ];

    // Multiple choice options
    if (exercise.type === 'multiple_choice' && exercise.options) {
      exercise.options.forEach((option: { id: string; text: string; isCorrect: boolean }, index: number) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        exerciseContent.push({
          text: `${letter}. ${option.text}`,
          style: 'multipleChoiceOption',
          margin: [20, 3]
        });
      });
    }

    // Answer space for other types
    else {
      exerciseContent.push({
        text: '_'.repeat(60),
        style: 'answerSpace',
        margin: [0, 10, 0, 5]
      });
      
      if (exercise.type === 'open_response') {
        exerciseContent.push({
          text: '_'.repeat(60),
          style: 'answerSpace',
          margin: [0, 5]
        });
      }
    }

    return {
      stack: exerciseContent,
      margin: [0, 0, 0, this.LAYOUT.exerciseSpacing]
    };
  }

  /**
   * Create answer key section
   */
  private static createAnswerKey(workbook: Workbook): Content {
    const content: Content[] = [
      {
        text: 'Answer Key',
        style: 'sectionTitle',
        margin: [0, 0, 0, 20]
      }
    ];

    workbook.sections.forEach((section: Section, sectionIndex: number) => {
      if (section.exercises && section.exercises.length > 0) {
        content.push({
          text: `Section ${sectionIndex + 1}: ${section.title}`,
          style: 'subsectionTitle',
          margin: [0, 15, 0, 10]
        });

        section.exercises.forEach((exercise: Exercise, exerciseIndex: number) => {
          if (exercise.correctAnswer) {
            content.push({
              columns: [
                { text: `Exercise ${exerciseIndex + 1}:`, width: 80, style: 'answerLabel' },
                { text: exercise.correctAnswer, width: '*', style: 'answerText' }
              ],
              columnGap: 10,
              margin: [0, 3]
            });
          }
        });
      }
    });

    return { stack: content };
  }

  /**
   * Create header with workbook title
   */
  private static createHeader(workbook: Workbook): Content {
    return {
      text: workbook.title,
      style: 'header',
      alignment: 'center',
      margin: [0, 15, 0, 0]
    };
  }

  /**
   * Create footer with page numbers
   */
  private static createFooter(): Content {
    return {
      text: 'Page ',
      style: 'footer',
      alignment: 'center',
      margin: [0, 0, 0, 15]
    };
  }

  /**
   * Define professional educational styles
   */
  private static createStyles() {
    return {
      titlePage: {
        fontSize: 28,
        bold: true,
        color: this.COLORS.primary
      },
      subtitle: {
        fontSize: 16,
        color: this.COLORS.secondary,
        bold: true
      },
      description: {
        fontSize: 14,
        color: this.COLORS.text,
        italics: true
      },
      brandingBox: {
        fontSize: 12,
        bold: true,
        color: this.COLORS.primary
      },
      sectionTitle: {
        fontSize: this.FONTS.sectionHeader.size,
        bold: true,
        color: this.COLORS.primary
      },
      subsectionTitle: {
        fontSize: this.FONTS.subsectionHeader.size,
        bold: true,
        color: this.COLORS.secondary
      },
      bodyText: {
        fontSize: this.FONTS.body.size,
        lineHeight: 1.5
      },
      instructionText: {
        fontSize: this.FONTS.instruction.size,
        italics: true,
        color: this.COLORS.secondary
      },
      tocItem: {
        fontSize: 12
      },
      tocPage: {
        fontSize: 12,
        bold: true
      },
      objectiveNumber: {
        fontSize: 12,
        bold: true,
        color: this.COLORS.primary
      },
      objectiveText: {
        fontSize: 12,
        lineHeight: 1.4
      },
      keyTerm: {
        fontSize: 11,
        bold: true,
        color: this.COLORS.primary
      },
      keyDefinition: {
        fontSize: 11,
        lineHeight: 1.3
      },
      exerciseTitle: {
        fontSize: 13,
        bold: true,
        color: this.COLORS.accent
      },
      exerciseQuestion: {
        fontSize: 12,
        lineHeight: 1.4
      },
      multipleChoiceOption: {
        fontSize: 11
      },
      answerSpace: {
        fontSize: 12,
        color: this.COLORS.border
      },
      answerLabel: {
        fontSize: 11,
        bold: true
      },
      answerText: {
        fontSize: 11
      },
      header: {
        fontSize: 10,
        color: this.COLORS.secondary
      },
      footer: {
        fontSize: 9,
        color: this.COLORS.secondary
      }
    };
  }

  /**
   * Check if workbook has exercises for answer key
   */
  private static hasExercises(workbook: Workbook): boolean {
    return workbook.sections.some((section: Section) => 
      section.exercises && section.exercises.length > 0
    );
  }
}