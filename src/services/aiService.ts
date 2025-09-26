import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ModelResponse, ModelConfig } from '@/types';
import { debugSystem } from '../utils/debugSystem';
import { VertexAIService, VertexAIRequest, ContentGenerationResult } from './integration/VertexAIService';

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
  },
  'dall-e-3': {
    name: 'dall-e-3',
    endpoint: 'https://api.openai.com/v1/images/generations',
    apiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 60000
  }
};

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private vertexAI?: VertexAIService;

  constructor() {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasVertexAI = !!process.env.GOOGLE_VERTEX_AI_PROJECT_ID;

    debugSystem.info('AI Service', 'Initializing AI Service', {
      hasOpenAIKey,
      hasAnthropicKey,
      hasVertexAI,
      availableModels: Object.keys(modelConfigs),
      timestamp: new Date().toISOString()
    });

    // Initialize services only if credentials are available
    if (hasOpenAIKey) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    if (hasAnthropicKey) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    if (hasVertexAI) {
      this.vertexAI = new VertexAIService();
    }

    debugSystem.info('AI Service', 'AI Service initialized successfully', {
      openaiConfigured: !!this.openai,
      anthropicConfigured: !!this.anthropic,
      vertexAIConfigured: !!this.vertexAI
    });

    // If no services are available, throw an error
    if (!this.openai && !this.anthropic && !this.vertexAI) {
      throw new Error('No AI services configured. Please set up at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_VERTEX_AI_PROJECT_ID');
    }
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
    // Check if we're in mock mode
    if (process.env.USE_MOCK_AI_RESPONSES === 'true') {
      debugSystem.info('AI Service', 'Using mock AI response (no API calls)', { model });
      
      // Generate a realistic mock response based on the prompt
      const mockContent = this.generateMockResponse(prompt);
      
      return {
        content: mockContent,
        model,
        tokenUsage: {
          input: Math.floor(prompt.length / 4),
          output: Math.floor(mockContent.length / 4),
          total: Math.floor((prompt.length + mockContent.length) / 4)
        },
        finishReason: 'stop'
      };
    }

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
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }
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
      if (!this.anthropic) {
        throw new Error('Anthropic client not initialized');
      }
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

  private generateMockResponse(prompt: string): string {
    // Generate realistic mock responses based on prompt content
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('learning objective')) {
      return JSON.stringify({
        objectives: [
          "Students will be able to add and subtract fractions with like denominators.",
          "Students will understand the concept of equivalent fractions.",
          "Students will apply fraction knowledge to solve real-world problems."
        ]
      });
    }
    
    if (promptLower.includes('content')) {
      return `# Introduction to Fractions

Fractions represent parts of a whole. In this lesson, we'll explore:

## Key Concepts
- Numerator: the top number
- Denominator: the bottom number
- Equivalent fractions

## Examples
- 1/2 = 2/4 = 3/6
- 3/4 + 1/4 = 4/4 = 1`;
    }
    
    if (promptLower.includes('exercise') || promptLower.includes('problem')) {
      return JSON.stringify({
        exercises: [
          {
            type: "multiple-choice",
            question: "What is 1/4 + 1/4?",
            options: ["1/8", "2/4", "1/2", "2/8"],
            correct: 1,
            explanation: "When adding fractions with the same denominator, add the numerators: 1 + 1 = 2, so 1/4 + 1/4 = 2/4 = 1/2"
          }
        ]
      });
    }
    
    // Default mock response
    return "This is a mock AI response for testing purposes. The actual content would depend on the specific prompt provided.";
  }

  /**
   * Generate an image using DALL-E
   */
  async generateImage(
    prompt: string,
    options: {
      size?: '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
    } = {}
  ): Promise<{
    url: string;
    revised_prompt?: string;
  }> {
    const perfLabel = 'ai.generateImage';
    debugSystem.startPerformance(perfLabel);
    debugSystem.info('AI Service', 'Starting image generation', {
      promptLength: prompt.length,
      options,
      timestamp: new Date().toISOString()
    });

    // Check if we're in mock mode
    if (process.env.USE_MOCK_AI_RESPONSES === 'true') {
      debugSystem.info('AI Service', 'Using mock image response (no API calls)');
      return {
        url: 'https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=Mock+Image+Generated',
        revised_prompt: prompt
      };
    }

    if (!this.openai) {
      throw new Error('OpenAI client not initialized - missing API key');
    }

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: this.optimizeImagePrompt(prompt),
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        n: 1
      });

      debugSystem.endPerformance(perfLabel);
      
      if (!response.data || response.data.length === 0) {
        throw new Error('No image generated');
      }

      const result = {
        url: response.data[0].url || '',
        revised_prompt: response.data[0].revised_prompt
      };

      debugSystem.info('AI Service', 'Image generation completed', {
        success: true,
        imageUrl: result.url,
        revisedPrompt: result.revised_prompt
      });

      return result;

    } catch (error) {
      debugSystem.endPerformance(perfLabel);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugSystem.error('AI Service', 'Image generation failed', { error: errorMessage }, error instanceof Error ? error : undefined);
      throw new Error(`Image generation failed: ${errorMessage}`);
    }
  }

  /**
   * Optimize image prompts for K-2 educational content
   */
  private optimizeImagePrompt(prompt: string): string {
    // Enhance prompts for child-friendly, educational visuals
    const k2Enhancements = [
      'cartoon style',
      'bright colors',
      'simple shapes',
      'child-friendly',
      'educational',
      'large clear details',
      'no text in image',
      'colorful and engaging'
    ];

    // Check if prompt already includes style instructions
    const hasStyleInstructions = k2Enhancements.some(enhancement => 
      prompt.toLowerCase().includes(enhancement.toLowerCase())
    );

    if (!hasStyleInstructions) {
      return `${prompt}, cartoon style, bright colors, child-friendly, educational, simple clear design`;
    }

    return prompt;
  }

  /**
   * Generate multiple images for a workbook section
   */
  async generateSectionImages(
    sectionTitle: string,
    visualDescriptions: string[],
    gradeBand: string
  ): Promise<Array<{ description: string; url: string; revised_prompt?: string }>> {
    debugSystem.info('AI Service', 'Generating section images', {
      sectionTitle,
      imageCount: visualDescriptions.length,
      gradeBand
    });

    const images = [];

    for (let i = 0; i < visualDescriptions.length; i++) {
      const description = visualDescriptions[i];
      
      try {
        // Create age-appropriate prompt
        const agePrompt = this.createAgeAppropriateImagePrompt(description, gradeBand);
        
        debugSystem.info('AI Service', `Generating image ${i + 1}/${visualDescriptions.length}`, {
          originalDescription: description,
          optimizedPrompt: agePrompt
        });

        const image = await this.generateImage(agePrompt, {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        });

        images.push({
          description,
          url: image.url,
          revised_prompt: image.revised_prompt
        });

        // Add small delay to avoid rate limiting
        if (i < visualDescriptions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        debugSystem.error('AI Service', `Failed to generate image ${i + 1}`, {
          description,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Add placeholder for failed image
        images.push({
          description,
          url: 'https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=Image+Generation+Failed',
          revised_prompt: description
        });
      }
    }

    debugSystem.info('AI Service', 'Section image generation completed', {
      totalImages: images.length,
      successfulImages: images.filter(img => !img.url.includes('placeholder')).length
    });

    return images;
  }

  /**
   * Create age-appropriate image prompts
   */
  private createAgeAppropriateImagePrompt(description: string, gradeBand: string): string {
    const baseEnhancements = [
      'high-quality digital art',
      'vibrant colors',
      'clean simple design',
      'educational illustration'
    ];

    let ageSpecificEnhancements: string[] = [];

    switch (gradeBand) {
      case 'k-2':
        ageSpecificEnhancements = [
          'cartoon style for young children',
          'very bright cheerful colors',
          'large simple shapes',
          'friendly characters with big expressive eyes',
          'no scary or complex elements',
          'playful and fun atmosphere'
        ];
        break;
      case '3-5':
        ageSpecificEnhancements = [
          'colorful illustration style',
          'clear detailed graphics',
          'engaging characters',
          'educational and informative'
        ];
        break;
      default:
        ageSpecificEnhancements = [
          'professional educational illustration',
          'clear informative graphics',
          'appropriate detail level'
        ];
    }

    const allEnhancements = [...baseEnhancements, ...ageSpecificEnhancements];
    
    return `${description}, ${allEnhancements.join(', ')}, no text or words in the image`;
  }
}