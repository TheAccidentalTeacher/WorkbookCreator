const { GoogleAuth } = require('google-auth-library');

async function testAlternativeGeminiAccess() {
  console.log('🔍 Testing Alternative Gemini Access Methods...\n');

  const projectId = 'general-api-useage';
  const credentialsPath = './google-credentials.json';
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    keyFile: credentialsPath,
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  // Test alternatives based on documentation warning
  const testCases = [
    // Older Gemini models that might still be available
    {
      name: 'Gemini Pro (legacy)',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/general-api-useage/locations/us-central1/publishers/google/models/gemini-pro:generateContent'
    },
    {
      name: 'Text Bison (original)',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/general-api-useage/locations/us-central1/publishers/google/models/text-bison:predict'
    },
    {
      name: 'Text Bison 001',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/general-api-useage/locations/us-central1/publishers/google/models/text-bison-001:predict'
    },
    {
      name: 'Text Bison 32k',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/general-api-useage/locations/us-central1/publishers/google/models/text-bison-32k:predict'
    },
    // Try different API versions
    {
      name: 'Gemini 1.5 Flash (v1beta1)',
      endpoint: 'https://us-central1-aiplatform.googleapis.com/v1beta1/projects/general-api-useage/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      let requestBody;
      
      if (testCase.endpoint.includes(':generateContent')) {
        // Gemini format
        requestBody = {
          contents: [{
            parts: [{
              text: 'Hello, please respond with "Test successful!"'
            }]
          }]
        };
      } else {
        // Text Bison format  
        requestBody = {
          instances: [{
            prompt: 'Hello, please respond with "Test successful!"'
          }],
          parameters: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        };
      }
      
      const response = await fetch(testCase.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('   ✅ SUCCESS! This model is accessible');
        
        // Extract response text based on format
        let responseText = 'No text found';
        if (result.candidates && result.candidates[0] && result.candidates[0].content) {
          // Gemini format
          responseText = result.candidates[0].content.parts[0].text;
        } else if (result.predictions && result.predictions[0]) {
          // Text Bison format
          responseText = result.predictions[0].content || result.predictions[0].text || 'No content field';
        }
        
        console.log(`   Response: ${responseText}`);
        return { testCase, result }; // Return working configuration
        
      } else {
        const errorText = await response.text();
        try {
          const errorObj = JSON.parse(errorText);
          console.log(`   ❌ ${errorObj.error?.code || response.status}: ${errorObj.error?.status || errorObj.error?.message}`);
        } catch {
          console.log(`   ❌ ${response.status}: ${errorText.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return null;
}

testAlternativeGeminiAccess()
  .then(result => {
    if (result) {
      console.log(`\n🎉 Found working model: ${result.testCase.name}`);
      console.log(`Endpoint: ${result.testCase.endpoint}`);
    } else {
      console.log('\n❌ No working model found. The project may need:');
      console.log('   1. Vertex AI API to be properly enabled');
      console.log('   2. Access to Gemini models (may require allowlisting)');
      console.log('   3. Different service account permissions');
      console.log('   4. Usage of text-bison models instead of Gemini');
    }
  })
  .catch(console.error);