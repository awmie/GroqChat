import Groq from "groq-sdk";
import type { ChatHistory } from "../types/chat";
import { config, type GroqModel } from "../config";

let groqClient: Groq | null = null;
let selectedModel: GroqModel = config.DEFAULT_MODEL;
let useCOT: boolean = false;
let hasEmbeddedKey = false;

const embeddedApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (embeddedApiKey) {
  hasEmbeddedKey = true;
  groqClient = new Groq({
    apiKey: embeddedApiKey,
    dangerouslyAllowBrowser: true
  });
}

export function isEmbeddedMode(): boolean {
  return hasEmbeddedKey;
}

export function updateApiKey(newApiKey: string) {
  groqClient = new Groq({
    apiKey: newApiKey,
    dangerouslyAllowBrowser: true
  });
  hasEmbeddedKey = false;
}

export function setModel(model: GroqModel) {
  selectedModel = model;
}

export function toggleCOT(enabled: boolean) {
  useCOT = enabled;
}

export async function getChatCompletion(message: string, context: ChatHistory = []) {
  if (!groqClient) {
    throw new Error("Please set your Groq API key first");
  }

  try {
    const systemMessage = useCOT ? config.SYSTEM_MESSAGES.cot : config.SYSTEM_MESSAGES.default;
    
    const messages = [
      { role: "system" as const, content: systemMessage || "You are a helpful assistant." },
      ...context.map(msg => ({ 
        role: msg.role as "user" | "assistant", 
        content: msg.content || "" 
      })),
      { role: "user" as const, content: message }
    ];

    const chatCompletion = await groqClient.chat.completions.create({
      messages,
      model: selectedModel,
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}


