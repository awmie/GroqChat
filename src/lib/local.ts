import { BrowserAI } from "@browserai/browserai";
import type { ChatHistory } from "../types/chat";

let browserAI: BrowserAI | null = null;
let useCOT: boolean = false;
let modelLoaded: boolean = false;
let modelLoading: boolean = false;

export const LOCAL_MODELS = [
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
] as const;

export function isLocalMode(): boolean {
  return true;
}

export function isModelLoaded(): boolean {
  return modelLoaded;
}

export function isLoading(): boolean {
  return modelLoading;
}

export async function loadModel(modelId: string): Promise<void> {
  if (modelLoading) {
    throw new Error("Model is already loading");
  }
  
  modelLoading = true;
  
  try {
    browserAI = new BrowserAI();
    await browserAI.loadModel(modelId);
    modelLoaded = true;
  } catch (error) {
    modelLoaded = false;
    throw error;
  } finally {
    modelLoading = false;
  }
}

export function setModel(_modelId: string): void {
  // Model selection handled by loadModel
}

export function toggleCOT(enabled: boolean): void {
  useCOT = enabled;
}

export async function getChatCompletion(message: string, context: ChatHistory = []): Promise<string> {
  if (!browserAI || !modelLoaded) {
    throw new Error("Please load a model first");
  }

  try {
    const systemMessage = useCOT 
      ? "You are a helpful assistant. Please think step by step and explain your reasoning."
      : "You are a helpful assistant.";

    const conversationHistory = context.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await browserAI.generateText(
      message,
      {
        systemPrompt: systemMessage,
        history: conversationHistory,
        temperature: 0.7,
        maxTokens: 1024
      }
    );

    return String(response);
  } catch (error) {
    console.error("Error getting local completion:", error);
    throw error;
  }
}

export async function checkWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as any).gpu;
    if (!gpu) return false;
    
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function unloadModel(): void {
  if (browserAI && modelLoaded) {
    modelLoaded = false;
  }
}
