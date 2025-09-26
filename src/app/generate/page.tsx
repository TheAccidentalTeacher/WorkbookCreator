'use client';

import { useState, useEffect } from 'react';
import { HierarchicalTopicSelector } from '../../components/HierarchicalTopicSelector';
import { WorkbookViewer } from '../../components/WorkbookViewer';
import { GenerationProgress } from '../../components/GenerationProgress';
import { VisualWorksheetDemo } from '../../components/VisualWorksheetDemo';
import { debug } from '../../utils/debugSystem';

export default function GeneratePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workbook, setWorkbook] = useState(null);
  const [progress, setProgress] = useState({ step: '', progress: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    debug.info('GeneratePage', 'Component mounted');
    debug.state.set('GeneratePage', {
      isGenerating: false,
      hasWorkbook: false,
      progress: 0
    });
  }, []);

  const handleGenerate = async (formData: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    textDensity?: string;
    visualOptions?: {
      includeIllustrations: boolean;
      includeDiagrams: boolean;
      includeInteractiveElements: boolean;
      includeColorCoding: boolean;
      creativityLevel: string;
    };
    options?: Record<string, unknown>;
    generationMode?: 'quick' | 'comprehensive';
  }) => {
    debug.performance.start('workbook-generation');
    debug.info('GeneratePage', 'Starting workbook generation', { formData });
    
    setIsGenerating(true);
    setWorkbook(null);
    setError(null);
    setProgress({ step: 'Starting generation...', progress: 0 });
    
    debug.state.set('GeneratePage', {
      isGenerating: true,
      hasWorkbook: false,
      progress: 0,
      topic: formData.topic,
      gradeBand: formData.gradeBand
    });

    try {
      const callId = debug.api.request('POST', '/api/generate-workbook', {
        topic: formData.topic,
        gradeBand: formData.gradeBand,
        domain: formData.subjectDomain,
        generationMode: formData.generationMode || 'comprehensive',
        textDensity: formData.textDensity || 'minimal',
        visualOptions: formData.visualOptions || {
          includeIllustrations: true,
          includeDiagrams: true,
          includeInteractiveElements: true,
          includeColorCoding: true,
          creativityLevel: 'high'
        },
        objectiveCount: formData.options?.objectiveCount || 3,
        sectionCount: formData.options?.sectionCount || 4,
        includeExercises: formData.options?.includeExercises !== false,
        includeMisconceptions: formData.options?.includeMisconceptions !== false,
        difficulty: 'intermediate'
      });

      // Call our generation API
      const response = await fetch('/api/generate-workbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          gradeBand: formData.gradeBand,
          domain: formData.subjectDomain,
          generationMode: formData.generationMode || 'comprehensive',
          textDensity: formData.textDensity || 'minimal',
          visualOptions: formData.visualOptions || {
            includeIllustrations: true,
            includeDiagrams: true,
            includeInteractiveElements: true,
            includeColorCoding: true,
            creativityLevel: 'high'
          },
          objectiveCount: formData.options?.objectiveCount || 3,
          sectionCount: formData.options?.sectionCount || 4,
          includeExercises: formData.options?.includeExercises !== false,
          includeMisconceptions: formData.options?.includeMisconceptions !== false,
          difficulty: 'intermediate'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        debug.api.response(callId, response.status, errorData, new Error(`HTTP ${response.status}`));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      debug.api.response(callId, response.status, result);
      
      if (result.success && result.workbook) {
        setWorkbook(result.workbook);
        setProgress({ step: 'Complete!', progress: 100 });
        debug.info('GeneratePage', 'Workbook generation completed successfully', {
          workbookId: result.workbook.id,
          sectionCount: result.workbook.sections?.length || 0
        });
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      debug.error('GeneratePage', 'Generation failed', { error: error.message }, error);
      setError(error.message);
      setProgress({ step: 'Error occurred', progress: 0 });
    } finally {
      setIsGenerating(false);
      debug.performance.end('workbook-generation', 'GeneratePage');
      debug.state.set('GeneratePage', {
        isGenerating: false,
        hasWorkbook: !!workbook,
        error: error
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Visual Worksheet Demo Section */}
      <div className="container mx-auto px-4 py-8">
        <VisualWorksheetDemo />
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Original Generation Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Generate Educational Workbook
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Topic Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <HierarchicalTopicSelector 
                  onTopicSelect={handleGenerate}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            {/* Progress and Results */}
            <div className="lg:col-span-1">
              {isGenerating && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <GenerationProgress 
                    step={progress.step}
                    progress={progress.progress}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Generation Error</h3>
                  <p className="text-red-700">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {workbook && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Generated Workbook</h3>
                    <button
                      onClick={() => {
                        setWorkbook(null);
                        setProgress({ step: '', progress: 0 });
                        debug.info('GeneratePage', 'Workbook viewer closed');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Generate New Workbook
                    </button>
                  </div>
                  <WorkbookViewer workbook={workbook} />
                </div>
              )}

              {!isGenerating && !workbook && !error && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                    <p>Select your grade level and topic to create your pedagogical workbook.</p>
                    <div className="mt-4 text-sm text-gray-400">
                      💡 Tip: Open F12 Developer Console to see detailed debug information
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}