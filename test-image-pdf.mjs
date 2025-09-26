// Test script to verify image embedding in PDF generation
import { SimpleGenerationEngine } from './src/services/simpleGenerationEngine.js';
import { SimpleWorkbookPdfGenerator } from './src/services/simpleWorkbookPdfGenerator.js';

async function testImageEmbedding() {
    console.log('🧪 [TEST] Starting image embedding test...');
    
    try {
        // Create a simple engine
        const engine = new SimpleGenerationEngine();
        console.log('✅ [TEST] SimpleGenerationEngine created');
        
        // Generate a workbook with images
        const request = {
            topic: 'Solar System',
            subject: 'science',
            gradeLevel: '3-5',
            pageCount: 3,
            includeImages: true,
            fastMode: false
        };
        
        console.log('🚀 [TEST] Generating workbook with images...');
        const workbook = await engine.generateWorkbook(request);
        console.log('✅ [TEST] Workbook generated successfully');
        
        // Check if images were included
        const hasImages = workbook.sections.some(section => 
            section.images && section.images.length > 0
        );
        
        if (hasImages) {
            console.log('🎨 [TEST] Images found in workbook sections!');
            
            // Check for base64 data
            let hasBase64Data = false;
            workbook.sections.forEach((section, index) => {
                if (section.images) {
                    section.images.forEach((image, imgIndex) => {
                        if (image.base64Data) {
                            console.log(`📷 [TEST] Section ${index}, Image ${imgIndex}: Has base64 data (${image.base64Data.length} chars)`);
                            hasBase64Data = true;
                        } else {
                            console.log(`❌ [TEST] Section ${index}, Image ${imgIndex}: Missing base64 data`);
                        }
                    });
                }
            });
            
            if (hasBase64Data) {
                console.log('✅ [TEST] Base64 image data found - ready for PDF embedding!');
                
                // Test PDF generation
                console.log('📄 [TEST] Testing PDF generation...');
                const pdfBlob = await SimpleWorkbookPdfGenerator.generateSimpleWorkbookPdf(workbook);
                console.log(`✅ [TEST] PDF generated successfully! Size: ${pdfBlob.size} bytes`);
                
                if (pdfBlob.size > 50000) { // Large size suggests images are embedded
                    console.log('🎉 [TEST] PDF is large - likely contains embedded images!');
                } else {
                    console.log('⚠️  [TEST] PDF is small - images might not be embedded properly');
                }
                
            } else {
                console.log('❌ [TEST] No base64 data found - images not ready for PDF');
            }
        } else {
            console.log('❌ [TEST] No images found in workbook');
        }
        
    } catch (error) {
        console.error('❌ [TEST] Error during test:', error);
    }
}

// Run the test
testImageEmbedding().then(() => {
    console.log('🏁 [TEST] Test completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 [TEST] Test failed:', error);
    process.exit(1);
});