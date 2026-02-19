import { MLCEngine, CreateMLCEngine, type InitProgressReport, type ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import type { ChatHistory } from "../types/chat";

let engine: MLCEngine | null = null;
let useCOT: boolean = false;
let modelLoaded: boolean = false;
let modelLoading: boolean = false;
let progressCallback: ((progress: string) => void) | null = null;

export const LOCAL_MODELS = [
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
] as const;

export function isModelLoaded(): boolean {
  return modelLoaded;
}

export function isLoading(): boolean {
  return modelLoading;
}

export async function loadModel(
  modelId: string,
  onProgress?: (progress: string) => void
): Promise<void> {
  if (modelLoading) {
    throw new Error("Model is already loading");
  }
  
  if (onProgress) {
    progressCallback = onProgress;
  }
  
  modelLoading = true;
  
  try {
    engine = await CreateMLCEngine(
      modelId,
      {
        initProgressCallback: (report: InitProgressReport) => {
          if (progressCallback) {
            progressCallback(report.text);
          }
        }
      }
    );
    modelLoaded = true;
  } catch (error) {
    modelLoaded = false;
    throw error;
  } finally {
    modelLoading = false;
    progressCallback = null;
  }
}

export function setModel(_modelId: string): void {
  // Model selection handled by loadModel
}

export function toggleCOT(enabled: boolean): void {
  useCOT = enabled;
}

export async function getChatCompletion(message: string, context: ChatHistory = []): Promise<string> {
  if (!engine || !modelLoaded) {
    throw new Error("Please load a model first");
  }

  try {
    const systemMessage = useCOT 
      ? "You are a helpful assistant. Please think step by step and explain your reasoning."
      : "You are a helpful assistant.";

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...context.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1024
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error getting completion:", error);
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
  if (engine && modelLoaded) {
    modelLoaded = false;
    engine = null;
  }
}
