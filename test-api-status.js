const { GoogleAuth } = require('google-auth-library');

async function checkVertexAIAPIStatus() {
  console.log('🔍 Checking Vertex AI API Status...\n');

  const projectId = 'general-api-useage';
  const credentialsPath = './google-credentials.json';
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    keyFile: credentialsPath,
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  
  // 1. Test basic Vertex AI API accessibility
  console.log('1. Testing basic Vertex AI API access...');
  const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('   ✅ Vertex AI API is accessible');
    } else {
      const errorText = await response.text();
      console.log('   ❌ Vertex AI API access failed');
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  // 2. Test Service Usage API to check if Vertex AI API is enabled
  console.log('\n2. Checking if Vertex AI API is enabled via Service Usage API...');
  const serviceUsageUrl = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/aiplatform.googleapis.com`;
  
  try {
    const response = await fetch(serviceUsageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   Service state: ${result.state}`);
      if (result.state === 'ENABLED') {
        console.log('   ✅ Vertex AI API is enabled');
      } else {
        console.log('   ❌ Vertex AI API is not enabled');
        console.log('   💡 You need to enable the Vertex AI API for this project');
      }
    } else {
      const errorText = await response.text();
      console.log('   ❌ Could not check API status');
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  // 3. List available models (if API is accessible)
  console.log('\n3. Attempting to list available models...');
  const modelsUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models`;
  
  try {
    const response = await fetch(modelsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Available models:');
      if (result.models && result.models.length > 0) {
        result.models.forEach(model => {
          console.log(`     - ${model.name || model.displayName || model.id}`);
        });
      } else {
        console.log('     No models found or different response structure');
        console.log('     Response:', JSON.stringify(result, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('   ❌ Could not list models');
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  console.log('\n🏁 API status check complete!');
}

checkVertexAIAPIStatus().catch(console.error);