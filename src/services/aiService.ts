import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ModelResponse, ModelConfig } from '@/types';
import { debugSystem } from '../utils/debugSystem';

// AI Model configurations
const modelConfigs: Record<string, ModelConfig> = {
  'gpt-4': {
    name: 'gpt-4',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: 3000,
    temperature: 0.7,
    timeout: 30000
  },
  'claude-3-sonnet': {
    name: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000
  }
};

export class AIService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    debugSystem.info('AI Service', 'Initializing AI Service', {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      availableModels: Object.keys(modelConfigs),
      timestamp: new Date().toISOString()
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    debugSystem.info('AI Service', 'AI Service initialized successfully', {
      openaiConfigured: !!this.openai,
      anthropicConfigured: !!this.anthropic
    });
  }

  /**
   * Generate completion using specified model
   */
  async generateCompletion(
    prompt: string,
    model: string = 'gpt-4',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    } = {}
  ): Promise<ModelResponse> {
    const perfLabel = `ai.generateCompletion.${model}`;
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('AI Service', `Starting completion generation with ${model}`, {
      promptLength: prompt.length,
      model,
      options,
      timestamp: new Date().toISOString()
    });

    const config = modelConfigs[model];
    if (!config) {
      const error = new Error(`Model ${model} not supported`);
      debugSystem.error('AI Service', 'Model not supported', { model, availableModels: Object.keys(modelConfigs) });
      throw error;
    }

    try {
      let result: ModelResponse;
      
      if (model.startsWith('gpt')) {
        debugSystem.info('AI Service', 'Using OpenAI completion', { model });
        result = await this.generateOpenAICompletion(prompt, model, options);
      } else if (model.startsWith('claude')) {
        debugSystem.info('AI Service', 'Using Anthropic completion', { model });
        result = await this.generateAnthropicCompletion(prompt, model, options);
      } else {
        const error = new Error(`Model ${model} not implemented`);
        debugSystem.error('AI Service', 'Model not implemented', { model });
        throw error;
      }

      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.info('AI Service', `Completion generated successfully with ${model}`, {
        contentLength: result.content.length,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        model: result.model,
        finishReason: result.finishReason
      });

      return result;
    } catch (error) {
      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.error('AI Service', `Error generating completion with ${model}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        model,
        promptLength: prompt.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      console.error(`Error generating completion with ${model}:`, error);
      throw error;
    }
  }

  private async generateOpenAICompletion(
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    }
  ): Promise<ModelResponse> {
    const perfLabel = `ai.openai.${model}`;
    debugSystem.startPerformance(perfLabel);
    debugSystem.debug('AI Service', 'Preparing OpenAI request', {
      model,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4000,
      hasSystemMessage: !!options.systemMessage,
      promptLength: prompt.length
    });

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    
    if (options.systemMessage) {
      messages.push({ role: 'system', content: options.systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
      });

      const completion = response.choices[0];
      if (!completion?.message?.content) {
        const error = new Error('No completion generated');
        debugSystem.error('AI Service', 'OpenAI returned empty completion', { model, response });
        throw error;
      }

      const result: ModelResponse = {
        content: completion.message.content,
        tokenUsage: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        cost: this.calculateOpenAICost(model, response.usage?.total_tokens || 0),
        model,
        finishReason: completion.finish_reason || 'unknown'
      };

      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.debug('AI Service', 'OpenAI completion successful', {
        model,
        contentLength: result.content.length,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        finishReason: result.finishReason
      });

      return result;
    } catch (error) {
      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.error('AI Service', 'OpenAI completion failed', {
        model,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  private async generateAnthropicCompletion(
    prompt: string,
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    }
  ): Promise<ModelResponse> {
    const perfLabel = `ai.anthropic.${model}`;
    debugSystem.startPerformance(perfLabel);
    debugSystem.debug('AI Service', 'Preparing Anthropic request', {
      model,
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4000,
      hasSystemMessage: !!options.systemMessage,
      promptLength: prompt.length
    });

    try {
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        system: options.systemMessage || '',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const textContent = response.content.find((c: { type: string; text?: string }) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        const error = new Error('No text completion generated');
        debugSystem.error('AI Service', 'Anthropic returned no text content', { model, response });
        throw error;
      }

      const result: ModelResponse = {
        content: textContent.text,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        cost: this.calculateAnthropicCost(model, response.usage.input_tokens, response.usage.output_tokens),
        model,
        finishReason: response.stop_reason || 'unknown'
      };

      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.debug('AI Service', 'Anthropic completion successful', {
        model,
        contentLength: result.content.length,
        tokenUsage: result.tokenUsage,
        cost: result.cost,
        finishReason: result.finishReason
      });

      return result;
    } catch (error) {
      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.error('AI Service', 'Anthropic completion failed', {
        model,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  private calculateOpenAICost(model: string, totalTokens: number): number {
    // Simplified cost calculation - update with current pricing
    const costPer1000Tokens = model === 'gpt-4' ? 0.03 : 0.002;
    const cost = (totalTokens / 1000) * costPer1000Tokens;
    
    debugSystem.debug('AI Service', 'Calculated OpenAI cost', {
      model,
      totalTokens,
      costPer1000Tokens,
      totalCost: cost
    });
    
    return cost;
  }

  private calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number {
    // Simplified cost calculation - update with current pricing
    const inputCostPer1000 = 0.003;
    const outputCostPer1000 = 0.015;
    const totalCost = (inputTokens / 1000) * inputCostPer1000 + (outputTokens / 1000) * outputCostPer1000;
    
    debugSystem.debug('AI Service', 'Calculated Anthropic cost', {
      model,
      inputTokens,
      outputTokens,
      inputCostPer1000,
      outputCostPer1000,
      totalCost
    });
    
    return totalCost;
  }

  /**
   * Generate multiple completions and select the best one
   */
  async generateWithFallback(
    prompt: string,
    primaryModel: string = 'gpt-4',
    fallbackModel: string = 'gpt-3.5-turbo',
    options: {
      temperature?: number;
      maxTokens?: number;
      systemMessage?: string;
    } = {}
  ): Promise<ModelResponse> {
    debugSystem.info('AI Service', 'Starting generation with fallback', {
      primaryModel,
      fallbackModel,
      promptLength: prompt.length,
      options
    });

    try {
      const result = await this.generateCompletion(prompt, primaryModel, options);
      debugSystem.info('AI Service', `Primary model ${primaryModel} succeeded`, {
        model: result.model,
        contentLength: result.content.length,
        cost: result.cost
      });
      return result;
    } catch (error) {
      debugSystem.warn('AI Service', `Primary model ${primaryModel} failed, trying fallback ${fallbackModel}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        primaryModel,
        fallbackModel
      });
      console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}:`, error);
      
      try {
        const result = await this.generateCompletion(prompt, fallbackModel, options);
        debugSystem.info('AI Service', `Fallback model ${fallbackModel} succeeded`, {
          model: result.model,
          contentLength: result.content.length,
          cost: result.cost
        });
        return result;
      } catch (fallbackError) {
        debugSystem.error('AI Service', `Both primary and fallback models failed`, {
          primaryModel,
          fallbackModel,
          primaryError: error instanceof Error ? error.message : 'Unknown error',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        });
        throw fallbackError;
      }
    }
  }

  /**
   * Batch process multiple prompts
   */
  async batchGenerate(
    prompts: Array<{
      prompt: string;
      model?: string;
      options?: {
        temperature?: number;
        maxTokens?: number;
        systemMessage?: string;
      };
    }>
  ): Promise<ModelResponse[]> {
    const perfLabel = 'ai.batchGenerate';
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('AI Service', 'Starting batch generation', {
      batchSize: prompts.length,
      models: prompts.map(p => p.model || 'gpt-4'),
      totalPromptLength: prompts.reduce((sum, p) => sum + p.prompt.length, 0)
    });

    try {
      const promises = prompts.map(({ prompt, model = 'gpt-4', options = {} }, index) => {
        debugSystem.debug('AI Service', `Processing batch item ${index + 1}/${prompts.length}`, {
          model,
          promptLength: prompt.length,
          batchIndex: index
        });
        return this.generateCompletion(prompt, model, options);
      });

      const results = await Promise.all(promises);
      
      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.info('AI Service', 'Batch generation completed', {
        batchSize: results.length,
        totalCost: results.reduce((sum, r) => sum + (r.cost || 0), 0),
        totalTokens: results.reduce((sum, r) => sum + r.tokenUsage.total, 0),
        models: results.map(r => r.model)
      });

      return results;
    } catch (error) {
      debugSystem.endPerformance(perfLabel, 'AI Service');
      debugSystem.error('AI Service', 'Batch generation failed', {
        batchSize: prompts.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}