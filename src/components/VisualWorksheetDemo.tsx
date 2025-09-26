/**
 * Visual Fraction Worksheet Demo Component
 * Demonstrates the visual worksheet generation capabilities
 */

'use client';

import React, { useState } from 'react';

export function VisualWorksheetDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateVisualWorksheet = async (type: 'identify' | 'color' | 'compare' | 'mixed') => {
    setIsGenerating(true);
    setDownloadUrl(null);

    try {
      let requestData: {
        type: string;
        title: string;
        gradeLevel: number;
        problemTypes: string[];
      };

      switch (type) {
        case 'identify':
          requestData = {
            type: 'identify',
            title: 'Identifying Fractions',
            gradeLevel: 3,
            problemTypes: ['identify_fraction']
          };
          break;
        case 'color':
          requestData = {
            type: 'color',
            title: 'Coloring Fractions', 
            gradeLevel: 3,
            problemTypes: ['color_fraction']
          };
          break;
        case 'compare':
          requestData = {
            type: 'compare',
            title: 'Comparing Fractions',
            gradeLevel: 4,
            problemTypes: ['compare_fractions']
          };
          break;
        case 'mixed':
          requestData = {
            type: 'mixed',
            title: 'Fraction Practice',
            gradeLevel: 3,
            problemTypes: ['identify_fraction', 'color_fraction', 'compare_fractions']
          };
          break;
        default:
          throw new Error('Invalid worksheet type');
      }

      // Call the API to generate the PDF
      const response = await fetch('/api/visual-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate worksheet');
      }

      // Get the HTML file blob from response
      const htmlBlob = await response.blob();

      // Create download URL
      const url = URL.createObjectURL(htmlBlob);
      setDownloadUrl(url);

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-fractions-worksheet.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error generating visual worksheet:', error);
      alert(`Error generating worksheet: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Visual Fraction Worksheets Demo
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">What Makes These Different?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ <strong>Visual-First:</strong> Geometric shapes and diagrams, not text walls</li>
          <li>✅ <strong>Print-Ready:</strong> Clean layouts perfect for classroom use</li>
          <li>✅ <strong>Professional:</strong> Matches commercial educational materials</li>
          <li>✅ <strong>Grade-Appropriate:</strong> Proper difficulty progression</li>
          <li>✅ <strong>Answer Keys:</strong> Separate page for easy removal</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => generateVisualWorksheet('identify')}
          disabled={isGenerating}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Identify Fractions'}
          <div className="text-sm font-normal mt-1">Circle divided into parts, &ldquo;What fraction is shaded?&rdquo;</div>
        </button>

        <button
          onClick={() => generateVisualWorksheet('color')}
          disabled={isGenerating}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Color Fractions'}
          <div className="text-sm font-normal mt-1">Empty shapes, &ldquo;Color 2/3 of the rectangle&rdquo;</div>
        </button>

        <button
          onClick={() => generateVisualWorksheet('compare')}
          disabled={isGenerating}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Compare Fractions'}
          <div className="text-sm font-normal mt-1">Side-by-side visuals, &ldquo;Circle the larger fraction&rdquo;</div>
        </button>

        <button
          onClick={() => generateVisualWorksheet('mixed')}
          disabled={isGenerating}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Mixed Practice'}
          <div className="text-sm font-normal mt-1">Variety of visual fraction problems</div>
        </button>
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-gray-700 mb-3">Expected Output:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Page 1:</strong> Clean worksheet with Name/Date fields, visual problems in grid layout
          </p>
          <p className="text-sm text-gray-600">
            <strong>Page 2:</strong> Answer key (separate for easy teacher use)
          </p>
        </div>
      </div>

      {downloadUrl && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-semibold">✅ Worksheet generated successfully!</p>
          <p className="text-sm text-green-700 mt-1">The PDF should have downloaded automatically.</p>
        </div>
      )}
    </div>
  );
}