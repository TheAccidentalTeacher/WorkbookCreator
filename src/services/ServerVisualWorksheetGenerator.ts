import { VisualFractionGenerator } from './VisualFractionGenerator';

export interface ServerVisualWorksheetConfig {
  type: string;
  title: string;
  gradeLevel: number;
  problemTypes: string[];
}

export class ServerVisualWorksheetGenerator {
  private fractionGenerator: VisualFractionGenerator;

  constructor() {
    this.fractionGenerator = new VisualFractionGenerator();
  }

  async generateVisualWorksheetHTML(config: ServerVisualWorksheetConfig): Promise<string> {
    const { type, title, gradeLevel } = config;

    console.log('🎨 [Server Visual Generator] Creating visual worksheet:', { type, title, gradeLevel });

    // Generate fraction problems with SVG visuals
    const problems = this.generateFractionProblems(type, gradeLevel);

    // Create HTML with embedded SVG graphics
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Comic Sans MS', cursive, sans-serif;
            margin: 20px;
            background-color: #f9f9f9;
        }
        .worksheet-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
        }
        .worksheet-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .grade-level {
            font-size: 18px;
            opacity: 0.9;
        }
        .problem-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #4CAF50;
        }
        .problem-number {
            font-size: 20px;
            font-weight: bold;
            color: #2196F3;
            margin-bottom: 15px;
        }
        .problem-text {
            font-size: 16px;
            margin-bottom: 15px;
            color: #333;
        }
        .visual-container {
            display: flex;
            align-items: center;
            gap: 20px;
            margin: 15px 0;
        }
        .fraction-visual {
            flex-shrink: 0;
        }
        .answer-space {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 20px;
            margin-top: 15px;
            min-height: 40px;
            background-color: #fafafa;
        }
        .instructions {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 0 8px 8px 0;
        }
    </style>
</head>
<body>
    <div class="worksheet-header">
        <div class="worksheet-title">${title}</div>
        <div class="grade-level">Grade ${gradeLevel}</div>
    </div>
    
    <div class="instructions">
        <strong>Instructions:</strong> Look at each visual fraction and answer the questions. Use the pictures to help you!
    </div>

    ${problems.map((problem, index) => `
        <div class="problem-container">
            <div class="problem-number">Problem ${index + 1}</div>
            <div class="problem-text">${problem.question}</div>
            <div class="visual-container">
                <div class="fraction-visual">
                    ${problem.svg}
                </div>
                <div class="problem-details">
                    ${problem.hint ? `<p><em>Hint: ${problem.hint}</em></p>` : ''}
                </div>
            </div>
            <div class="answer-space">
                <strong>Answer:</strong> _______________
            </div>
        </div>
    `).join('')}

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
        Generated with Visual Fraction Worksheet System
    </div>
</body>
</html>`;

    return html;
  }

  private generateFractionProblems(type: string, gradeLevel: number) {
    const problems = [];
    const numProblems = Math.min(6, gradeLevel + 2); // 3-8 problems based on grade

    for (let i = 0; i < numProblems; i++) {
      const problem = this.generateSingleProblem(type, gradeLevel, i);
      problems.push(problem);
    }

    return problems;
  }

  private generateSingleProblem(type: string, gradeLevel: number, problemIndex: number) {
    // Generate fraction based on grade level
    const denominators = gradeLevel <= 2 ? [2, 3, 4] : gradeLevel <= 4 ? [2, 3, 4, 5, 6, 8] : [2, 3, 4, 5, 6, 8, 10, 12];
    const denominator = denominators[Math.floor(Math.random() * denominators.length)];
    const numerator = Math.floor(Math.random() * denominator) + 1;

    // Choose shape for this problem
    const shapes: Array<'circle' | 'rectangle' | 'triangle'> = ['circle', 'rectangle', 'triangle'];
    const shape = shapes[problemIndex % shapes.length];

    // Create FractionVisual object for the generator
    const fractionVisual = {
      type: shape,
      totalParts: denominator,
      shadedParts: numerator,
      fraction: `${numerator}/${denominator}`,
      description: `${numerator} out of ${denominator} parts shaded`
    };

    // Generate SVG visual using the fraction generator
    const svg = this.fractionGenerator.generateFractionSVG(fractionVisual);

    // Create different problem types
    let question = '';
    let hint = '';

    switch (type) {
      case 'identify':
        question = `What fraction of the ${shape} is shaded?`;
        hint = `Count the shaded parts and the total parts.`;
        break;
      case 'color':
        question = `Color ${numerator}/${denominator} of the ${shape}.`;
        hint = `You need to color ${numerator} out of ${denominator} parts.`;
        break;
      case 'compare':
        const otherNum = Math.floor(Math.random() * denominator) + 1;
        question = `Which is larger: ${numerator}/${denominator} or ${otherNum}/${denominator}?`;
        hint = `Compare the numerators when denominators are the same.`;
        break;
      default:
        question = `Look at this ${shape}. What fraction is shown?`;
        hint = `The bottom number shows total parts, top shows shaded parts.`;
    }

    return {
      question,
      hint,
      svg,
      fraction: { numerator, denominator },
      shape
    };
  }
}