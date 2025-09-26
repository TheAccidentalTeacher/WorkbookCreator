const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function testSimpleVertexAI() {
    console.log('🔍 Testing Simple Vertex AI Models...\n');

    try {
        // Initialize auth
        const auth = new GoogleAuth({
            keyFile: './google-credentials.json',
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const authClient = await auth.getClient();
        const token = await authClient.getAccessToken();
        
        console.log('✅ Authentication successful');
        console.log(`Token length: ${token.token.length} characters\n`);

        const projectId = 'general-api-useage';
        const models = [
            'text-bison',
            'text-bison@001',
            'text-bison@002',
            'text-bison-32k'
        ];

        const locations = ['us-central1', 'us-east4'];

        for (const location of locations) {
            console.log(`\n📍 Testing location: ${location}`);
            
            for (const model of models) {
                try {
                    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
                    
                    const response = await axios.post(endpoint, {
                        instances: [{
                            prompt: "What is 2+2?"
                        }],
                        parameters: {
                            temperature: 0.2,
                            maxOutputTokens: 100,
                            topK: 40,
                            topP: 0.95
                        }
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token.token}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    });

                    console.log(`   ✅ ${model}: Working! Response: ${JSON.stringify(response.data.predictions?.[0], null, 2)}`);
                    return { success: true, model, location, endpoint };
                    
                } catch (error) {
                    const status = error.response?.status || 'Unknown';
                    const statusText = error.response?.statusText || error.message;
                    console.log(`   ❌ ${model}: ${status} - ${statusText}`);
                }
            }
        }

        console.log('\n❌ No working model found.');
        return { success: false };

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testSimpleVertexAI().then(result => {
    console.log('\n🏁 Simple Vertex AI test complete!');
    if (result.success) {
        console.log(`✅ Found working configuration: ${result.model} in ${result.location}`);
    }
});