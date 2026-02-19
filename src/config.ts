export interface LocalModelInfo {
    id: string;
    displayName: string;
    size: string;
    description: string;
}

export const AVAILABLE_LOCAL_MODELS: LocalModelInfo[] = [
    {
        id: "qwen2.5-0.5b-instruct",
        displayName: "Qwen 2.5 0.5B",
        size: "~500MB",
        description: "Smallest, fastest, works on most devices"
    },
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

export type LocalModel = (typeof AVAILABLE_LOCAL_MODELS)[number]["id"];

export const DEFAULT_PARAMETERS = {
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 4096
};

export const config = {
    COT_PROMPT: import.meta.env.VITE_COT_PROMPT,
    SYSTEM_MESSAGES: {
        default: "You are a helpful assistant.",
        cot: import.meta.env.VITE_COT_PROMPT
    }
};
