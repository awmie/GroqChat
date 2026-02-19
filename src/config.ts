interface ModelInfo {
    id: string;
    provider: string;
    contextWindow: number;
    displayName: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: "gemma2-9b-it",
        provider: "Google",
        contextWindow: 8192,
        displayName: "Gemma 9B"
    },
    {
        id: "llama-3.3-70b-versatile",
        provider: "Meta",
        contextWindow: 32768,
        displayName: "Llama 3.3 70B"
    },
    {
        id: "llama-3.1-8b-instant",
        provider: "Meta",
        contextWindow: 8192,
        displayName: "Llama 3.1 8B"
    },
    // {
    //     id: "llama-guard-3-8b",
    //     provider: "Meta",
    //     contextWindow: 8192,
    //     displayName: "Llama Guard 3 8B"
    // },
    {
        id: "deepseek-r1-distill-llama-70b",
        provider: "DeepSeek",
        contextWindow: 32768,
        displayName: "DeepSeek-R1"
    },
    {
        id: "llama3-70b-8192",
        provider: "Meta",
        contextWindow: 8192,
        displayName: "Llama 3 70B"
    },
    {
        id: "llama3-8b-8192",
        provider: "Meta",
        contextWindow: 8192,
        displayName: "Llama 3 8B"
    },
    {
        id: "mixtral-8x7b-32768",
        provider: "Mistral",
        contextWindow: 32768,
        displayName: "Mixtral 8x7B"
    }
] as const;

export type Provider = 'groq' | 'local';

export interface LocalModelInfo {
    id: string;
    displayName: string;
    size: string;
    description: string;
}

export const AVAILABLE_LOCAL_MODELS: LocalModelInfo[] = [
    {
        id: "llama-3.2-1b-instruct",
        displayName: "Llama 3.2 1B",
        size: "~1GB",
        description: "Fast, works on most devices"
    },
    {
        id: "qwen2.5-1.5b-instruct",
        displayName: "Qwen 2.5 1.5B",
        size: "~1.5GB",
        description: "Good quality, balanced"
    },
    {
        id: "smollm-3b-instruct",
        displayName: "SmolLM 3B",
        size: "~3GB",
        description: "Best quality, needs powerful GPU"
    }
];

export type GroqModel = (typeof AVAILABLE_MODELS)[number]["id"];

export type LocalModel = (typeof AVAILABLE_LOCAL_MODELS)[number]["id"];

export const DEFAULT_PARAMETERS = {
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 4096
};

export const config = {
    COT_PROMPT: import.meta.env.VITE_COT_PROMPT,
    DEFAULT_MODEL: "llama-3.3-70b-versatile" as GroqModel,
    SYSTEM_MESSAGES: {
        default: "You are a helpful assistant.",
        cot: import.meta.env.VITE_COT_PROMPT
    }
};
