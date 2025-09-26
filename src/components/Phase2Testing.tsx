'use client';

import React, { useState } from 'react';
import { Phase2Dashboard } from './Phase2Dashboard';

interface APIStatus {
  name: string;
  status: 'available' | 'needs_key' | 'error';
  configured: boolean;
  last_check?: string;
  error_message?: string;
}

interface TestResult {
  service: string;
  test_type: string;
  success: boolean;
  duration_ms: number;
  message?: string;
  error?: string;
}

interface ContentGenerationRequest {
  subject: string;
  topic: string;
  grade_level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  content_types: string[];
  include_visuals: boolean;
  worksheet_length: 'short' | 'medium' | 'long';
}

interface ContentSection {
  id: string;
  type: string;
  content: string;
  metadata?: {
    source_service?: string;
    generation_time?: number;
    quality_score?: number;
    safety_approved?: boolean;
  };
}

interface ContentResult {
  request_id: string;
  content_sections: ContentSection[];
  total_generation_time: number;
  services_used: string[];
  quality_metrics?: {
    average_quality_score?: number;
    safety_compliance?: boolean;
    content_coherence?: number;
  };
}

export function Phase2Testing() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [contentRequest, setContentRequest] = useState<ContentGenerationRequest>({
    subject: 'math',
    topic: 'algebra basics',
    grade_level: 8,
    difficulty: 'medium',
    content_types: ['explanations'],
    include_visuals: false,
    worksheet_length: 'short',
  });
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      console.log('Running Phase 2 health check...');
      
      const response = await fetch('/api/test-phase2?type=health');
      const data = await response.json();
      
      if (data.success) {
        setApiStatuses(data.result.api_statuses || []);
        console.log('Health check completed:', data.result);
      } else {
        console.error('Health check failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to run health check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTests = async () => {
    setIsLoading(true);
    try {
      console.log('Running full Phase 2 tests...');
      
      const response = await fetch('/api/test-phase2?type=full');
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.report.test_results || []);
        setApiStatuses(data.report.api_statuses || []);
        console.log('Full tests completed:', data.report);
      } else {
        console.error('Full tests failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to run full tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testContentGeneration = async () => {
    setIsLoading(true);
    try {
      console.log('Testing content generation...', contentRequest);
      
      const response = await fetch('/api/test-phase2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentRequest),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContentResult(data.result);
        console.log('Content generation test completed:', data.result);
      } else {
        console.error('Content generation test failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to test content generation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'needs_key': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'needs_key': return '🔑';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-8">
      {/* Phase 2 Dashboard */}
      <Phase2Dashboard />

      {/* API Testing Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Phase 2 API Testing</h2>
        
        {/* Test Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={runHealthCheck}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Health Check'}
          </button>
          
          <button
            onClick={runFullTests}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Full Tests'}
          </button>
        </div>

        {/* API Status Display */}
        {apiStatuses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">API Status</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apiStatuses.map((api, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{api.name}</span>
                    <span className="text-2xl">{getStatusIcon(api.status)}</span>
                  </div>
                  <div className={`text-sm ${getStatusColor(api.status)}`}>
                    {api.status === 'available' && 'Ready to use'}
                    {api.status === 'needs_key' && 'API key required'}
                    {api.status === 'error' && (api.error_message || 'Configuration error')}
                  </div>
                  {api.last_check && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last checked: {new Date(api.last_check).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results Display */}
        {testResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-3 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.service} - {result.test_type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{result.duration_ms}ms</span>
                      <span className="text-lg">{result.success ? '✅' : '❌'}</span>
                    </div>
                  </div>
                  {(result.message || result.error) && (
                    <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message || result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Generation Testing */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Content Generation Testing</h2>
        
        {/* Content Request Form */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={contentRequest.subject}
              onChange={(e) => setContentRequest({...contentRequest, subject: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="history">History</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={contentRequest.topic}
              onChange={(e) => setContentRequest({...contentRequest, topic: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., algebra basics, photosynthesis"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select
              value={contentRequest.grade_level}
              onChange={(e) => setContentRequest({...contentRequest, grade_level: parseInt(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={contentRequest.difficulty}
              onChange={(e) => setContentRequest({...contentRequest, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Types</label>
            <div className="flex flex-wrap gap-2">
              {['explanations', 'problems', 'exercises', 'examples'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contentRequest.content_types.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setContentRequest({
                          ...contentRequest,
                          content_types: [...contentRequest.content_types, type]
                        });
                      } else {
                        setContentRequest({
                          ...contentRequest,
                          content_types: contentRequest.content_types.filter(t => t !== type)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={contentRequest.include_visuals}
                onChange={(e) => setContentRequest({...contentRequest, include_visuals: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Include Visuals</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={testContentGeneration}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? 'Generating...' : 'Test Content Generation'}
        </button>

        {/* Content Result Display */}
        {contentResult && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Generated Content</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Generation Time:</span> {contentResult.total_generation_time}ms
                </div>
                <div>
                  <span className="font-medium">Services Used:</span> {contentResult.services_used?.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Quality Score:</span> {contentResult.quality_metrics?.average_quality_score}
                </div>
              </div>
              
              {contentResult.content_sections?.map((section: ContentSection, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{section.type}</span>
                    <span className="text-sm text-gray-500">Quality: {section.metadata?.quality_score}</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{section.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}