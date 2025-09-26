const http = require('http');
const url = require('url');

// Simple test server to validate our API endpoints
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${req.url}`);
  
  if (parsedUrl.pathname === '/api/generate-workbook' && req.method === 'GET') {
    // Test GET endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ready',
      version: 'Original System',
      endpoints: {
        generate: 'POST /api/generate-workbook'
      },
      integration: 'OpenAI & Anthropic'
    }));
  } else if (parsedUrl.pathname === '/api/generate-workbook' && req.method === 'POST') {
    // Test POST endpoint
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        console.log('Received request data:', requestData);
        
        // Mock response for testing
        const mockResponse = {
          success: true,
          workbook: {
            id: 'test-' + Date.now(),
            title: `${requestData.topic || 'Test Topic'} - Test Workbook`,
            topic: requestData.topic || 'Test Topic',
            learningObjectives: [
              {
                id: 'obj-1',
                description: 'Test learning objective',
                bloomsLevel: 'understand'
              }
            ],
            sections: [
              {
                id: 'sec-1',
                title: 'Test Section',
                content: 'This is a test section for validation.',
                exercises: []
              }
            ],
            metadata: {
              topic: requestData.topic || 'Test Topic',
              gradeBand: requestData.gradeBand || 'elementary',
              domain: requestData.domain || 'mathematics',
              generatedAt: new Date().toISOString(),
              generationTime: 500,
              pipelineState: 'completed'
            }
          },
          duration: 500,
          timestamp: new Date().toISOString()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockResponse, null, 2));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
      }
    });
  } else {
    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3005;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 Network access: http://0.0.0.0:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   GET  /api/generate-workbook - Status check`);
  console.log(`   POST /api/generate-workbook - Generate workbook`);
  console.log(`\n✅ Ready for testing!`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is in use. Try killing Node processes and restart.`);
  }
});