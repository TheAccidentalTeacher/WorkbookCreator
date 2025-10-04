'use client';

import { useState } from 'react';

interface AIDecision {
  strategy: string;
  confidence: number;
  reasoning: string;
  parameters: Record<string, string | number | boolean>;
  fallback?: string;
}

interface GenerationResult {
  workbookId: string;
  title: string;
  sections: Array<{
    title: string;
    content: string;
    exercises: Array<{
      type: string;
      question: string;
    }>;
  }>;
  strategy: string;
  processingTime: number;
}

export default function AIDemoGeneratePage() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('k-2');
  const [domain, setDomain] = useState('science');
  const [decision, setDecision] = useState<AIDecision | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [step, setStep] = useState<'input' | 'analyzing' | 'decision' | 'generating' | 'complete'>('input');
  const [loading, setLoading] = useState(false);

  const analyzeAndGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setStep('analyzing');
    
    try {
      // Step 1: Get AI Decision
      const decisionResponse = await fetch('/api/ai-decision-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          gradeBand: gradeLevel,
          domain: domain,
          options: {
            objectiveCount: 3,
            sectionCount: 4,
            includeExercises: true,
            includeMisconceptions: true
          }
        })
      });
      
      const decisionResult = await decisionResponse.json();
      setDecision(decisionResult.decision);
      setStep('decision');
      
      // Wait a moment to show the decision
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Generate using the AI-driven mode
      setStep('generating');
      const generateResponse = await fetch('/api/generate-workbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          gradeBand: gradeLevel,
          domain: domain,
          generationMode: 'ai-driven', // This will use our IntelligentWorkbookGenerator!
          options: {
            objectiveCount: 3,
            sectionCount: 4,
            includeExercises: true,
            includeMisconceptions: true
          }
        })
      });
      
      const generateResult = await generateResponse.json();
      console.log('🎯 Generation Result:', generateResult);
      
      setResult({
        workbookId: generateResult.workbookId || generateResult.id || 'demo-' + Date.now(),
        title: generateResult.title || generateResult.workbook?.title || `${topic} Workbook`,
        sections: generateResult.sections || generateResult.workbook?.sections || [],
        strategy: decisionResult.decision.strategy,
        processingTime: generateResult.processingTime || generateResult.duration || 0
      });
      setStep('complete');
      
    } catch (error) {
      console.error('Generation failed:', error);
      setStep('input');
    }
    setLoading(false);
  };

  const reset = () => {
    setStep('input');
    setDecision(null);
    setResult(null);
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🚀 AI-Driven Generation Demo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Watch AI analyze your request, choose the perfect strategy, and generate content automatically
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { key: 'input', label: 'Input', icon: '📝' },
                { key: 'analyzing', label: 'AI Analysis', icon: '🧠' },
                { key: 'decision', label: 'Strategy', icon: '🎯' },
                { key: 'generating', label: 'Generate', icon: '⚡' },
                { key: 'complete', label: 'Complete', icon: '✅' }
              ].map((stepItem, index) => (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg
                    ${step === stepItem.key ? 'bg-blue-500 text-white animate-pulse' : 
                      ['analyzing', 'decision', 'generating', 'complete'].indexOf(step) > 
                      ['analyzing', 'decision', 'generating', 'complete'].indexOf(stepItem.key) ? 
                      'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {stepItem.icon}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step === stepItem.key ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Input Form */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Photosynthesis, Ancient Rome, Fractions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="k-2">K-2</option>
                    <option value="3-5">3-5</option>
                    <option value="6-8">6-8</option>
                    <option value="9-12">9-12</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="science">Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="social_studies">Social Studies</option>
                    <option value="language_arts">Language Arts</option>
                    <option value="arts">Arts</option>
                  </select>
                </div>
              </div>

              <button
                onClick={analyzeAndGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                🤖 AI Analyze & Generate
              </button>
            </div>
          )}

          {/* AI Analysis Step */}
          {step === 'analyzing' && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-spin">🧠</div>
              <h3 className="text-2xl font-bold text-gray-800">AI is Analyzing Your Request</h3>
              <p className="text-gray-600">GPT-4 is examining topic complexity, grade level, and pedagogical requirements...</p>
            </div>
          )}

          {/* Decision Display */}
          {step === 'decision' && decision && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Decision Made!</h3>
                <p className="text-gray-600">Strategy selected with {decision.confidence}% confidence</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {decision.strategy.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="w-48 bg-green-200 rounded-full h-4 mr-2">
                      <div 
                        className="bg-green-600 h-4 rounded-full transition-all duration-1000"
                        style={{ width: `${decision.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {decision.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Step */}
          {step === 'generating' && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-pulse">⚡</div>
              <h3 className="text-2xl font-bold text-gray-800">Generating Your Workbook</h3>
              <p className="text-gray-600">Using {decision?.strategy} strategy to create educational content...</p>
            </div>
          )}

          {/* Results */}
          {step === 'complete' && result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Generation Complete!</h3>
                <p className="text-gray-600">Generated using <span className="font-bold text-blue-600">{result.strategy.toUpperCase()}</span> strategy in {Math.round(result.processingTime/1000)}s</p>
                <p className="text-sm text-green-600 mt-2">✨ AI Decision Engine successfully chose the optimal generation approach!</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">{result.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sections.slice(0, 4).map((section, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                      <h5 className="font-semibold text-gray-700 mb-2">{section.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        {section.content.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-gray-500">
                        {section.exercises.length} exercises included
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.open(`/test-viewer?workbookId=${result.workbookId}`, '_blank')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  📖 View Full Workbook
                </button>
                <button
                  onClick={reset}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  🔄 Try Another Topic
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}