import { SERVER_CONFIG } from "./config/server-config";

import { generateUuid } from "./utils/generate-uuid";
import type {
  WebSocketData,
  WebSocketMessage,
  WebSocketResponse,
} from "./types";
import {
  messageSchema,
  type MessageParsed,
} from "./schemas/websocket-message.schema";

type ChatSocket = WebSocket & {
  data: { clientId: string; userName?: string };
};

const connectedClients = new Set<ChatSocket>();

const getUserNames = () =>
  [...connectedClients].map((ws) => ws.data.userName ?? "Anónimo");

const broadcast = (message: WebSocketResponse, exclude?: ChatSocket) => {
  const responseString = JSON.stringify(message);

  for (const client of connectedClients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(responseString);
    }
  }
};

const parseIncomingMessage = (
  message: string,
):
  | { success: true; data: MessageParsed }
  | { success: false; error: string } => {
  try {
    const jsonData: WebSocketMessage = JSON.parse(message);
    const parsedResult = messageSchema.safeParse(jsonData);

    if (!parsedResult.success) {
      const errors = parsedResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: `Validation error ${errors}` };
    }

    return { success: true, data: parsedResult.data };
  } catch {
    return { success: false, error: "Invalid JSON" };
  }
};

export const createServer = () => {
  const server = Bun.serve<WebSocketData>({
    port: SERVER_CONFIG.port,

    fetch(req, server) {
      // Allow CORS for WebSocket upgrade from Next.js frontend
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Upgrade, Connection",
      };

      // Handle preflight
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const clientId = generateUuid();
      const upgraded = server.upgrade(req, {
        data: { clientId },
        headers: corsHeaders,
      });

      if (upgraded) {
        return undefined;
      }

      return new Response(
        "ChiriJson WebSocket Server — conecta desde el frontend Next.js",
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        },
      );
    },
    websocket: {
      open(ws) {
        connectedClients.add(ws as ChatSocket);
      },
      message(ws, message: string) {
        const client = ws as ChatSocket;
        const parsed = parseIncomingMessage(message);

        if (!parsed.success) {
          client.send(
            JSON.stringify({
              type: "ERROR",
              payload: { error: parsed.error },
            }),
          );
          return;
        }

        const { type, payload } = parsed.data;

        if (type === "JOIN_CHAT") {
          const name =
            (payload?.name ?? "").toString().trim() ||
            `Invitado-${client.data.clientId.slice(0, 6)}`;
          client.data.userName = name;

          broadcast({ type: "USER_LIST", payload: getUserNames() });
          broadcast({
            type: "CHAT_MESSAGE",
            payload: {
              name: "Sistema",
              text: `${name} se unió al chat`,
              timestamp: Date.now(),
            },
          });
          return;
        }

        if (type === "CHAT_MESSAGE") {
          const text = (payload?.text ?? "").toString().trim();

          if (!text) {
            client.send(
              JSON.stringify({
                type: "ERROR",
                payload: { error: "El mensaje no puede estar vacío" },
              }),
            );
            return;
          }

          const name =
            client.data.userName ??
            `Invitado-${client.data.clientId.slice(0, 6)}`;
          broadcast({
            type: "CHAT_MESSAGE",
            payload: {
              id: generateUuid(),
              name,
              text,
              timestamp: Date.now(),
              to: payload?.to,
              replyTo: payload?.replyTo,
            },
          });
          return;
        }

        if (type === "TYPING" || type === "STOP_TYPING") {
          const name =
            client.data.userName ??
            `Invitado-${client.data.clientId.slice(0, 6)}`;
          broadcast(
            {
              type,
              payload: {
                name,
                to: payload?.to,
              },
            },
            client,
          );
          return;
        }

        if (type === "DELETE_MESSAGE") {
          broadcast({
            type: "DELETE_MESSAGE",
            payload: { id: payload?.id },
          });
          return;
        }

        client.send(
          JSON.stringify({
            type: "ERROR",
            payload: { error: `Unknown message type: ${type}` },
          }),
        );
      },
      close(ws) {
        const client = ws as ChatSocket;
        connectedClients.delete(client);

        if (client.data.userName) {
          broadcast({
            type: "CHAT_MESSAGE",
            payload: {
              name: "Sistema",
              text: `${client.data.userName} se desconectó`,
              timestamp: Date.now(),
            },
          });
          broadcast({ type: "USER_LIST", payload: getUserNames() });
        }
      },
    },
  });

  return server;
};
