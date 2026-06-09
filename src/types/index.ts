//! Este es el objeto que se almacena por cada cliente
export interface WebSocketData {
  clientId: string;
  userName?: string;
}

//! Este es el objeto que recibe el servidor
export interface WebSocketMessage {
  type: MessageType;
  payload?: unknown;
}

export type MessageType = "JOIN_CHAT" | "CHAT_MESSAGE" | "TYPING" | "STOP_TYPING" | "DELETE_MESSAGE";

//! Este es el objeto que se envía al cliente
export interface WebSocketResponse {
  type: ResponseType;
  payload: unknown;
}

export type ResponseType = "ERROR" | "CHAT_MESSAGE" | "USER_LIST" | "TYPING" | "STOP_TYPING" | "DELETE_MESSAGE";

