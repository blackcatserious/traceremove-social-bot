import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Mistral from '@mistralai/mistralai';
import Groq from 'groq-sdk';

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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '' || apiKey.includes('place')) {
      throw new Error('OpenAI API key not configured properly. Please set OPENAI_API_KEY environment variable.');
    }
    clients.openai = new OpenAI({ apiKey });
  }
  return clients.openai;
}

export function getAnthropicClient(): Anthropic {
  if (!clients.anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '' || apiKey.includes('place')) {
      throw new Error('Anthropic API key not configured properly. Please set ANTHROPIC_API_KEY environment variable.');
    }
    clients.anthropic = new Anthropic({ apiKey });
  }
  return clients.anthropic;
}

export function getGoogleClient(): GoogleGenerativeAI {
  if (!clients.google) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '' || apiKey.includes('place')) {
      throw new Error('Google API key not configured properly. Please set GOOGLE_API_KEY environment variable.');
    }
    clients.google = new GoogleGenerativeAI(apiKey);
  }
  return clients.google;
}

export function getMistralClient(): Mistral {
  if (!clients.mistral) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '' || apiKey.includes('place')) {
      throw new Error('Mistral API key not configured properly. Please set MISTRAL_API_KEY environment variable.');
    }
    clients.mistral = new Mistral(apiKey);
  }
  return clients.mistral;
}

export function getGroqClient(): Groq {
  if (!clients.groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey === '' || apiKey.includes('place')) {
      throw new Error('Groq API key not configured properly. Please set GROQ_API_KEY environment variable.');
    }
    clients.groq = new Groq({ apiKey });
  }
  return clients.groq;
}

export function pickModel(options: {
  intent: 'qa' | 'long' | 'code' | 'analysis';
  length: number;
  persona?: string;
}): ModelConfig {
  const { intent, length, persona } = options;
  
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

export async function generateResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: ModelConfig
): Promise<ModelResponse> {
  const { provider, model, temperature = 0.7, maxTokens = 1000 } = config;
  
  try {
    switch (provider) {
      case 'openai': {
        const client = getOpenAIClient();
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
  } catch (error) {
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
