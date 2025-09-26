import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/database';
import { RedisService } from '@/lib/redis';

export async function GET() {
  try {
    // Test database connection
    const dbConnected = await checkDatabaseConnection();
    
    // Test Redis connection
    const redisConnected = await RedisService.checkConnection();
    
    // Test Redis operations
    let redisOperational = false;
    if (redisConnected) {
      const testKey = 'test:connection';
      const testValue = { timestamp: new Date().toISOString() };
      
      const setSuccess = await RedisService.set(testKey, testValue, 60);
      const getValue = await RedisService.get(testKey, true);
      const delSuccess = await RedisService.del(testKey);
      
      redisOperational = setSuccess && !!getValue && delSuccess;
    }

    const status = {
      postgres: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'disconnected'
      },
      redis: {
        connected: redisConnected,
        operational: redisOperational,
        status: redisConnected 
          ? (redisOperational ? 'healthy' : 'connected-but-errors')
          : 'disconnected'
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        REDIS_URL: process.env.REDIS_URL ? 'configured' : 'missing'
      },
      overall: dbConnected && redisConnected && redisOperational ? 'healthy' : 'degraded'
    };

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      data: status,
      timestamp: new Date().toISOString()
    }, {
      status: status.overall === 'healthy' ? 200 : 503
    });

  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'DATABASE_TEST_FAILED',
        message: 'Failed to test database connections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}