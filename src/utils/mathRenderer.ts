import katex from 'katex';

/**
 * KaTeX Math Renderer for PDF Generation
 * Provides utilities for rendering LaTeX math expressions in educational worksheets
 */
export class MathRenderer {
  
  /**
   * Render LaTeX math expression to HTML string
   */
  static renderToString(latex: string, displayMode: boolean = false): string {
    try {
      return katex.renderToString(latex, {
        displayMode: displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'ignore',
        macros: {
          // Common math macros for educational content
          '\\RR': '\\mathbb{R}',
          '\\NN': '\\mathbb{N}',
          '\\ZZ': '\\mathbb{Z}',
          '\\QQ': '\\mathbb{Q}',
          '\\CC': '\\mathbb{C}',
          '\\deg': '^{\\circ}',
        }
      });
    } catch (error) {
      console.warn('KaTeX rendering failed:', error);
      // Return the original LaTeX as fallback
      return displayMode ? `$$${latex}$$` : `$${latex}$`;
    }
  }

  /**
   * Convert LaTeX expression to plain text for PDF compatibility
   * This is a simple fallback for PDFMake which doesn't support HTML/MathML
   */
  static renderToPlainText(latex: string): string {
    try {
      // Basic LaTeX to text conversion for common patterns
      let text = latex;
      
      // Remove LaTeX commands and braces for basic readability
      text = text
        // Fractions
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        // Superscripts
        .replace(/\^(\d+)/g, '^$1')
        .replace(/\^\{([^}]+)\}/g, '^($1)')
        // Subscripts
        .replace(/_(\d+)/g, '_$1')
        .replace(/_{([^}]+)}/g, '_($1)')
        // Square roots
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
        .replace(/\\sqrt/g, '√')
        // Greek letters (common ones)
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\delta/g, 'δ')
        .replace(/\\epsilon/g, 'ε')
        .replace(/\\theta/g, 'θ')
        .replace(/\\lambda/g, 'λ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\pi/g, 'π')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\phi/g, 'φ')
        .replace(/\\omega/g, 'ω')
        // Mathematical operators
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\mp/g, '∓')
        .replace(/\\cdot/g, '·')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\neq/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\infty/g, '∞')
        // Functions
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\tan/g, 'tan')
        .replace(/\\log/g, 'log')
        .replace(/\\ln/g, 'ln')
        // Remove remaining backslashes and braces
        .replace(/\\/g, '')
        .replace(/[{}]/g, '');
      
      return text;
    } catch (error) {
      console.warn('LaTeX to text conversion failed:', error);
      return latex;
    }
  }

  /**
   * Detect if a string contains LaTeX math expressions
   */
  static containsLatex(text: string): boolean {
    // Check for common LaTeX patterns
    const latexPatterns = [
      /\$.*\$/,           // Inline math $...$
      /\$\$.*\$\$/,       // Display math $$...$$
      /\\[a-zA-Z]+/,      // LaTeX commands
      /\^[{}]|\^[0-9]/,   // Superscripts
      /_[{}]|_[0-9]/,     // Subscripts
      /\\frac/,           // Fractions
      /\\sqrt/,           // Square roots
      /\\sum/,            // Summation
      /\\int/,            // Integrals
      /\\lim/             // Limits
    ];
    
    return latexPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Process mixed text with embedded LaTeX expressions
   * Converts LaTeX portions while preserving regular text
   */
  static processMixedContent(text: string, renderMode: 'html' | 'plaintext' = 'plaintext'): string {
    if (!this.containsLatex(text)) {
      return text;
    }

    let processed = text;

    // Handle display math blocks $$...$$
    processed = processed.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
      return renderMode === 'html' 
        ? this.renderToString(latex, true)
        : this.renderToPlainText(latex);
    });

    // Handle inline math $...$
    processed = processed.replace(/\$(.*?)\$/g, (match, latex) => {
      return renderMode === 'html'
        ? this.renderToString(latex, false)
        : this.renderToPlainText(latex);
    });

    return processed;
  }

  /**
   * Generate math problem with proper formatting for PDF
   */
  static formatMathProblem(problem: string, solution?: string): {
    problem: string;
    solution?: string;
    hasLatex: boolean;
  } {
    const hasLatex = this.containsLatex(problem) || (solution ? this.containsLatex(solution) : false);
    
    return {
      problem: this.processMixedContent(problem, 'plaintext'),
      solution: solution ? this.processMixedContent(solution, 'plaintext') : undefined,
      hasLatex
    };
  }

  /**
   * Get KaTeX CSS for HTML rendering (useful for web preview)
   */
  static getKatexCSS(): string {
    return `
      .katex { font-size: 1.1em; }
      .katex-display { margin: 1em 0; text-align: center; }
      .katex .base { display: inline-block; }
      .katex .mord, .katex .mrel, .katex .mbin, .katex .mop { margin-right: 0.05em; }
    `;
  }

  /**
   * Create education-friendly math formatting options
   */
  static getEducationalRenderOptions() {
    return {
      displayMode: false,
      throwOnError: false,
      errorColor: '#cc0000',
      strict: 'ignore',
      macros: {
        // Grade-level appropriate macros
        '\\RR': '\\mathbb{R}',
        '\\NN': '\\mathbb{N}',
        '\\ZZ': '\\mathbb{Z}',
        '\\QQ': '\\mathbb{Q}',
        '\\deg': '^{\\circ}',
        '\\half': '\\frac{1}{2}',
        '\\third': '\\frac{1}{3}',
        '\\quarter': '\\frac{1}{4}',
        // Common geometric shapes
        '\\triangle': '\\triangle',
        '\\square': '\\square',
        '\\circle': '\\circ'
      }
    };
  }
}

/**
 * Educational Math Content Formatter
 * Specifically designed for printable worksheet generation
 */
export class WorksheetMathFormatter {
  
  /**
   * Format a complete math problem for worksheet inclusion
   */
  static formatProblem(
    problemText: string, 
    solution?: string, 
    steps?: string[]
  ): {
    question: string;
    answer?: string;
    workingSteps?: string[];
    containsMath: boolean;
  } {
    const containsMath = MathRenderer.containsLatex(problemText) || 
                        (solution ? MathRenderer.containsLatex(solution) : false) ||
                        (steps ? steps.some(step => MathRenderer.containsLatex(step)) : false);

    return {
      question: MathRenderer.processMixedContent(problemText, 'plaintext'),
      answer: solution ? MathRenderer.processMixedContent(solution, 'plaintext') : undefined,
      workingSteps: steps ? steps.map(step => MathRenderer.processMixedContent(step, 'plaintext')) : undefined,
      containsMath
    };
  }

  /**
   * Create problem numbering for worksheets
   */
  static numberProblems(problems: Array<{ question: string; answer?: string }>): Array<{
    number: number;
    question: string;
    answer?: string;
    formatted: string;
  }> {
    return problems.map((problem, index) => ({
      number: index + 1,
      question: problem.question,
      answer: problem.answer,
      formatted: `${index + 1}. ${problem.question}`
    }));
  }

  /**
   * Create answer key formatting
   */
  static formatAnswerKey(problems: Array<{ number: number; answer?: string }>): string {
    const answers = problems
      .filter(p => p.answer)
      .map(p => `${p.number}. ${p.answer}`)
      .join('\n');
    
    return `ANSWER KEY\n\n${answers}`;
  }
}