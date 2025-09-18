'use client';

import { WorkbookViewer } from '../../components/WorkbookViewer';
import { mockWorkbook } from '../../components/mockData';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Workbook Viewer Test
          </h1>
          <p className="text-gray-600">
            Preview of the generated workbook viewer component
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <WorkbookViewer workbook={mockWorkbook} />
        </div>
      </div>
    </div>
  );
}