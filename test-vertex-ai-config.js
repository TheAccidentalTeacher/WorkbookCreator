const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

async function testVertexAIConfiguration() {
  console.log('🔍 Testing Vertex AI Configuration...\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  const projectId = process.env.GOOGLE_VERTEX_AI_PROJECT_ID || 'general-api-useage';
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Credentials Path: ${credentialsPath}`);

  // 2. Check credentials file
  console.log('\n2. Credentials File:');
  const fullPath = path.resolve(credentialsPath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ File exists: ${fullPath}`);
    try {
      const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      console.log(`   ✅ Valid JSON`);
      console.log(`   Service Account Email: ${credentials.client_email || 'N/A'}`);
      console.log(`   Project ID in credentials: ${credentials.project_id || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Invalid JSON: ${error.message}`);
      return;
    }
  } else {
    console.log(`   ❌ File not found: ${fullPath}`);
    return;
  }

  // 3. Test Google Auth
  console.log('\n3. Google Authentication:');
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFile: credentialsPath,
    });

    const client = await auth.getClient();
    console.log('   ✅ Auth client created successfully');
    
    const token = await client.getAccessToken();
    if (token.token) {
      console.log('   ✅ Access token obtained successfully');
      console.log(`   Token length: ${token.token.length} characters`);
    } else {
      console.log('   ❌ Failed to obtain access token');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Authentication error: ${error.message}`);
    return;
  }

  // 4. Test Vertex AI API endpoint
  console.log('\n4. Testing Vertex AI API Endpoint:');
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFile: credentialsPath,
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    const location = 'us-central1';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-flash:generateContent`;
    
    console.log(`   Testing endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, this is a test message. Please respond with "Hello, test successful!"'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100
        }
      })
    });

    console.log(`   Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ API call successful!');
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        console.log(`   Response: ${result.candidates[0].content.parts[0].text}`);
      } else {
        console.log('   Response structure:', JSON.stringify(result, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ API call failed:`);
      console.log(`   Error response: ${errorText}`);
      
      // Try to parse error details
      try {
        const errorObj = JSON.parse(errorText);
        if (errorObj.error) {
          console.log(`   Error code: ${errorObj.error.code}`);
          console.log(`   Error message: ${errorObj.error.message}`);
          console.log(`   Error status: ${errorObj.error.status}`);
        }
      } catch {
        // Error text is not JSON
      }
    }
  } catch (error) {
    console.log(`   ❌ API test error: ${error.message}`);
  }

  console.log('\n🏁 Configuration test complete!');
}

// Run the test
testVertexAIConfiguration().catch(console.error);