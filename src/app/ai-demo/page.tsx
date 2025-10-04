'use client';

import { useState } from 'react';

interface AIDecision {
  strategy: string;
  confidence: number;
  reasoning: string;
  parameters: Record<string, string | number | boolean>;
  fallback?: string;
}

export default function AIDemoPage() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('k-2');
  const [domain, setDomain] = useState('science');
  const [decision, setDecision] = useState<AIDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const testAIDecision = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai-decision-demo', {
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
      
      const result = await response.json();
      setDecision(result.decision);
    } catch (error) {
      console.error('AI Decision test failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 AI Decision Engine Demo
          </h1>
          <p className="text-gray-600 text-center mb-8">
            See how GPT-4 intelligently chooses the best generation strategy for your educational content
          </p>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic/Subject
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Ancient Egypt, Fractions"
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
            onClick={testAIDecision}
            disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? '🧠 AI is analyzing...' : '🚀 Analyze with AI Decision Engine'}
          </button>
        </div>

        {/* Results Section */}
        {decision && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              🎯 AI Decision Analysis
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strategy & Confidence */}
              <div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Recommended Strategy
                  </h3>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {decision.strategy.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-green-600 mr-2">Confidence:</span>
                    <div className="flex-1 bg-green-200 rounded-full h-3 mr-2">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${decision.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {decision.confidence}%
                    </span>
                  </div>
                </div>

                {decision.fallback && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">
                      Fallback Strategy
                    </h3>
                    <div className="text-xl font-semibold text-amber-700">
                      {decision.fallback.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    🧠 AI Reasoning
                  </h3>
                  <p className="text-blue-700 leading-relaxed">
                    {decision.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Generation Parameters */}
            {Object.keys(decision.parameters).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Optimized Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(decision.parameters).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-lg font-bold text-gray-800 mt-1">
                        {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy Explanation */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">
                🎭 Strategy Explanation
              </h3>
              <div className="space-y-3 text-purple-700">
                {decision.strategy === 'simple' && (
                  <p>The <strong>Simple Strategy</strong> is perfect for quick, straightforward content generation with minimal complexity and fast turnaround.</p>
                )}
                {decision.strategy === 'comprehensive' && (
                  <p>The <strong>Comprehensive Strategy</strong> creates detailed, multi-layered educational content with extensive visual elements and pedagogical depth.</p>
                )}
                {decision.strategy === 'specialized' && (
                  <p>The <strong>Specialized Strategy</strong> uses domain-specific expertise and advanced pedagogical techniques for complex or nuanced topics.</p>
                )}
                {decision.strategy === 'hybrid' && (
                  <p>The <strong>Hybrid Strategy</strong> combines multiple approaches to balance speed, quality, and educational effectiveness.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}