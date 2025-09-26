/**
 * Base API Service Class
 * Provides common functionality for all third-party API integrations
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

interface APIError {
  response?: {
    status: number;
    statusText: string;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message: string;
}

export interface RateLimiter {
  checkLimit(): Promise<void>;
  incrementCounter(): void;
}

export interface RequestOptions extends AxiosRequestConfig {
  retryCount?: number;
  maxRetries?: number;
}

export abstract class BaseAPIService {
  protected apiKey: string;
  protected baseURL: string;
  protected client: AxiosInstance;
  protected rateLimiter?: RateLimiter;
  protected serviceName: string;

  constructor(apiKey: string, baseURL: string, serviceName: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.serviceName = serviceName;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PedagogicalWorkbookGenerator/1.0'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }
        
        console.log(`[${this.serviceName}] Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`[${this.serviceName}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[${this.serviceName}] Response received:`, response.status);
        return response;
      },
      (error) => {
        this.handleAPIError(error);
        return Promise.reject(error);
      }
    );
  }

  protected async makeRequest<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { retryCount = 0, maxRetries = 3, ...axiosOptions } = options;

    // Check rate limits if available
    if (this.rateLimiter) {
      await this.rateLimiter.checkLimit();
    }

    try {
      const response = await this.client.request({
        url: endpoint,
        ...axiosOptions
      });

      if (this.rateLimiter) {
        this.rateLimiter.incrementCounter();
      }

      return response.data;
    } catch (error: unknown) {
      const apiError = error as APIError;
      
      // Retry logic for temporary failures
      if (retryCount < maxRetries && this.shouldRetry(apiError)) {
        console.log(`[${this.serviceName}] Retrying request (${retryCount + 1}/${maxRetries})`);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        
        return this.makeRequest<T>(endpoint, {
          ...options,
          retryCount: retryCount + 1,
          maxRetries
        });
      }

      throw error;
    }
  }

  private shouldRetry(error: APIError): boolean {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected handleAPIError(error: APIError): void {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      console.error(`[${this.serviceName}] API Error ${status}:`, message);
      
      switch (status) {
        case 401:
          throw new Error(`${this.serviceName}: Invalid API key or authentication failed`);
        case 403:
          throw new Error(`${this.serviceName}: Access forbidden - check permissions`);
        case 429:
          throw new Error(`${this.serviceName}: Rate limit exceeded - please try again later`);
        case 500:
          throw new Error(`${this.serviceName}: Server error - please try again later`);
        default:
          throw new Error(`${this.serviceName}: ${message}`);
      }
    } else if (error.request) {
      console.error(`[${this.serviceName}] Network error:`, error.request);
      throw new Error(`${this.serviceName}: Network error - check your connection`);
    } else {
      console.error(`[${this.serviceName}] Unexpected error:`, error.message);
      throw new Error(`${this.serviceName}: ${error.message}`);
    }
  }

  // Abstract methods to be implemented by concrete services
  abstract isConfigured(): boolean;
  abstract validateConfiguration(): Promise<boolean>;
}

/**
 * Simple rate limiter implementation
 */
export class SimpleRateLimiter implements RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  incrementCounter(): void {
    this.requests.push(Date.now());
  }
}