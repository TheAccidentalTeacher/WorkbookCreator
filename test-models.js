const { GoogleAuth } = require('google-auth-library');

async function testDifferentModelsAndLocations() {
  console.log('🔍 Testing Different Gemini Models and Locations...\n');

  const projectId = 'general-api-useage';
  const credentialsPath = './google-credentials.json';
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    keyFile: credentialsPath,
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  // Test different combinations
  const testCases = [
    { location: 'us-central1', model: 'gemini-1.5-flash' },
    { location: 'us-central1', model: 'gemini-1.5-pro' },
    { location: 'us-central1', model: 'gemini-1.0-pro' },
    { location: 'us-east4', model: 'gemini-1.5-flash' },
    { location: 'us-west4', model: 'gemini-1.5-flash' },
    { location: 'europe-west4', model: 'gemini-1.5-flash' },
    { location: 'asia-northeast1', model: 'gemini-1.5-flash' },
  ];

  for (const testCase of testCases) {
    const endpoint = `https://${testCase.location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${testCase.location}/publishers/google/models/${testCase.model}:generateContent`;
    
    console.log(`Testing: ${testCase.model} in ${testCase.location}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        })
      });

      if (response.ok) {
        console.log(`   ✅ SUCCESS! Model found and accessible`);
        const result = await response.json();
        console.log(`   Response: ${result.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response'}`);
        return testCase; // Return the working configuration
      } else {
        const errorText = await response.text();
        const errorObj = JSON.parse(errorText);
        console.log(`   ❌ Status: ${response.status} - ${errorObj.error?.status || errorObj.error?.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return null;
}

testDifferentModelsAndLocations()
  .then(result => {
    if (result) {
      console.log(`\n🎉 Found working configuration: ${result.model} in ${result.location}`);
    } else {
      console.log('\n❌ No working model/location combination found.');
    }
  })
  .catch(console.error);