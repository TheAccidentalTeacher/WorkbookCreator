'use client';

import { useState } from 'react';
import { GradeBandType, SubjectDomainType } from '../types';

interface WorkbookGenerationFormProps {
  onGenerate: (formData: {
    topic: string;
    gradeBand: string;
    subjectDomain?: string;
    options?: Record<string, unknown>;
  }) => void;
  isGenerating: boolean;
}

export function WorkbookGenerationForm({ onGenerate, isGenerating }: WorkbookGenerationFormProps) {
  const [topic, setTopic] = useState('');
  const [gradeBand, setGradeBand] = useState<GradeBandType>('6-8');
  const [subjectDomain, setSubjectDomain] = useState<SubjectDomainType>('mathematics');
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
      options: {
        objectiveCount,
        sectionCount,
        includeExercises: true,
        includeSolutions: true,
        includeMisconceptions: true
      }
    });
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

      {/* Generate Button */}
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

      {/* Info Text */}
      <div className="text-xs text-gray-500 text-center">
        Generation typically takes 30-60 seconds
      </div>
    </form>
  );
}