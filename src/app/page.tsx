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
              href="/api/test" 
              target="_blank"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors"
            >
              Test AI Service
            </a>
          </div>
          <p className="text-green-600 mt-4">API Keys Configured</p>
        </div>
      </div>
    </div>
  );
}
