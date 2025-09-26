export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Pedagogical Workbook Generator
        </h1>
        <div className="text-center">
          <p className="mb-4">AI-Powered Educational Content Creation</p>
          <div className="space-x-4">
            <a 
              href="/generate" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-green-700 transition-colors"
            >
              Generate Workbook
            </a>
            <a 
              href="/topic-demo" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-orange-700 transition-colors"
            >
              Topic Selector Demo
            </a>
            <a 
              href="/phase2-testing" 
              className="bg-purple-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-purple-700 transition-colors"
            >
              Phase 2 Testing
            </a>
            <a 
              href="/api/test" 
              target="_blank"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors"
            >
              Test AI Service
            </a>
            <a 
              href="/api/test-phase1" 
              target="_blank"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-indigo-700 transition-colors"
            >
              Test Phase 1 Setup
            </a>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">System Status</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="text-green-600">
                ✅ Phase 1: Foundation Complete
              </div>
              <div className="text-purple-600">
                🚀 Phase 2: Content Generation Ready
              </div>
              <div className="text-yellow-600">
                🔑 API Keys: Configure for live testing
              </div>
              <div className="text-blue-600">
                🧪 Testing Framework: Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
