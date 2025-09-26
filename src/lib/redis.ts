import Redis from 'ioredis';

// Create Redis client instance
const createRedisClient = () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not provided, Redis features will be disabled');
    return null;
  }

  try {
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
};

export const redis = createRedisClient();

// Redis utility functions
export class RedisService {
  static async set(key: string, value: string | object, ttl?: number): Promise<boolean> {
    if (!redis) return false;
    
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  static async get<T = string>(key: string, parseJson = false): Promise<T | null> {
    if (!redis) return null;
    
    try {
      const value = await redis.get(key);
      if (!value) return null;
      
      return parseJson ? JSON.parse(value) as T : value as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  static async del(key: string): Promise<boolean> {
    if (!redis) return false;
    
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  static async checkConnection(): Promise<boolean> {
    if (!redis) return false;
    
    try {
      const pong = await redis.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis connection check failed:', error);
      return false;
    }
  }

  // Job queue helpers
  static async pushJob(queue: string, job: object): Promise<boolean> {
    if (!redis) return false;
    
    try {
      await redis.lpush(queue, JSON.stringify(job));
      return true;
    } catch (error) {
      console.error('Redis job push error:', error);
      return false;
    }
  }

  static async popJob<T = object>(queue: string): Promise<T | null> {
    if (!redis) return null;
    
    try {
      const job = await redis.rpop(queue);
      return job ? JSON.parse(job) as T : null;
    } catch (error) {
      console.error('Redis job pop error:', error);
      return null;
    }
  }

  // Cache helpers with automatic JSON handling
  static async cachePromptResponse(promptHash: string, response: object, ttl = 3600): Promise<void> {
    await this.set(`prompt:${promptHash}`, response, ttl);
  }

  static async getCachedPromptResponse<T = object>(promptHash: string): Promise<T | null> {
    return await this.get<T>(`prompt:${promptHash}`, true);
  }
}

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
  }
}