// Test file to trigger workbook generation
import fetch from 'node-fetch';

async function testWorkbookGeneration() {
    try {
        console.log('🚀 Testing workbook generation...');
        
        const response = await fetch('http://localhost:3000/api/generate-workbook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topic: 'Test Debugging Topic',
                gradeBand: 'k-2',
                domain: 'mathematics',
                options: {
                    objectiveCount: 2,
                    sectionCount: 2,
                    includeExercises: true,
                    includeMisconceptions: false
                }
            })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response received:', data?.success ? 'SUCCESS' : 'FAILED');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testWorkbookGeneration();