export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
  timestamp?: number; // Make timestamp optional to maintain compatibility
}

export type ChatHistory = ChatMessage[];


