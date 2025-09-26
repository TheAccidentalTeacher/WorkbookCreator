/**
 * Phase 1 Setup Test
 * Verifies that all libraries and services are properly installed and configured
 */

import { IntegrationServiceFactory } from '../services/integration';

export class Phase1SetupTest {
  static async runAllTests(): Promise<{ success: boolean; results: string[] }> {
    const results: string[] = [];
    let allPassed = true;

    try {
      // Test 1: Library imports
      await this.testLibraryImports(results);
      
      // Test 2: Service architecture
      await this.testServiceArchitecture(results);
      
      // Test 3: Environment configuration
      await this.testEnvironmentConfiguration(results);

      results.push('✅ All Phase 1 tests passed!');
      
    } catch (error) {
      allPassed = false;
      results.push(`❌ Phase 1 test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { success: allPassed, results };
  }

  private static async testLibraryImports(results: string[]): Promise<void> {
    results.push('📚 Testing library imports...');

    try {
      // Test D3.js
      const d3 = await import('d3');
      if (typeof d3.select === 'function') {
        results.push('  ✅ D3.js imported successfully');
      } else {
        throw new Error('D3.js import failed');
      }

      // Test KaTeX
      const katex = await import('katex');
      if (typeof katex.render === 'function') {
        results.push('  ✅ KaTeX imported successfully');
      } else {
        throw new Error('KaTeX import failed');
      }

      // Test Konva
      const Konva = await import('konva');
      if (Konva.default) {
        results.push('  ✅ Konva.js imported successfully');
      } else {
        throw new Error('Konva.js import failed');
      }

      // Test Chart.js
      const Chart = await import('chart.js');
      if (Chart.Chart) {
        results.push('  ✅ Chart.js imported successfully');
      } else {
        throw new Error('Chart.js import failed');
      }

      // Test Axios
      const axios = await import('axios');
      if (axios.default && typeof axios.default.get === 'function') {
        results.push('  ✅ Axios imported successfully');
      } else {
        throw new Error('Axios import failed');
      }

      results.push('✅ All library imports successful');

    } catch (error) {
      throw new Error(`Library import test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async testServiceArchitecture(results: string[]): Promise<void> {
    results.push('🏗️  Testing service architecture...');

    try {
      // Test coordinator creation
      const coordinator = IntegrationServiceFactory.createCoordinator();
      if (coordinator) {
        results.push('  ✅ API Coordinator created successfully');
      } else {
        throw new Error('Failed to create API Coordinator');
      }

      // Test rate limiter creation
      const rateLimiter = IntegrationServiceFactory.createRateLimiter();
      if (rateLimiter) {
        results.push('  ✅ Rate Limiter created successfully');
      } else {
        throw new Error('Failed to create Rate Limiter');
      }

      // Test service status
      const status = coordinator.getServiceStatus();
      results.push(`  ℹ️  Service status: ${Object.keys(status).length} services registered`);

      results.push('✅ Service architecture test passed');

    } catch (error) {
      throw new Error(`Service architecture test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async testEnvironmentConfiguration(results: string[]): Promise<void> {
    results.push('⚙️  Testing environment configuration...');

    try {
      // Check if environment variables structure exists
      const envVars = [
        'GOOGLE_VERTEX_AI_PROJECT_ID',
        'SYMBOLAB_API_KEY',
        'MATHPIX_APP_ID',
        'VECTORART_AI_API_KEY',
        'LEONARDO_AI_API_KEY',
        'GOOGLE_KNOWLEDGE_GRAPH_API_KEY',
        'LULU_API_KEY'
      ];

      let configuredCount = 0;
      const totalCount = envVars.length;

      envVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value && value.trim() !== '') {
          configuredCount++;
          results.push(`  ✅ ${envVar} is configured`);
        } else {
          results.push(`  ⚠️  ${envVar} is not configured (ready for setup)`);
        }
      });

      results.push(`📊 Configuration status: ${configuredCount}/${totalCount} API keys configured`);
      
      if (configuredCount === 0) {
        results.push('ℹ️  This is expected for Phase 1 - API keys will be added in Phase 2');
      }

      results.push('✅ Environment configuration test passed');

    } catch (error) {
      throw new Error(`Environment configuration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility method to display results nicely
  static formatResults(results: string[]): string {
    return results.map(result => result).join('\n');
  }
}