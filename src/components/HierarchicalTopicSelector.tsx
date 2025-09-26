'use client';

import { useState, useEffect } from 'react';
import { GradeBandType, SubjectDomainType } from '../types';
import { TextDensityLevel } from '../services/visualContentService';
import { 
  CURRICULUM_STRUCTURE, 
  getSubjectsForGrade, 
  getSubSubjects, 
  getTopics,
  searchTopics,
  Topic
} from '../data/curriculum-topics';

interface HierarchicalTopicSelectorProps {
  onTopicSelect: (formData: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    textDensity?: TextDensityLevel;
    visualOptions?: {
      includeIllustrations: boolean;
      includeDiagrams: boolean;
      includeInteractiveElements: boolean;
      includeColorCoding: boolean;
      creativityLevel: string;
    };
    options?: Record<string, unknown>;
    generationMode?: 'quick' | 'comprehensive';
  }) => void;
  isGenerating: boolean;
}

export function HierarchicalTopicSelector({ onTopicSelect, isGenerating }: HierarchicalTopicSelectorProps) {
  // Selection state
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedSubSubject, setSelectedSubSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  // UI state
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ topic: Topic; path: string }[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Generation options
  const [generationMode, setGenerationMode] = useState<'quick' | 'comprehensive'>('quick'); // Default to Quick Mode
  const [textDensity, setTextDensity] = useState<TextDensityLevel>('minimal'); // Default to visual-first
  const [includeIllustrations, setIncludeIllustrations] = useState(true);
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeInteractiveElements, setIncludeInteractiveElements] = useState(true);
  const [includeColorCoding, setIncludeColorCoding] = useState(true);
  const [creativityLevel, setCreativityLevel] = useState('high');
  const [isExporting, setIsExporting] = useState(false);
  
  // Advanced options
  const [objectiveCount, setObjectiveCount] = useState(3);
  const [sectionCount, setSectionCount] = useState(4);

  // Derived data
  const availableSubjects = selectedGrade ? getSubjectsForGrade(selectedGrade) : [];
  const availableSubSubjects = selectedGrade && selectedSubject ? getSubSubjects(selectedGrade, selectedSubject) : [];
  const availableTopics = selectedGrade && selectedSubject && selectedSubSubject ? getTopics(selectedGrade, selectedSubject, selectedSubSubject) : [];

  // Search functionality
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchTopics(searchQuery, selectedGrade || undefined);
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedGrade]);

  // Reset selections when parent selections change
  useEffect(() => {
    setSelectedSubject('');
    setSelectedSubSubject('');
    setSelectedTopic('');
  }, [selectedGrade]);

  useEffect(() => {
    setSelectedSubSubject('');
    setSelectedTopic('');
  }, [selectedSubject]);

  useEffect(() => {
    setSelectedTopic('');
  }, [selectedSubSubject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTopic = '';
    let subjectDomain: SubjectDomainType = 'other';

    if (searchMode || customTopic) {
      finalTopic = customTopic;
    } else if (selectedTopic) {
      const topic = availableTopics.find(t => t.id === selectedTopic);
      finalTopic = topic ? topic.name : '';
    }

    if (selectedSubject) {
      // Map internal subject IDs to SubjectDomainType
      const subjectMap: Record<string, SubjectDomainType> = {
        'mathematics': 'mathematics',
        'science': 'science',
        'english_language_arts': 'english_language_arts',
        'social_studies': 'social_studies',
        'history': 'history',
        'geography': 'geography',
        'art': 'art',
        'music': 'music',
        'physical_education': 'physical_education',
        'computer_science': 'computer_science',
        'foreign_language': 'foreign_language'
      };
      subjectDomain = subjectMap[selectedSubject] || 'other';
    }

    if (!finalTopic.trim() || !selectedGrade) return;

    onTopicSelect({
      topic: finalTopic.trim(),
      gradeBand: selectedGrade as GradeBandType,
      subjectDomain,
      textDensity,
      visualOptions: {
        includeIllustrations,
        includeDiagrams,
        includeInteractiveElements,
        includeColorCoding,
        creativityLevel
      },
      options: {
        objectiveCount,
        sectionCount,
        includeExercises: true,
        includeSolutions: true,
        includeMisconceptions: true
      },
      generationMode
    });
  };

  const handleSearchTopicSelect = (topic: Topic) => {
    setCustomTopic(topic.name);
    setSearchQuery(topic.name);
    setSearchResults([]);
  };

  const handleExportPrompt = async (targetAI: 'claude' | 'chatgpt' = 'claude') => {
    if (!canSubmit()) return;

    setIsExporting(true);
    try {
      let finalTopic = '';
      let subjectDomain: SubjectDomainType = 'other';

      if (searchMode || customTopic) {
        finalTopic = customTopic;
      } else if (selectedTopic) {
        const topic = availableTopics.find(t => t.id === selectedTopic);
        finalTopic = topic ? topic.name : '';
      }

      if (selectedSubject) {
        const subjectMap: Record<string, SubjectDomainType> = {
          'mathematics': 'mathematics',
          'science': 'science',
          'english_language_arts': 'english_language_arts',
          'social_studies': 'social_studies',
          'history': 'history',
          'geography': 'geography',
          'art': 'art',
          'music': 'music',
          'physical_education': 'physical_education',
          'computer_science': 'computer_science',
          'foreign_language': 'foreign_language'
        };
        subjectDomain = subjectMap[selectedSubject] || 'other';
      }

      const requestData = {
        topic: finalTopic.trim(),
        gradeBand: selectedGrade as GradeBandType,
        subjectDomain,
        textDensity,
        visualOptions: {
          includeIllustrations,
          includeDiagrams,
          includeInteractiveElements,
          includeColorCoding,
          creativityLevel
        },
        options: {
          objectiveCount,
          sectionCount,
          includeExercises: true,
          includeSolutions: true,
          includeMisconceptions: true
        },
        generationMode,
        targetAI
      };

      const response = await fetch('/api/export-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.prompt);
      
      // Show success message (you might want to add a toast notification here)
      alert(`✅ Prompt exported and copied to clipboard!\n\nReady to paste into ${targetAI === 'claude' ? 'Claude' : 'ChatGPT'}.`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { id: 1, name: 'Grade Level', completed: !!selectedGrade },
      { id: 2, name: 'Subject', completed: !!selectedSubject },
      { id: 3, name: 'Category', completed: !!selectedSubSubject },
      { id: 4, name: 'Topic', completed: !!selectedTopic || !!customTopic }
    ];
    return steps;
  };

  const canSubmit = () => {
    return selectedGrade && ((selectedTopic && selectedSubject && selectedSubSubject) || customTopic.trim());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Select Your Workbook Topic
      </h2>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {getProgressSteps().map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : index === getProgressSteps().findIndex(s => !s.completed)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? '✓' : step.id}
              </div>
              <span className={`ml-2 text-sm ${step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                {step.name}
              </span>
              {index < getProgressSteps().length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => { setSearchMode(false); setSearchQuery(''); setCustomTopic(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !searchMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 Browse by Grade & Subject
          </button>
          <button
            type="button"
            onClick={() => setSearchMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchMode 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 Search Topics
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Generation Mode Selection */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-semibold text-green-900 mb-3">⚡ Generation Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGenerationMode('quick')}
              className={`p-3 rounded-lg text-left transition-colors ${
                generationMode === 'quick'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
              }`}
              disabled={isGenerating}
            >
              <div className="font-medium">⚡ Quick Mode</div>
              <div className="text-xs opacity-75 mt-1">
                • 30-60 seconds<br/>
                • ~$0.05 cost<br/>
                • 1-2 API calls<br/>
                • Good quality
              </div>
            </button>
            <button
              type="button"
              onClick={() => setGenerationMode('comprehensive')}
              className={`p-3 rounded-lg text-left transition-colors ${
                generationMode === 'comprehensive'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
              }`}
              disabled={isGenerating}
            >
              <div className="font-medium">🔬 Comprehensive Mode</div>
              <div className="text-xs opacity-75 mt-1">
                • 5+ minutes<br/>
                • $0.25-0.35 cost<br/>
                • 10+ API calls<br/>
                • Highest quality
              </div>
            </button>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {generationMode === 'quick' 
              ? '⚡ Perfect for rapid prototyping and quick iterations' 
              : '🔬 Best for final production workbooks with maximum detail'}
          </p>
        </div>

        {/* Visual Content Settings */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">📊 Visual Content Settings</h3>
          
          {/* Text Density Control */}
          <div className="mb-3">
            <label htmlFor="textDensity" className="block text-sm font-medium text-blue-800 mb-2">
              Content Style (defaults to visual-first)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTextDensity('minimal')}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                  textDensity === 'minimal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                }`}
                disabled={isGenerating}
              >
                🎨 Visual-Heavy
                <br />
                <span className="text-xs opacity-75">(85% graphics)</span>
              </button>
              <button
                type="button"
                onClick={() => setTextDensity('moderate')}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                  textDensity === 'moderate'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                }`}
                disabled={isGenerating}
              >
                ⚖️ Balanced
                <br />
                <span className="text-xs opacity-75">(65% graphics)</span>
              </button>
              <button
                type="button"
                onClick={() => setTextDensity('text-heavy')}
                className={`px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                  textDensity === 'text-heavy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                }`}
                disabled={isGenerating}
              >
                📝 Text-Heavy
                <br />
                <span className="text-xs opacity-75">(35% graphics)</span>
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {textDensity === 'minimal' && '🎨 Maximum creativity with minimal text - perfect for visual learners!'}
              {textDensity === 'moderate' && '⚖️ Balanced approach combining visuals with supporting text'}
              {textDensity === 'text-heavy' && '📝 Traditional text-focused format with strategic visual support'}
            </p>
          </div>

          {/* Visual Elements Toggles */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeIllustrations}
                onChange={(e) => setIncludeIllustrations(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <span className="text-blue-800">🖼️ Illustrations</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeDiagrams}
                onChange={(e) => setIncludeDiagrams(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <span className="text-blue-800">📊 Diagrams & Charts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeInteractiveElements}
                onChange={(e) => setIncludeInteractiveElements(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <span className="text-blue-800">🎯 Interactive Elements</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeColorCoding}
                onChange={(e) => setIncludeColorCoding(e.target.checked)}
                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <span className="text-blue-800">🌈 Color Coding</span>
            </label>
          </div>

          {/* Creativity Level */}
          <div>
            <label htmlFor="creativityLevel" className="block text-sm font-medium text-blue-800 mb-1">
              Creativity Level
            </label>
            <select
              id="creativityLevel"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="standard">✨ Standard - Clean and professional</option>
              <option value="high">🎨 High - Creative and engaging</option>
              <option value="maximum">🚀 Maximum - Wildly creative and innovative</option>
            </select>
          </div>
        </div>

        {/* Grade Level Selection - Always Required */}
        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Grade Level <span className="text-red-500">*</span>
          </label>
          <select
            id="gradeLevel"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
            required
          >
            <option value="">Choose a grade level...</option>
            {CURRICULUM_STRUCTURE.map((curriculum) => (
              <option key={curriculum.gradeLevel} value={curriculum.gradeLevel}>
                {curriculum.displayName} ({curriculum.ageRange})
              </option>
            ))}
          </select>
        </div>

        {searchMode ? (
          /* Search Mode */
          <div className="space-y-4">
            <div>
              <label htmlFor="topicSearch" className="block text-sm font-medium text-gray-700 mb-2">
                Search for a Topic <span className="text-red-500">*</span>
              </label>
              <input
                id="topicSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCustomTopic(e.target.value); }}
                placeholder="e.g., fractions, photosynthesis, civil war, poetry..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Type at least 2 characters to see suggestions
              </p>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Topics:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSearchTopicSelect(result.topic)}
                      className="w-full text-left p-3 bg-white rounded-md border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{result.topic.name}</div>
                      <div className="text-sm text-gray-500">{result.topic.description}</div>
                      <div className="text-xs text-blue-600 mt-1">{result.path}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Hierarchical Browse Mode */
          selectedGrade && (
            <div className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Area <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                  required
                >
                  <option value="">Choose a subject...</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.icon} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Subject Selection */}
              {selectedSubject && (
                <div>
                  <label htmlFor="subSubject" className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subSubject"
                    value={selectedSubSubject}
                    onChange={(e) => setSelectedSubSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                    required
                  >
                    <option value="">Choose a category...</option>
                    {availableSubSubjects.map((subSubject) => (
                      <option key={subSubject.id} value={subSubject.id}>
                        {subSubject.name}
                      </option>
                    ))}
                  </select>
                  {selectedSubSubject && (
                    <p className="text-sm text-gray-600 mt-1">
                      {availableSubSubjects.find(ss => ss.id === selectedSubSubject)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Specific Topic Selection */}
              {selectedSubSubject && (
                <div>
                  <label htmlFor="specificTopic" className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="specificTopic"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                    required
                  >
                    <option value="">Choose a specific topic...</option>
                    {availableTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  {selectedTopic && (
                    <p className="text-sm text-gray-600 mt-1">
                      {availableTopics.find(t => t.id === selectedTopic)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            disabled={isGenerating}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div>
              <label htmlFor="objectiveCount" className="block text-sm font-medium text-gray-700 mb-1">
                Learning Objectives Count
              </label>
              <select
                id="objectiveCount"
                value={objectiveCount}
                onChange={(e) => setObjectiveCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value={2}>2 objectives</option>
                <option value={3}>3 objectives</option>
                <option value={4}>4 objectives</option>
                <option value={5}>5 objectives</option>
              </select>
            </div>

            <div>
              <label htmlFor="sectionCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Sections
              </label>
              <select
                id="sectionCount"
                value={sectionCount}
                onChange={(e) => setSectionCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value={3}>3 sections</option>
                <option value={4}>4 sections</option>
                <option value={5}>5 sections</option>
                <option value={6}>6 sections</option>
              </select>
            </div>
          </div>
        )}

        {/* Generate Button and Export Options */}
        <div className="space-y-3">
          {/* Main Generate Button */}
          <button
            type="submit"
            disabled={isGenerating || !canSubmit()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isGenerating || !canSubmit()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>
                  {generationMode === 'quick' ? 'Generating (30-60s)...' : 'Generating (5+ min)...'}
                </span>
              </div>
            ) : (
              `${generationMode === 'quick' ? '⚡ Generate Quick Workbook' : '🔬 Generate Comprehensive Workbook'}`
            )}
          </button>

          {/* Export Prompt Buttons */}
          {canSubmit() && !isGenerating && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleExportPrompt('claude')}
                className="py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Export to Claude</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleExportPrompt('chatgpt')}
                className="py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>Export to ChatGPT</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generation Info */}
          {canSubmit() && (
            <div className="text-xs text-gray-600 text-center">
              <p>
                {generationMode === 'quick' 
                  ? '⚡ Quick generation: ~30-60 seconds, $0.05 cost, good quality' 
                  : '🔬 Comprehensive: ~5+ minutes, $0.25-0.35 cost, highest quality'}
              </p>
              <p className="mt-1">Export prompts to use with external AI tools instead of generating here</p>
            </div>
          )}
        </div>
      </form>

      {/* Information Panel */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 How This Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>📚 <strong>Browse Mode:</strong> Navigate through grade levels → subjects → categories → specific topics</li>
          <li>🔍 <strong>Search Mode:</strong> Type any topic to find it across all grade levels and subjects</li>
          <li>🎯 <strong>Curriculum-Aligned:</strong> Topics are organized by educational standards and age-appropriate difficulty</li>
          <li>⚙️ <strong>Customizable:</strong> Adjust learning objectives and section count in Advanced Options</li>
        </ul>
      </div>
    </div>
  );
}