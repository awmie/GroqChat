import Groq from "groq-sdk";
import type { ChatHistory } from "../types/chat";
import { systemPrompts } from "./prompts";

let groqClient: Groq | null = null;

export function updateApiKey(newApiKey: string) {
  groqClient = new Groq({
    apiKey: newApiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function getChatCompletion(message: string, context: ChatHistory = []) {
  if (!groqClient) {
    throw new Error("Please set your Groq API key first");
  }

  try {
    const systemMessage = systemPrompts.thinkingProcess || "Think step by step";
    const messages = [
      { role: "system", content: systemMessage },
      ...context.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    const chatCompletion = await groqClient.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}