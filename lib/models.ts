export const PROVIDERS = ['google', 'openrouter', 'openai', 'groq'] as const;
export type Provider = (typeof PROVIDERS)[number];

export const AI_MODELS = [
  'GPT-4',
  'GPT-4 Mini',
  'Gemini 2.0 Flash',
  'Gemini 2.5 Pro',
  'Llama Guard',
  'Llama 3.3 70B',
  'Kimi k2'
] as const;

export type AIModel = (typeof AI_MODELS)[number];

export type ModelConfig = {
  modelId: string;
  provider: Provider;
  headerKey: string;
};

export const MODEL_CONFIGS = {
  'GPT-4': {
    modelId: 'gpt-4o',
    provider: 'openai',
    headerKey: 'X-OpenAI-API-Key',
  },
  'GPT-4 Mini': {
    modelId: 'gpt-4o-mini',
    provider: 'openai',
    headerKey: 'X-OpenAI-API-Key',
  },
  'Gemini 2.0 Flash': {
    modelId: 'gemini-2.0-flash',
    provider: 'google',
    headerKey: 'X-Google-API-Key',
  },
  'Gemini 2.5 Pro': {
    modelId: 'gemini-2.5-pro',
    provider: 'google',
    headerKey: 'X-Google-API-Key',
  },
  'Llama Guard': {
    modelId: 'llama-guard-3-8b',
    provider: 'groq',
    headerKey: 'X-Groq-API-Key',
  },
  'Llama 3.3 70B': {
    modelId: 'llama-3.3-70b-versatile',
    provider: 'groq',
    headerKey: 'X-Groq-API-Key',
  },
  'Kimi k2': {
    modelId: 'moonshotai/kimi-k2-instruct',
    provider: 'groq',
    headerKey: 'X-Groq-API-Key',
  },
} as const satisfies Record<AIModel, ModelConfig>;

export const getModelConfig = (modelName: AIModel): ModelConfig => {
  return MODEL_CONFIGS[modelName];
};
