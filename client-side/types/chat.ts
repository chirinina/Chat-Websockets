export interface ChatMessage {
  id?: string;
  name: string;
  text: string;
  timestamp: number;
  to?: string;
  replyTo?: {
    id: string;
    name: string;
    text: string;
  };
  isDeleted?: boolean;
}

export interface MessageEntry {
  id: string;
  message: ChatMessage;
  isSystem: boolean;
  isOwn: boolean;
  color?: string;
}

export type WebSocketMessageType =
  | "JOIN_CHAT"
  | "CHAT_MESSAGE"
  | "USER_LIST"
  | "ERROR"
  | "TYPING"
  | "STOP_TYPING"
  | "DELETE_MESSAGE";

export interface WebSocketResponse {
  type: WebSocketMessageType;
  payload:
    | ChatMessage
    | string[]
    | { error: string }
    | { name: string; to?: string }
    | { id: string };
}

