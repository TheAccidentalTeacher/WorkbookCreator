/**
 * Visual Fraction Worksheet Generator
 * Creates worksheet pages with visual fraction problems like professional educational materials
 */

import OpenAI from 'openai';

export interface FractionVisual {
  type: 'circle' | 'rectangle' | 'triangle' | 'square' | 'hexagon' | 'number_line' | 'bar_model';
  totalParts: number;
  shadedParts: number;
  fraction: string;
  svgData?: string;
  imageUrl?: string;
  description: string;
}

export interface VisualProblem {
  id: string;
  type: 'identify_fraction' | 'color_fraction' | 'compare_fractions' | 'number_line' | 'equivalent_fractions' | 'mixed_numbers';
  instruction: string;
  visuals: FractionVisual[];
  answer?: string;
  choices?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface VisualWorksheetPage {
  title: string;
  problems: VisualProblem[];
  layout: 'single_column' | 'two_column' | 'grid';
  grade_level: number;
}

export class VisualFractionGenerator {
  private openai?: OpenAI;

  constructor() {
    // Initialize OpenAI if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Generate SVG for basic fraction shapes
   */
  generateFractionSVG(visual: FractionVisual): string {
    const { type, totalParts, shadedParts } = visual;
    
    switch (type) {
      case 'circle':
        return this.generateCircleFraction(totalParts, shadedParts);
      case 'rectangle':
        return this.generateRectangleFraction(totalParts, shadedParts);
      case 'square':
        return this.generateSquareFraction(totalParts, shadedParts);
      case 'triangle':
        return this.generateTriangleFraction(totalParts, shadedParts);
      case 'hexagon':
        return this.generateHexagonFraction(totalParts, shadedParts);
      case 'number_line':
        return this.generateNumberLineFraction(totalParts, shadedParts);
      case 'bar_model':
        return this.generateBarModelFraction(totalParts, shadedParts);
      default:
        return this.generateCircleFraction(totalParts, shadedParts);
    }
  }

  /**
   * Generate circle fraction (like pie slices)
   */
  private generateCircleFraction(totalParts: number, shadedParts: number): string {
    const radius = 40;
    const center = 50;
    const anglePerPart = 360 / totalParts;
    
    let paths = '';
    let shadedPaths = '';
    
    for (let i = 0; i < totalParts; i++) {
      const startAngle = i * anglePerPart - 90; // Start from top
      const endAngle = (i + 1) * anglePerPart - 90;
      
      const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArcFlag = anglePerPart > 180 ? 1 : 0;
      
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      if (i < shadedParts) {
        shadedPaths += `<path d="${pathData}" fill="#4FC3F7" stroke="#333" stroke-width="1"/>`;
      } else {
        paths += `<path d="${pathData}" fill="white" stroke="#333" stroke-width="1"/>`;
      }
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${paths}
        ${shadedPaths}
      </svg>
    `;
  }

  /**
   * Generate rectangle fraction (divided into equal parts)
   */
  private generateRectangleFraction(totalParts: number, shadedParts: number): string {
    const width = 80;
    const height = 40;
    const partWidth = width / totalParts;
    
    let rectangles = '';
    
    for (let i = 0; i < totalParts; i++) {
      const x = i * partWidth + 10;
      const fill = i < shadedParts ? '#4FC3F7' : 'white';
      rectangles += `<rect x="${x}" y="30" width="${partWidth}" height="${height}" fill="${fill}" stroke="#333" stroke-width="1"/>`;
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${rectangles}
      </svg>
    `;
  }

  /**
   * Generate square fraction (grid pattern)
   */
  private generateSquareFraction(totalParts: number, shadedParts: number): string {
    const size = 60;
    const startX = 20;
    const startY = 20;
    
    // Determine grid dimensions
    let rows = 1;
    let cols = totalParts;
    
    if (totalParts === 4) { rows = 2; cols = 2; }
    else if (totalParts === 6) { rows = 2; cols = 3; }
    else if (totalParts === 8) { rows = 2; cols = 4; }
    else if (totalParts === 9) { rows = 3; cols = 3; }
    else if (totalParts === 12) { rows = 3; cols = 4; }
    
    const cellWidth = size / cols;
    const cellHeight = size / rows;
    
    let cells = '';
    let cellIndex = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * cellWidth;
        const y = startY + row * cellHeight;
        const fill = cellIndex < shadedParts ? '#4FC3F7' : 'white';
        cells += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${fill}" stroke="#333" stroke-width="1"/>`;
        cellIndex++;
      }
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${cells}
      </svg>
    `;
  }

  /**
   * Generate triangle fraction
   */
  private generateTriangleFraction(totalParts: number, shadedParts: number): string {
    // Simple triangle divided into horizontal strips
    const baseWidth = 60;
    const height = 50;
    const startX = 20;
    const startY = 20;
    
    let triangles = '';
    
    for (let i = 0; i < totalParts; i++) {
      const y = startY + (i * height / totalParts);
      const nextY = startY + ((i + 1) * height / totalParts);
      const topWidth = baseWidth * (1 - i / totalParts);
      const bottomWidth = baseWidth * (1 - (i + 1) / totalParts);
      
      const leftX = startX + (baseWidth - topWidth) / 2;
      const rightX = leftX + topWidth;
      const bottomLeftX = startX + (baseWidth - bottomWidth) / 2;
      const bottomRightX = bottomLeftX + bottomWidth;
      
      const fill = i < shadedParts ? '#4FC3F7' : 'white';
      const points = `${leftX},${y} ${rightX},${y} ${bottomRightX},${nextY} ${bottomLeftX},${nextY}`;
      
      triangles += `<polygon points="${points}" fill="${fill}" stroke="#333" stroke-width="1"/>`;
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${triangles}
      </svg>
    `;
  }

  /**
   * Generate hexagon fraction
   */
  private generateHexagonFraction(totalParts: number, shadedParts: number): string {
    const radius = 35;
    const center = 50;
    const anglePerPart = 360 / totalParts;
    
    let paths = '';
    
    for (let i = 0; i < totalParts; i++) {
      const startAngle = i * anglePerPart - 90;
      const endAngle = (i + 1) * anglePerPart - 90;
      
      const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const pathData = `M ${center} ${center} L ${x1} ${y1} L ${x2} ${y2} Z`;
      const fill = i < shadedParts ? '#4FC3F7' : 'white';
      
      paths += `<path d="${pathData}" fill="${fill}" stroke="#333" stroke-width="1"/>`;
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${paths}
      </svg>
    `;
  }

  /**
   * Generate number line with fraction markers
   */
  private generateNumberLineFraction(totalParts: number, targetPart: number): string {
    const lineLength = 80;
    const startX = 10;
    const y = 50;
    const markerHeight = 8;
    
    let markers = '';
    let labels = '';
    
    // Main line
    const mainLine = `<line x1="${startX}" y1="${y}" x2="${startX + lineLength}" y2="${y}" stroke="#333" stroke-width="2"/>`;
    
    // Create markers
    for (let i = 0; i <= totalParts; i++) {
      const x = startX + (i * lineLength / totalParts);
      const isTarget = i === targetPart;
      const markerColor = isTarget ? '#FF4444' : '#333';
      const markerWidth = isTarget ? '3' : '1';
      
      markers += `<line x1="${x}" y1="${y - markerHeight/2}" x2="${x}" y2="${y + markerHeight/2}" stroke="${markerColor}" stroke-width="${markerWidth}"/>`;
      
      if (i === 0) {
        labels += `<text x="${x}" y="${y + 20}" text-anchor="middle" font-size="10" fill="#333">0</text>`;
      } else if (i === totalParts) {
        labels += `<text x="${x}" y="${y + 20}" text-anchor="middle" font-size="10" fill="#333">1</text>`;
      } else if (isTarget) {
        labels += `<text x="${x}" y="${y + 20}" text-anchor="middle" font-size="10" fill="#FF4444">${i}/${totalParts}</text>`;
      }
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${mainLine}
        ${markers}
        ${labels}
      </svg>
    `;
  }

  /**
   * Generate bar model fraction
   */
  private generateBarModelFraction(totalParts: number, shadedParts: number): string {
    const barWidth = 80;
    const barHeight = 20;
    const startX = 10;
    const startY = 40;
    const partWidth = barWidth / totalParts;
    
    let bars = '';
    
    for (let i = 0; i < totalParts; i++) {
      const x = startX + i * partWidth;
      const fill = i < shadedParts ? '#4FC3F7' : 'white';
      bars += `<rect x="${x}" y="${startY}" width="${partWidth}" height="${barHeight}" fill="${fill}" stroke="#333" stroke-width="1"/>`;
    }
    
    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        ${bars}
      </svg>
    `;
  }

  /**
   * Generate visual problems for different types
   */
  async generateVisualProblems(
    type: VisualProblem['type'],
    count: number = 6,
    difficulty: 'easy' | 'medium' | 'hard' = 'easy'
  ): Promise<VisualProblem[]> {
    const problems: VisualProblem[] = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'identify_fraction':
          problems.push(this.createIdentifyFractionProblem(i + 1, difficulty));
          break;
        case 'color_fraction':
          problems.push(this.createColorFractionProblem(i + 1, difficulty));
          break;
        case 'compare_fractions':
          problems.push(this.createCompareFractionsProblem(i + 1, difficulty));
          break;
        case 'number_line':
          problems.push(this.createNumberLineProblem(i + 1, difficulty));
          break;
        case 'equivalent_fractions':
          problems.push(this.createEquivalentFractionsProblem(i + 1, difficulty));
          break;
        case 'mixed_numbers':
          problems.push(this.createMixedNumbersProblem(i + 1, difficulty));
          break;
      }
    }
    
    return problems;
  }

  /**
   * Create "identify the fraction" problems
   */
  private createIdentifyFractionProblem(id: number, difficulty: string): VisualProblem {
    const denominators = difficulty === 'easy' ? [2, 3, 4] : difficulty === 'medium' ? [4, 5, 6, 8] : [6, 8, 10, 12];
    const totalParts = denominators[Math.floor(Math.random() * denominators.length)];
    const shadedParts = Math.floor(Math.random() * totalParts) + 1;
    
    const shapes = ['circle', 'rectangle', 'square'] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const visual: FractionVisual = {
      type: shape,
      totalParts,
      shadedParts,
      fraction: `${shadedParts}/${totalParts}`,
      description: `${shape} divided into ${totalParts} parts with ${shadedParts} shaded`
    };
    
    visual.svgData = this.generateFractionSVG(visual);
    
    return {
      id: `identify_${id}`,
      type: 'identify_fraction',
      instruction: `What fraction is shaded?`,
      visuals: [visual],
      answer: visual.fraction,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Create "color the fraction" problems
   */
  private createColorFractionProblem(id: number, difficulty: string): VisualProblem {
    const denominators = difficulty === 'easy' ? [2, 3, 4] : difficulty === 'medium' ? [4, 5, 6, 8] : [6, 8, 10, 12];
    const totalParts = denominators[Math.floor(Math.random() * denominators.length)];
    const shadedParts = Math.floor(Math.random() * totalParts) + 1;
    
    const shapes = ['circle', 'rectangle', 'square', 'triangle'] as const;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const visual: FractionVisual = {
      type: shape,
      totalParts,
      shadedParts: 0, // Not shaded yet - student needs to color
      fraction: `${shadedParts}/${totalParts}`,
      description: `Empty ${shape} to be colored`
    };
    
    visual.svgData = this.generateFractionSVG(visual);
    
    return {
      id: `color_${id}`,
      type: 'color_fraction',
      instruction: `Color ${visual.fraction} of the ${shape}`,
      visuals: [visual],
      answer: visual.fraction,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Create comparison problems
   */
  private createCompareFractionsProblem(id: number, difficulty: string): VisualProblem {
    const denominators = difficulty === 'easy' ? [2, 3, 4] : [4, 6, 8];
    
    // Create two fractions to compare
    const denom1 = denominators[Math.floor(Math.random() * denominators.length)];
    const denom2 = difficulty === 'easy' ? denom1 : denominators[Math.floor(Math.random() * denominators.length)];
    
    const num1 = Math.floor(Math.random() * denom1) + 1;
    const num2 = Math.floor(Math.random() * denom2) + 1;
    
    const visual1: FractionVisual = {
      type: 'circle',
      totalParts: denom1,
      shadedParts: num1,
      fraction: `${num1}/${denom1}`,
      description: `Circle showing ${num1}/${denom1}`
    };
    
    const visual2: FractionVisual = {
      type: 'circle',
      totalParts: denom2,
      shadedParts: num2,
      fraction: `${num2}/${denom2}`,
      description: `Circle showing ${num2}/${denom2}`
    };
    
    visual1.svgData = this.generateFractionSVG(visual1);
    visual2.svgData = this.generateFractionSVG(visual2);
    
    return {
      id: `compare_${id}`,
      type: 'compare_fractions',
      instruction: `Circle the larger fraction`,
      visuals: [visual1, visual2],
      choices: ['>', '<', '='],
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Create number line problems
   */
  private createNumberLineProblem(id: number, difficulty: string): VisualProblem {
    const denominators = difficulty === 'easy' ? [2, 4] : [3, 5, 6, 8];
    const totalParts = denominators[Math.floor(Math.random() * denominators.length)];
    const targetPart = Math.floor(Math.random() * totalParts) + 1;
    
    const visual: FractionVisual = {
      type: 'number_line',
      totalParts,
      shadedParts: targetPart,
      fraction: `${targetPart}/${totalParts}`,
      description: `Number line from 0 to 1 divided into ${totalParts} parts`
    };
    
    visual.svgData = this.generateNumberLineFraction(totalParts, targetPart);
    
    return {
      id: `number_line_${id}`,
      type: 'number_line',
      instruction: `Mark ${visual.fraction} on the number line`,
      visuals: [visual],
      answer: visual.fraction,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Create equivalent fractions problems
   */
  private createEquivalentFractionsProblem(id: number, difficulty: string): VisualProblem {
    const baseFractions = difficulty === 'easy' ? [[1,2], [1,3], [1,4]] : [[2,4], [3,6], [2,8], [3,9]];
    const [num, denom] = baseFractions[Math.floor(Math.random() * baseFractions.length)];
    
    // Create equivalent fraction
    const multiplier = difficulty === 'easy' ? 2 : Math.floor(Math.random() * 3) + 2;
    const equivNum = num * multiplier;
    const equivDenom = denom * multiplier;
    
    const visual1: FractionVisual = {
      type: 'rectangle',
      totalParts: denom,
      shadedParts: num,
      fraction: `${num}/${denom}`,
      description: `Rectangle showing ${num}/${denom}`
    };
    
    const visual2: FractionVisual = {
      type: 'rectangle',
      totalParts: equivDenom,
      shadedParts: equivNum,
      fraction: `${equivNum}/${equivDenom}`,
      description: `Rectangle showing ${equivNum}/${equivDenom}`
    };
    
    visual1.svgData = this.generateFractionSVG(visual1);
    visual2.svgData = this.generateFractionSVG(visual2);
    
    return {
      id: `equivalent_${id}`,
      type: 'equivalent_fractions',
      instruction: `Are these fractions equivalent?`,
      visuals: [visual1, visual2],
      choices: ['Yes', 'No'],
      answer: 'Yes',
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Create mixed numbers problems
   */
  private createMixedNumbersProblem(id: number, difficulty: string): VisualProblem {
    const wholeParts = difficulty === 'easy' ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 1;
    const denom = difficulty === 'easy' ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 4) + 3;
    const num = Math.floor(Math.random() * (denom - 1)) + 1;
    
    const visuals: FractionVisual[] = [];
    
    // Create whole circles
    for (let i = 0; i < wholeParts; i++) {
      const visual: FractionVisual = {
        type: 'circle',
        totalParts: denom,
        shadedParts: denom, // Fully shaded
        fraction: '1',
        description: `Whole circle ${i + 1}`
      };
      visual.svgData = this.generateFractionSVG(visual);
      visuals.push(visual);
    }
    
    // Create partial circle
    const partialVisual: FractionVisual = {
      type: 'circle',
      totalParts: denom,
      shadedParts: num,
      fraction: `${num}/${denom}`,
      description: `Partial circle showing ${num}/${denom}`
    };
    partialVisual.svgData = this.generateFractionSVG(partialVisual);
    visuals.push(partialVisual);
    
    const mixedNumber = `${wholeParts} ${num}/${denom}`;
    
    return {
      id: `mixed_${id}`,
      type: 'mixed_numbers',
      instruction: `Write this as a mixed number`,
      visuals,
      answer: mixedNumber,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };
  }

  /**
   * Generate a complete worksheet page
   */
  async generateWorksheetPage(
    title: string,
    problemTypes: VisualProblem['type'][],
    gradeLevel: number = 3
  ): Promise<VisualWorksheetPage> {
    const allProblems: VisualProblem[] = [];
    
    for (const type of problemTypes) {
      const problems = await this.generateVisualProblems(type, 2, 'easy');
      allProblems.push(...problems);
    }
    
    return {
      title,
      problems: allProblems,
      layout: 'grid',
      grade_level: gradeLevel
    };
  }

  /**
   * Use OpenAI DALL-E to generate more complex fraction visuals
   */
  async generateComplexFractionImage(description: string): Promise<string | null> {
    if (!this.openai) {
      console.warn('OpenAI not configured - cannot generate images');
      return null;
    }

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a simple, clean educational worksheet illustration: ${description}. Style: black and white line art, suitable for coloring, minimal detail, clear geometric shapes, educational math worksheet style.`,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      return response.data?.[0]?.url || null;
    } catch (error) {
      console.error('Error generating image with DALL-E:', error);
      return null;
    }
  }
}