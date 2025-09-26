// Test the new educational image search service

import { educationalImageSearchService } from './src/services/educationalImageSearchService.js';

async function testEducationalImageSearch() {
  console.log('🧪 Testing Educational Image Search Service...\n');

  try {
    // Test 1: Search for circulatory system images
    console.log('1. Testing circulatory system search...');
    const circulatoryResults = await educationalImageSearchService.searchEducationalImages({
      query: 'circulatory system heart',
      subject: 'science',
      gradeLevel: 'k-2',
      imageType: 'any',
      maxResults: 3
    });

    console.log(`   Found ${circulatoryResults.length} results:`);
    circulatoryResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.title} (${result.source}) - ${result.url.substring(0, 60)}...`);
    });

    // Test 2: Search for digestive system images  
    console.log('\n2. Testing digestive system search...');
    const digestiveResults = await educationalImageSearchService.searchEducationalImages({
      query: 'digestive system stomach',
      subject: 'science', 
      gradeLevel: 'k-2',
      imageType: 'any',
      maxResults: 3
    });

    console.log(`   Found ${digestiveResults.length} results:`);
    digestiveResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.title} (${result.source}) - ${result.url.substring(0, 60)}...`);
    });

    // Test 3: Download and convert one image
    if (circulatoryResults.length > 0) {
      console.log('\n3. Testing image download and conversion...');
      const testImage = circulatoryResults[0];
      console.log(`   Downloading: ${testImage.title}`);
      
      const imageData = await educationalImageSearchService.downloadAndConvertImage(
        testImage.url,
        testImage.description
      );
      
      console.log(`   ✅ Successfully converted to base64 (${imageData.base64Data.length} chars)`);
      console.log(`   📁 Local path: ${imageData.localPath}`);
    }

    console.log('\n✅ Educational Image Search Service is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEducationalImageSearch();