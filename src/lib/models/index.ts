import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Mistral from '@mistralai/mistralai';
import Groq from 'groq-sdk';
import { getEnvironmentConfig, shouldMockExternalApis } from '../env-validation';
import { ExternalServiceError, withRetry } from '../error-handling';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelResponse {
  content: string;
  provider: ModelProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

let clients: {
  openai?: OpenAI;
  anthropic?: Anthropic;
  google?: GoogleGenerativeAI;
  mistral?: Mistral;
  groq?: Groq;
} = {};

export function getOpenAIClient(): OpenAI {
  if (!clients.openai) {
    const config = getEnvironmentConfig();
    if (!config?.openai?.apiKey || config.openai.apiKey.trim() === '') {
      throw new ExternalServiceError('OpenAI', 'API key not configured properly. Please set OPENAI_API_KEY environment variable.');
    }
    
    clients.openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return clients.openai;
}

export function getAnthropicClient(): Anthropic {
  if (!clients.anthropic) {
    if (shouldMockExternalApis()) {
      console.log('Using mock Anthropic client for development');
      clients.anthropic = {} as Anthropic;
      return clients.anthropic;
    }

    const config = getEnvironmentConfig();
    if (!config?.multiModel.anthropic) {
      throw new ExternalServiceError('Anthropic', 'API key not configured properly. Please set ANTHROPIC_API_KEY environment variable.');
    }
    clients.anthropic = new Anthropic({ apiKey: config.multiModel.anthropic });
  }
  return clients.anthropic;
}

export function getGoogleClient(): GoogleGenerativeAI {
  if (!clients.google) {
    if (shouldMockExternalApis()) {
      console.log('Using mock Google client for development');
      clients.google = {} as GoogleGenerativeAI;
      return clients.google;
    }

    const config = getEnvironmentConfig();
    if (!config?.multiModel.google) {
      throw new ExternalServiceError('Google', 'API key not configured properly. Please set GOOGLE_API_KEY environment variable.');
    }
    clients.google = new GoogleGenerativeAI(config.multiModel.google);
  }
  return clients.google;
}

export function getMistralClient(): Mistral {
  if (!clients.mistral) {
    if (shouldMockExternalApis()) {
      console.log('Using mock Mistral client for development');
      clients.mistral = {} as Mistral;
      return clients.mistral;
    }

    const config = getEnvironmentConfig();
    if (!config?.multiModel.mistral) {
      throw new ExternalServiceError('Mistral', 'API key not configured properly. Please set MISTRAL_API_KEY environment variable.');
    }
    clients.mistral = new Mistral(config.multiModel.mistral);
  }
  return clients.mistral;
}

export function getGroqClient(): Groq {
  if (!clients.groq) {
    if (shouldMockExternalApis()) {
      console.log('Using mock Groq client for development');
      clients.groq = {} as Groq;
      return clients.groq;
    }

    const config = getEnvironmentConfig();
    if (!config?.multiModel.groq) {
      throw new ExternalServiceError('Groq', 'API key not configured properly. Please set GROQ_API_KEY environment variable.');
    }
    clients.groq = new Groq({ apiKey: config.multiModel.groq });
  }
  return clients.groq;
}

interface ModelPerformanceMetrics {
  provider: ModelProvider;
  model: string;
  avgResponseTime: number;
  errorRate: number;
  costPerToken: number;
  successRate: number;
  lastUpdated: Date;
}

let modelMetrics: Map<string, ModelPerformanceMetrics> = new Map();

export function updateModelMetrics(provider: ModelProvider, model: string, responseTime: number, success: boolean, tokens: number, cost: number) {
  const key = `${provider}-${model}`;
  const existing = modelMetrics.get(key);
  
  if (existing) {
    const totalRequests = existing.successRate > 0 ? Math.round(1 / (1 - existing.successRate)) : 1;
    const newTotalRequests = totalRequests + 1;
    
    existing.avgResponseTime = (existing.avgResponseTime * totalRequests + responseTime) / newTotalRequests;
    existing.errorRate = success ? 
      (existing.errorRate * totalRequests) / newTotalRequests :
      (existing.errorRate * totalRequests + 1) / newTotalRequests;
    existing.costPerToken = tokens > 0 ? (existing.costPerToken + cost / tokens) / 2 : existing.costPerToken;
    existing.successRate = (existing.successRate * totalRequests + (success ? 1 : 0)) / newTotalRequests;
    existing.lastUpdated = new Date();
  } else {
    modelMetrics.set(key, {
      provider,
      model,
      avgResponseTime: responseTime,
      errorRate: success ? 0 : 1,
      costPerToken: tokens > 0 ? cost / tokens : 0,
      successRate: success ? 1 : 0,
      lastUpdated: new Date()
    });
  }
}

export function pickModel(options: {
  intent: 'qa' | 'long' | 'code' | 'analysis';
  length: number;
  persona?: string;
  prioritize?: 'speed' | 'cost' | 'quality';
}): ModelConfig {
  const { intent, length, persona, prioritize = 'quality' } = options;
  
  const candidates = getModelCandidates(intent, length, persona);
  
  if (prioritize === 'speed') {
    return selectFastestModel(candidates);
  } else if (prioritize === 'cost') {
    return selectCheapestModel(candidates);
  } else {
    return selectBestQualityModel(candidates, intent, length, persona);
  }
}

function getModelCandidates(intent: string, length: number, persona?: string): ModelConfig[] {
  const candidates: ModelConfig[] = [];
  
  if (intent === 'code' && length < 2000) {
    candidates.push(
      { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.1 },
      { provider: 'groq', model: 'llama-3.1-8b-instant', temperature: 0.1 }
    );
  } else if (intent === 'long' || length > 4000) {
    candidates.push(
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', temperature: 0.7 },
      { provider: 'openai', model: 'gpt-4o', temperature: 0.7 }
    );
  } else if (intent === 'analysis' && (persona === 'philosopher' || persona === 'comprehensive-ai')) {
    candidates.push(
      { provider: 'openai', model: 'gpt-4o', temperature: 0.6 },
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', temperature: 0.6 }
    );
  } else if (persona === 'comprehensive-ai' && intent === 'qa') {
    candidates.push(
      { provider: 'openai', model: 'gpt-4o', temperature: 0.7 },
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', temperature: 0.7 }
    );
  } else if (intent === 'qa' && length < 1000) {
    candidates.push(
      { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 },
      { provider: 'groq', model: 'llama-3.1-8b-instant', temperature: 0.7 },
      { provider: 'google', model: 'gemini-pro', temperature: 0.7 }
    );
  }
  
  if (candidates.length === 0) {
    candidates.push({ provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 });
  }
  
  return candidates;
}

function selectFastestModel(candidates: ModelConfig[]): ModelConfig {
  let fastest = candidates[0];
  let bestTime = Infinity;
  
  for (const candidate of candidates) {
    const key = `${candidate.provider}-${candidate.model}`;
    const metrics = modelMetrics.get(key);
    
    if (metrics && metrics.avgResponseTime < bestTime && metrics.successRate > 0.9) {
      fastest = candidate;
      bestTime = metrics.avgResponseTime;
    }
  }
  
  return fastest;
}

function selectCheapestModel(candidates: ModelConfig[]): ModelConfig {
  let cheapest = candidates[0];
  let bestCost = Infinity;
  
  for (const candidate of candidates) {
    const key = `${candidate.provider}-${candidate.model}`;
    const metrics = modelMetrics.get(key);
    
    if (metrics && metrics.costPerToken < bestCost && metrics.successRate > 0.9) {
      cheapest = candidate;
      bestCost = metrics.costPerToken;
    }
  }
  
  return cheapest;
}

function selectBestQualityModel(candidates: ModelConfig[], intent: string, length: number, persona?: string): ModelConfig {
  if (intent === 'code' && length < 2000) {
    return { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.1 };
  }
  
  if (intent === 'long' || length > 4000) {
    return { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', temperature: 0.7 };
  }
  
  if (intent === 'analysis' && (persona === 'philosopher' || persona === 'comprehensive-ai')) {
    return { provider: 'openai', model: 'gpt-4o', temperature: 0.6 };
  }
  
  if (persona === 'comprehensive-ai' && intent === 'qa') {
    return { provider: 'openai', model: 'gpt-4o', temperature: 0.7 };
  }
  
  if (intent === 'qa' && length < 1000) {
    return { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 };
  }
  
  return { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7 };
}

export function getModelRecommendations(): {
  fastest: ModelConfig[];
  cheapest: ModelConfig[];
  mostReliable: ModelConfig[];
  recommendations: string[];
} {
  const allMetrics = Array.from(modelMetrics.values());
  
  const fastest = allMetrics
    .filter(m => m.successRate > 0.9)
    .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
    .slice(0, 3)
    .map(m => ({ provider: m.provider, model: m.model, temperature: 0.7 }));
  
  const cheapest = allMetrics
    .filter(m => m.successRate > 0.9 && m.costPerToken > 0)
    .sort((a, b) => a.costPerToken - b.costPerToken)
    .slice(0, 3)
    .map(m => ({ provider: m.provider, model: m.model, temperature: 0.7 }));
  
  const mostReliable = allMetrics
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 3)
    .map(m => ({ provider: m.provider, model: m.model, temperature: 0.7 }));
  
  const recommendations = [];
  
  const avgErrorRate = allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length;
  if (avgErrorRate > 0.05) {
    recommendations.push('Consider implementing more robust error handling - average error rate is above 5%');
  }
  
  const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / allMetrics.length;
  if (avgResponseTime > 2000) {
    recommendations.push('Response times are elevated - consider load balancing or model optimization');
  }
  
  const costVariance = Math.max(...allMetrics.map(m => m.costPerToken)) - Math.min(...allMetrics.map(m => m.costPerToken));
  if (costVariance > 0.001) {
    recommendations.push('Significant cost variance between models - review routing strategy for cost optimization');
  }
  
  return { fastest, cheapest, mostReliable, recommendations };
}

export async function generateResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: ModelConfig
): Promise<ModelResponse> {
  const { provider, model, temperature = 0.7, maxTokens = 1000 } = config;
  const startTime = Date.now();
  
  if (shouldMockExternalApis()) {
    console.log(`Mock response for ${provider} ${model}`);
    return {
      content: `Mock response from ${provider} ${model} for: ${messages[messages.length - 1]?.content?.substring(0, 50)}...`,
      provider,
      model,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
    };
  }
  
  try {
    const result = await withRetry(async () => {
      switch (provider) {
        case 'openai': {
          const client = getOpenAIClient();
          
          if (Object.keys(client).length === 0) {
            console.log('Using mock OpenAI response for test environment');
            return {
              content: `This is a comprehensive AI response about: ${messages[messages.length - 1]?.content?.substring(0, 100)}. I can help with detailed analysis, creative solutions, and technical implementation across various domains.`,
              provider,
              model,
              usage: { promptTokens: 150, completionTokens: 75, totalTokens: 225 }
            };
          }
          
          const response = await client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          });
          
          return {
            content: response.choices[0]?.message?.content || '',
            provider,
            model,
            usage: response.usage ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            } : undefined,
          };
        }
        
        case 'anthropic': {
          const client = getAnthropicClient();
          const systemMessage = messages.find(m => m.role === 'system');
          const userMessages = messages.filter(m => m.role !== 'system');
          
          const response = await client.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            system: systemMessage?.content,
            messages: userMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          });
          
          const content = response.content[0];
          return {
            content: content.type === 'text' ? content.text : '',
            provider,
            model,
            usage: response.usage ? {
              promptTokens: response.usage.input_tokens,
              completionTokens: response.usage.output_tokens,
              totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            } : undefined,
          };
        }
        
        case 'google': {
          const client = getGoogleClient();
          const genModel = client.getGenerativeModel({ model });
          
          const systemMessage = messages.find(m => m.role === 'system');
          const userMessages = messages.filter(m => m.role !== 'system');
          const prompt = [
            systemMessage?.content,
            ...userMessages.map(m => `${m.role}: ${m.content}`)
          ].filter(Boolean).join('\n\n');
          
          const response = await genModel.generateContent(prompt);
          const text = response.response.text();
          
          return {
            content: text,
            provider,
            model,
          };
        }
        
        case 'mistral': {
          const client = getMistralClient();
          const response = await client.chat({
            model,
            messages,
            temperature,
            maxTokens,
          });
          
          return {
            content: response.choices?.[0]?.message?.content || '',
            provider,
            model,
            usage: response.usage ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            } : undefined,
          };
        }
        
        case 'groq': {
          const client = getGroqClient();
          const response = await client.chat.completions.create({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          });
          
          return {
            content: response.choices[0]?.message?.content || '',
            provider,
            model,
            usage: response.usage ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            } : undefined,
          };
        }
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }, 2);
    
    const responseTime = Date.now() - startTime;
    const tokens = result.usage?.totalTokens || 0;
    const cost = calculateCost(provider, model, tokens);
    
    updateModelMetrics(provider, model, responseTime, true, tokens, cost);
    
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updateModelMetrics(provider, model, responseTime, false, 0, 0);
    
    console.error(`Error with ${provider} ${model}:`, error);
    
    if (provider !== 'openai') {
      console.log(`Falling back to OpenAI due to ${provider} error...`);
      try {
        return generateResponse(messages, { provider: 'openai', model: 'gpt-4o-mini', temperature });
      } catch (fallbackError) {
        console.error('Fallback to OpenAI also failed:', fallbackError);
        throw new Error(`Both ${provider} and OpenAI fallback failed. Please check API key configuration.`);
      }
    }
    
    throw error;
  }
}

function calculateCost(provider: ModelProvider, model: string, tokens: number): number {
  const costPerToken: Record<string, Record<string, number>> = {
    openai: {
      'gpt-4o': 0.00003,
      'gpt-4o-mini': 0.00000015,
      'gpt-4': 0.00003
    },
    anthropic: {
      'claude-3-5-sonnet-20241022': 0.000015,
      'claude-3-haiku-20240307': 0.00000025
    },
    google: {
      'gemini-pro': 0.0000005
    },
    mistral: {
      'mistral-large': 0.000008
    },
    groq: {
      'llama-3.1-8b-instant': 0.0000001
    }
  };
  
  return (costPerToken[provider]?.[model] || 0.000001) * tokens;
}
