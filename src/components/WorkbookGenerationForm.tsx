'use client';

import { useState } from 'react';
import { GradeBandType, SubjectDomainType } from '../types';
import { TextDensityLevel } from '../services/visualContentService';
import { ClientSafeSimplePromptGenerator } from '../services/clientSafeSimplePromptGenerator';

interface WorkbookGenerationFormProps {
  onGenerate: (formData: {
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

export function WorkbookGenerationForm({ onGenerate, isGenerating }: WorkbookGenerationFormProps) {
  const [topic, setTopic] = useState('');
  const [gradeBand, setGradeBand] = useState<GradeBandType>('6-8');
  const [subjectDomain, setSubjectDomain] = useState<SubjectDomainType>('mathematics');
  const [generationMode, setGenerationMode] = useState<'quick' | 'comprehensive'>('quick'); // Default to Quick Mode
  const [textDensity, setTextDensity] = useState<TextDensityLevel>('minimal'); // Default to visual-first
  const [includeIllustrations, setIncludeIllustrations] = useState(true);
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeInteractiveElements, setIncludeInteractiveElements] = useState(true);
  const [includeColorCoding, setIncludeColorCoding] = useState(true);
  const [creativityLevel, setCreativityLevel] = useState('high');
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [objectiveCount, setObjectiveCount] = useState(3);
  const [sectionCount, setSectionCount] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic: topic.trim(),
      gradeBand,
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

  const handleExportPrompt = async () => {
    if (!topic.trim()) return;

    try {
      // Try server-side API first (preferred method)
      const response = await fetch('/api/export-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          gradeBand,
          domain: subjectDomain,
          textDensity,
          visualOptions: {
            includeIllustrations,
            includeDiagrams,
            includeInteractiveElements,
            includeColorCoding,
            creativityLevel: creativityLevel as 'standard' | 'high' | 'maximum'
          },
          sectionCount
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.promptText) {
          // Download the file
          const blob = new Blob([result.promptText], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      }
      
      // Fallback to client-side generation if server fails
      console.log('Server-side export failed, using client-side fallback');
      const clientGenerator = new ClientSafeSimplePromptGenerator();
      
      const request = {
        topic: topic.trim(),
        subject: subjectDomain,
        gradeLevel: gradeBand,
        pageCount: Math.max(3, sectionCount + 1),
        textDensity,
        visualOptions: {
          textDensity,
          includeIllustrations,
          includeDiagrams,
          includeInteractiveElements,
          includeColorCoding,
          creativityLevel: creativityLevel as 'standard' | 'high' | 'maximum'
        }
      };

      const prompts = clientGenerator.generatePrompts(request);
      
      // Create downloadable text file
      const promptText = `# Educational Workbook Generation Prompts
Generated: ${new Date().toISOString()}
Topic: ${topic.trim()}
Grade: ${gradeBand}
Subject: ${subjectDomain}
Mode: ${generationMode}

## Main Generation Prompt:
${prompts.workbookPrompt}

${prompts.imagePrompts && prompts.imagePrompts.length > 0 ? `
## Image Generation Prompts:
${prompts.imagePrompts.map((prompt, i) => `
### Image ${i + 1}:
${prompt}
`).join('')}
` : ''}

## Instructions for Use:
1. Copy the main prompt and paste it into ChatGPT, Claude, or another AI tool
2. Review and refine the generated content as needed
3. Use the image prompts with DALL-E, Midjourney, or similar image AI tools
4. Combine the text and images to create your final workbook

Generated with Client-Side Simple Generation Engine
`;

      // Download the file
      const blob = new Blob([promptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workbook-prompts-${topic.trim().replace(/[^a-zA-Z0-9]/g, '-')}-${gradeBand}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export prompts:', error);
      alert('Failed to export prompts. Please try again.');
    }
  };

  const gradeBands: { value: GradeBandType; label: string }[] = [
    { value: 'k-2', label: 'K-2 (Ages 5-8)' },
    { value: '3-5', label: '3-5 (Ages 8-11)' },
    { value: '6-8', label: '6-8 (Ages 11-14)' },
    { value: '9-10', label: '9-10 (Ages 14-16)' },
    { value: '11-12', label: '11-12 (Ages 16-18)' },
    { value: 'adult', label: 'Adult Education' }
  ];

  const subjects: { value: SubjectDomainType; label: string }[] = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'english_language_arts', label: 'English Language Arts' },
    { value: 'social_studies', label: 'Social Studies' },
    { value: 'history', label: 'History' },
    { value: 'geography', label: 'Geography' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'physical_education', label: 'Physical Education' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'foreign_language', label: 'Foreign Language' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Topic Input */}
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
          Topic *
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Fractions, Photosynthesis, World War II"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the main topic for your workbook
        </p>
      </div>

      {/* Grade Band Selection */}
      <div>
        <label htmlFor="gradeBand" className="block text-sm font-medium text-gray-700 mb-1">
          Grade Level
        </label>
        <select
          id="gradeBand"
          value={gradeBand}
          onChange={(e) => setGradeBand(e.target.value as GradeBandType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        >
          {gradeBands.map((band) => (
            <option key={band.value} value={band.value}>
              {band.label}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Domain Selection */}
      <div>
        <label htmlFor="subjectDomain" className="block text-sm font-medium text-gray-700 mb-1">
          Subject Area
        </label>
        <select
          id="subjectDomain"
          value={subjectDomain}
          onChange={(e) => setSubjectDomain(e.target.value as SubjectDomainType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        >
          {subjects.map((subject) => (
            <option key={subject.value} value={subject.value}>
              {subject.label}
            </option>
          ))}
        </select>
      </div>

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
        <div className="grid grid-cols-2 gap-3 text-sm">
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
        <div className="mt-3">
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

      {/* Advanced Options Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOptions(!advancedOptions)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={isGenerating}
        >
          {advancedOptions ? '▼' : '▶'} Advanced Options
        </button>
      </div>

      {/* Advanced Options */}
      {advancedOptions && (
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

      {/* Generate and Export Buttons */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isGenerating || !topic.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Workbook'
          )}
        </button>

        <button
          type="button"
          onClick={handleExportPrompt}
          disabled={isGenerating || !topic.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors text-sm ${
            isGenerating || !topic.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
          }`}
        >
          📝 Export Prompt Only (for ChatGPT/Claude)
        </button>
      </div>

      {/* Info Text */}
      <div className="text-xs text-gray-500 text-center">
        {generationMode === 'quick' 
          ? 'Quick Mode: Generation typically takes 30-60 seconds (~$0.05)' 
          : 'Comprehensive Mode: Generation takes 5+ minutes ($0.25-0.35)'}
      </div>
    </form>
  );
}