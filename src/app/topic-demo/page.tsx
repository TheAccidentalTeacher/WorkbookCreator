'use client';

import { useState } from 'react';
import { HierarchicalTopicSelector } from '../../components/HierarchicalTopicSelector';

export default function TopicSelectorDemo() {
  const [selectedFormData, setSelectedFormData] = useState<{
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    options?: Record<string, unknown>;
  } | null>(null);

  const handleTopicSelect = (formData: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    options?: Record<string, unknown>;
  }) => {
    setSelectedFormData(formData);
    console.log('Selected topic data:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hierarchical Topic Selector Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the new curriculum-aligned topic selection system. Choose by grade level, 
            then browse through organized subjects and categories, or search across all topics.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Topic Selector */}
            <div className="lg:col-span-2">
              <HierarchicalTopicSelector 
                onTopicSelect={handleTopicSelect}
                isGenerating={false}
              />
            </div>

            {/* Selection Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Current Selection
                </h3>
                
                {selectedFormData ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Topic</label>
                      <p className="text-gray-900 font-medium">{selectedFormData.topic}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Grade Level</label>
                      <p className="text-gray-900">{selectedFormData.gradeBand}</p>
                    </div>
                    
                    {selectedFormData.subjectDomain && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subject Domain</label>
                        <p className="text-gray-900 capitalize">{selectedFormData.subjectDomain.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Learning Objectives</label>
                      <p className="text-gray-900">{(selectedFormData.options?.objectiveCount as number) || 3}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sections</label>
                      <p className="text-gray-900">{(selectedFormData.options?.sectionCount as number) || 4}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">📄 Generated Workbook Would Include:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>✅ {(selectedFormData.options?.objectiveCount as number) || 3} Learning objectives</li>
                        <li>✅ {(selectedFormData.options?.sectionCount as number) || 4} Content sections</li>
                        <li>✅ Interactive exercises</li>
                        <li>✅ Common misconceptions</li>
                        <li>✅ Answer keys</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => setSelectedFormData(null)}
                        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm">
                      Make a selection to see the preview here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-800 mb-2">Curriculum Aligned</h3>
                <p className="text-sm text-gray-600">
                  Topics organized by educational standards and age-appropriate difficulty levels
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Hierarchical Navigation</h3>
                <p className="text-sm text-gray-600">
                  Grade → Subject → Category → Topic for intuitive browsing
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart Search</h3>
                <p className="text-sm text-gray-600">
                  Find topics across all grades and subjects with keyword matching
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">⚙️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Customizable</h3>
                <p className="text-sm text-gray-600">
                  Adjust learning objectives, sections, and complexity to fit your needs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Topics Showcase */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Sample Topics by Grade</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">K-2 (Ages 5-8)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🔢 Counting 1-20</li>
                  <li>📐 Basic Shapes</li>
                  <li>🐛 Animal Needs</li>
                  <li>📝 Letter Sounds</li>
                  <li>👥 Community Helpers</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-800 mb-3">3-5 (Ages 8-11)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🍕 Fractions</li>
                  <li>🔄 Multiplication Facts</li>
                  <li>🌱 Plant Life Cycles</li>
                  <li>⚡ Forces & Motion</li>
                  <li>🗺️ Maps & Geography</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-purple-800 mb-3">6-8 (Ages 11-14)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>📊 Ratios & Proportions</li>
                  <li>🧬 Cell Structure</li>
                  <li>⚛️ Atomic Structure</li>
                  <li>🌍 Plate Tectonics</li>
                  <li>📜 Ancient Civilizations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}