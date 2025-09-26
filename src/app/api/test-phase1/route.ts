/**
 * Phase 1 Setup Test API Route
 * Tests the integration setup
 */

import { NextResponse } from 'next/server';
import { Phase1SetupTest } from '../../../tests/Phase1SetupTest';

export async function GET() {
  try {
    console.log('[API] Running Phase 1 setup test...');
    
    const testResults = await Phase1SetupTest.runAllTests();
    
    return NextResponse.json({
      success: testResults.success,
      message: testResults.success ? 'Phase 1 setup completed successfully!' : 'Phase 1 setup has issues',
      results: testResults.results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Phase 1 test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Phase 1 test failed to run',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}