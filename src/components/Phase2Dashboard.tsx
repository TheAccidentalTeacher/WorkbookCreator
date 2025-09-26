'use client';

import React from 'react';

interface ServiceCardProps {
  name: string;
  description: string;
  status: 'configured' | 'needs_key' | 'error';
  apiKeyRequired: string;
  documentation?: string;
}

interface ProgressStepProps {
  step: number;
  title: string;
  completed: boolean;
  description: string;
}

export function Phase2Dashboard() {
  const services: ServiceCardProps[] = [
    {
      name: 'Symbolab Math Service',
      description: 'Advanced math problem generation and step-by-step solutions',
      status: 'needs_key',
      apiKeyRequired: 'SYMBOLAB_API_KEY',
      documentation: 'https://symbolab.com/api',
    },
    {
      name: 'Google Vertex AI',
      description: 'AI-powered content generation and educational explanations',
      status: 'needs_key',
      apiKeyRequired: 'GOOGLE_VERTEX_AI_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS',
      documentation: 'https://cloud.google.com/vertex-ai/docs',
    },
    {
      name: 'VectorArt.ai Service',
      description: 'Educational illustrations and scientific diagrams',
      status: 'needs_key',
      apiKeyRequired: 'VECTORART_AI_API_KEY',
      documentation: 'https://vectorart.ai/docs',
    },
  ];

  const progressSteps: ProgressStepProps[] = [
    {
      step: 1,
      title: 'Phase 1 Foundation',
      completed: true,
      description: 'Core infrastructure and PDF generation completed',
    },
    {
      step: 2,
      title: 'API Services Implementation',
      completed: true,
      description: 'All third-party API services implemented and tested',
    },
    {
      step: 3,
      title: 'API Key Configuration',
      completed: false,
      description: 'Configure API keys for external services',
    },
    {
      step: 4,
      title: 'Live Testing',
      completed: false,
      description: 'Test content generation with real APIs',
    },
    {
      step: 5,
      title: 'UI Integration',
      completed: false,
      description: 'Update user interface for content generation',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'text-green-600 bg-green-100';
      case 'needs_key': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured': return '✅';
      case 'needs_key': return '🔑';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-8">
      {/* Phase 2 Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Phase 2: Content Generation Integration</h1>
        <p className="text-lg opacity-90">
          Advanced AI-powered content generation with multiple specialized services
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Implementation Progress</h2>
        <div className="space-y-4">
          {progressSteps.map((step) => (
            <div key={step.step} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step.completed ? '✓' : step.step}
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold ${step.completed ? 'text-green-700' : 'text-gray-700'}`}>
                    {step.title}
                  </h3>
                  {step.completed && <span className="text-green-600 text-sm">✅ Complete</span>}
                </div>
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Services Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">API Services Status</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <span className="text-2xl">{getStatusIcon(service.status)}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                {service.status === 'configured' && 'Ready'}
                {service.status === 'needs_key' && 'API Key Required'}
                {service.status === 'error' && 'Configuration Error'}
              </div>
              
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Required:</span> {service.apiKeyRequired}
                </div>
                {service.documentation && (
                  <div>
                    <span className="font-medium">Docs:</span>{' '}
                    <a 
                      href={service.documentation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Documentation
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Quick Start Guide</h2>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <h4 className="font-semibold">Obtain API Keys</h4>
              <p className="text-sm text-gray-600">Sign up for accounts and get API keys from each service provider</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <h4 className="font-semibold">Configure Environment</h4>
              <p className="text-sm text-gray-600">Add API keys to your .env.local file</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <h4 className="font-semibold">Run Tests</h4>
              <p className="text-sm text-gray-600">Use the testing interface below to verify all services are working</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <h4 className="font-semibold">Generate Content</h4>
              <p className="text-sm text-gray-600">Start creating worksheets with AI-powered content generation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Phase 2 Implementation Summary</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">✅ Completed Features</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Symbolab Math Service integration</li>
              <li>• Google Vertex AI service implementation</li>
              <li>• VectorArt.ai illustration service</li>
              <li>• Enhanced API coordination system</li>
              <li>• Content validation and quality scoring</li>
              <li>• Comprehensive testing framework</li>
              <li>• Rate limiting and error handling</li>
              <li>• Mock API functionality for testing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">🚀 Next Steps</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Configure API keys for external services</li>
              <li>• Test content generation with real APIs</li>
              <li>• Update main UI for content generation</li>
              <li>• Implement content caching system</li>
              <li>• Add user preferences and templates</li>
              <li>• Performance optimization and monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}