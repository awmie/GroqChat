export interface LocalModelInfo {
    id: string;
    displayName: string;
    size: string;
    description: string;
}

export const AVAILABLE_LOCAL_MODELS: LocalModelInfo[] = [
    {
        id: "Phi-3.5-mini-instruct-q4f32_1-MLC",
        displayName: "Phi 3.5 Mini",
        size: "~700MB",
        description: "⚡ Fastest, great quality"
    },
    {
        id: "Qwen2-0.5B-Instruct-q4f32_1-MLC",
        displayName: "Qwen 2 0.5B",
        size: "~500MB",
        description: "⚡ Super small, fastest"
    },
    {
        id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
        displayName: "Llama 3.2 1B",
        size: "~1GB",
        description: "Best quality"
    },
    {
        id: "gemma-2b-it-q4f32_1-mlc",
        displayName: "Gemma 2B",
        size: "~800MB",
        description: "Good balance"
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
