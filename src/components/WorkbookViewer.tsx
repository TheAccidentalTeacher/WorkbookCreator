'use client';

import { useState } from 'react';
import { SimplePdfGenerator } from '@/services/simplePdfGenerator';
import { Workbook as WorkbookType } from '@/types/workbook';

interface LearningObjective {
  text: string;
  bloomLevel: string;
  verb: string;
}

interface Exercise {
  type: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  solution?: {
    answer: string;
    explanation: string;
    workingSteps: string[];
  };
}

interface Misconception {
  description: string;
  explanation: string;
  correction: string;
}

interface WorkbookSection {
  title: string;
  conceptExplanation: string;
  examples: string[];
  keyTerms: Array<{ term: string; definition: string }>;
  summary: string;
  exercises?: Exercise[];
  misconceptions?: Misconception[];
}

interface Workbook {
  id: string;
  title: string;
  topic: string;
  learningObjectives: LearningObjective[];
  sections: WorkbookSection[];
  metadata: {
    generatedAt: string;
    topicAnalysis: {
      domain: string;
      complexity: string;
      prerequisites: string[];
    };
    validation: {
      overallScore: number;
      passed: boolean;
      details: string[];
    };
  };
}

interface WorkbookViewerProps {
  workbook: Workbook;
}

export function WorkbookViewer({ workbook }: WorkbookViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [showSolutions, setShowSolutions] = useState(false);

  // Export Functions
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(workbook, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workbook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${workbook.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .objectives { background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .exercise { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .key-term { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
        h1 { color: #1f2937; } h2 { color: #374151; } h3 { color: #4b5563; }
        .bloom-level { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${workbook.title}</h1>
        <p><strong>Topic:</strong> ${workbook.topic}</p>
        <p><strong>Generated:</strong> ${new Date(workbook.metadata.generatedAt).toLocaleDateString()}</p>
    </div>
    
    <div class="objectives">
        <h2>Learning Objectives</h2>
        <ol>
            ${workbook.learningObjectives.map(obj => 
                `<li>${obj.text} <span class="bloom-level">${obj.bloomLevel}</span></li>`
            ).join('')}
        </ol>
    </div>

    ${workbook.sections.map((section, sectionIndex) => `
        <div class="section">
            <h2>Section ${sectionIndex + 1}: ${section.title}</h2>
            <div>
                <h3>Concept Explanation</h3>
                <p>${section.conceptExplanation}</p>
            </div>
            
            ${section.examples && section.examples.length > 0 ? `
                <div>
                    <h3>Examples</h3>
                    <ul>
                        ${section.examples.map(example => `<li>${example}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${section.keyTerms && section.keyTerms.length > 0 ? `
                <div>
                    <h3>Key Terms</h3>
                    ${section.keyTerms.map(term => 
                        `<div class="key-term"><strong>${term.term}:</strong> ${term.definition}</div>`
                    ).join('')}
                </div>
            ` : ''}
            
            ${section.exercises && section.exercises.length > 0 ? `
                <div>
                    <h3>Exercises</h3>
                    ${section.exercises.map((exercise, exIndex) => `
                        <div class="exercise">
                            <p><strong>Exercise ${exIndex + 1}:</strong> ${exercise.prompt}</p>
                            ${exercise.options ? `
                                <ul>
                                    ${exercise.options.map(option => `<li>${option}</li>`).join('')}
                                </ul>
                            ` : ''}
                            <p><strong>Answer:</strong> ${exercise.correctAnswer}</p>
                            <p><strong>Explanation:</strong> ${exercise.explanation}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div>
                <h3>Summary</h3>
                <p>${section.summary}</p>
            </div>
        </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    try {
      // Convert the workbook to the proper Workbook type for PDFMake
      const workbookForPdf: WorkbookType = {
        id: workbook.id,
        title: workbook.title,
        description: workbook.topic,
        topic: workbook.topic,
        subjectDomain: 'other',
        subjectTags: [],
        targetAudience: {
          gradeBand: 'k-2',
          language: 'en',
          priorKnowledge: [],
          learningStyles: ['visual'],
          accommodations: []
        },
        learningObjectives: workbook.learningObjectives.map((obj, index) => ({
          id: `obj-${index}`,
          text: obj.text,
          bloomLevel: 'understand',
          smartCriteria: {
            specific: true,
            measurable: true,
            achievable: true,
            relevant: true,
            timeBound: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        sections: workbook.sections.map((section, index) => ({
          id: `section-${index}`,
          title: section.title,
          purpose: 'concept_explanation',
          order: index,
          conceptExplanation: section.conceptExplanation,
          examples: section.examples || [],
          keyTerms: section.keyTerms || [],
          exercises: (section.exercises || []).map((exercise, exIndex) => ({
            id: `ex-${index}-${exIndex}`,
            type: 'open_response',
            prompt: exercise.prompt,
            instructions: '',
            mediaRefs: [],
            options: exercise.options?.map((opt, optIndex) => ({
              id: `opt-${optIndex}`,
              text: opt,
              isCorrect: false
            })),
            correctAnswer: exercise.correctAnswer,
            rationale: exercise.explanation,
            commonMistakes: [],
            bloomLevel: 'understand',
            difficultyLevel: 'basic',
            estimatedTimeMinutes: 5,
            objectiveIds: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })),
          misconceptions: [],
          summary: section.summary,
          crossLinks: [],
          estimatedTimeMinutes: 30,
          difficultyProgression: ['basic'],
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        formativeAssessments: [],
        summativeAssessments: [],
        glossary: [],
        assets: [],
        generationMetadata: {
          standardsAlignment: [],
          generationHistory: [{
            timestamp: new Date(),
            state: 'complete',
            model: 'gpt-4',
            tokenUsage: 0,
            cost: 0,
            duration: 0,
            success: true
          }],
          version: '1.0.0',
          totalTokenUsage: 0,
          totalCost: 0,
          generationDuration: 0
        },
        accessibility: {
          altTextComplete: false,
          colorContrastSafe: true,
          keyboardNavigable: true
        },
        exportStatus: {
          json: false,
          html: false,
          pdf: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate PDF using PDFMake
      const pdfBlob = await SimplePdfGenerator.generateWorkbookPdf(workbookForPdf);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workbook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workbook.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Professional PDF generated successfully with educational formatting!');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{workbook.title}</h1>
        <p className="text-gray-600 mb-4">Topic: {workbook.topic}</p>
        
        {/* Export Actions */}
        <div className="flex space-x-2 mb-6">
          <button 
            onClick={exportAsPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            📄 Export PDF
          </button>
          <button 
            onClick={exportAsHTML}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            🌐 Export HTML
          </button>
          <button 
            onClick={exportAsJSON}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
          >
            📊 Export JSON
          </button>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Learning Objectives</h2>
        <ul className="space-y-2">
          {workbook.learningObjectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">{index + 1}.</span>
              <div>
                <span className="text-gray-800">{objective.text}</span>
                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  {objective.bloomLevel}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {workbook.sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setActiveSection(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {index + 1}. {section.title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      {workbook.sections[activeSection] && (
        <div className="space-y-8">
          <SectionViewer 
            section={workbook.sections[activeSection]} 
            sectionNumber={activeSection + 1}
            showSolutions={showSolutions}
            onToggleSolutions={() => setShowSolutions(!showSolutions)}
          />
        </div>
      )}

      {/* Metadata */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer font-medium">Generation Metadata</summary>
          <div className="mt-2 space-y-1">
            <p>Generated: {new Date(workbook.metadata.generatedAt).toLocaleString()}</p>
            <p>Workbook ID: {workbook.id}</p>
            {workbook.metadata.validation && (
              <p>Quality Score: {workbook.metadata.validation.overallScore}%</p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

function SectionViewer({ 
  section, 
  sectionNumber, 
  showSolutions, 
  onToggleSolutions 
}: { 
  section: WorkbookSection; 
  sectionNumber: number;
  showSolutions: boolean;
  onToggleSolutions: () => void;
}) {
  return (
    <div className="bg-white">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Section {sectionNumber}: {section.title}
        </h2>
      </div>

      {/* Concept Explanation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Concept Overview</h3>
        <div className="prose text-gray-600 leading-relaxed">
          {section.conceptExplanation.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Examples */}
      {section.examples && section.examples.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Examples</h3>
          <div className="space-y-3">
            {section.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{example}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Terms */}
      {section.keyTerms && section.keyTerms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Key Terms</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {section.keyTerms.map((term, index) => (
              <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                <dt className="font-medium text-yellow-800">{term.term}</dt>
                <dd className="text-yellow-700 text-sm mt-1">{term.definition}</dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercises */}
      {section.exercises && section.exercises.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Practice Exercises</h3>
            <button
              onClick={onToggleSolutions}
              className={`px-3 py-1 text-sm rounded ${
                showSolutions 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
            </button>
          </div>
          
          <div className="space-y-6">
            {section.exercises.map((exercise, index) => (
              <ExerciseViewer 
                key={index} 
                exercise={exercise} 
                exerciseNumber={index + 1}
                showSolution={showSolutions}
              />
            ))}
          </div>
        </div>
      )}

      {/* Common Misconceptions */}
      {section.misconceptions && section.misconceptions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Common Misconceptions</h3>
          <div className="space-y-4">
            {section.misconceptions.map((misconception, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-400 p-4">
                <h4 className="font-medium text-red-800 mb-2">Misconception {index + 1}</h4>
                <p className="text-red-700 mb-2">{misconception.description}</p>
                <p className="text-red-600 text-sm mb-2"><strong>Why it&apos;s wrong:</strong> {misconception.explanation}</p>
                <p className="text-red-800 text-sm"><strong>Correct understanding:</strong> {misconception.correction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Summary */}
      {section.summary && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Section Summary</h3>
          <p className="text-green-700">{section.summary}</p>
        </div>
      )}
    </div>
  );
}

function ExerciseViewer({ 
  exercise, 
  exerciseNumber, 
  showSolution 
}: { 
  exercise: Exercise; 
  exerciseNumber: number;
  showSolution: boolean;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium text-gray-800 mb-3">Exercise {exerciseNumber}</h4>
      
      <p className="text-gray-700 mb-4">{exercise.prompt}</p>

      {/* Multiple Choice Options */}
      {exercise.type === 'multiple_choice' && exercise.options && (
        <div className="space-y-2 mb-4">
          {exercise.options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`exercise-${exerciseNumber}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Fill in the Blank */}
      {exercise.type === 'fill_blank' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
          />
        </div>
      )}

      {/* Short Answer */}
      {exercise.type === 'short_answer' && (
        <div className="mb-4">
          <textarea
            placeholder="Your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
          />
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div className="bg-blue-50 p-3 rounded mt-4">
          <h5 className="font-medium text-blue-800 mb-2">Solution</h5>
          <p className="text-blue-700 mb-2"><strong>Answer:</strong> {exercise.correctAnswer}</p>
          <p className="text-blue-600 text-sm">{exercise.explanation}</p>
          
          {exercise.solution?.workingSteps && exercise.solution.workingSteps.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-blue-800 text-sm mb-1">Working Steps:</p>
              <ol className="text-blue-600 text-sm space-y-1">
                {exercise.solution.workingSteps.map((step, index) => (
                  <li key={index}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}