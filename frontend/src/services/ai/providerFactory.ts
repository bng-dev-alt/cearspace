import { AiProvider } from './types';
import { geminiProvider } from './geminiProvider';

/**
 * Factory for resolving the active LLM provider.
 * Allows easy extension to other providers (OpenAI, Anthropic, OpenRouter, Local, etc.) in the future.
 */
export const providerFactory = {
  getProvider(): AiProvider {
    const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    switch (providerName) {
      case 'gemini':
      case 'google':
        return geminiProvider;
      
      // Future providers can be added here easily:
      // case 'openai':
      //   return openAiProvider;
      // case 'anthropic':
      //   return anthropicProvider;
      // case 'openrouter':
      //   return openRouterProvider;

      default:
        // Default to Google Gemini for production stability
        return geminiProvider;
    }
  },
};
