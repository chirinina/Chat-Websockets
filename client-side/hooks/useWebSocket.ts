"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  MessageEntry,
  WebSocketResponse,
  ChatMessage,
} from "@/types/chat";
import type { Toast } from "@/components/ToastBar";

const COLOR_PALETTE = [
  "#38bdf8", // sky
  "#f472b6", // pink
  "#34d399", // emerald
  "#a78bfa", // violet
  "#fb923c", // orange
  "#60a5fa", // blue
  "#2dd4bf", // teal
  "#e879f9", // fuchsia
];

const MOCK_USERS = [
  "Doris Brown",
  "Patrick Hendricks",
  "Albert Rodarte",
  "Emily Watson",
];

const MOCK_USERS_DATA: Record<string, string[]> = {
  "Doris Brown": [
    "¡Me encanta el nuevo diseño! Es mucho más limpio y profesional sin esos degradados. Los bordes rectos le dan un toque empresarial excelente.",
    "Diseñar con bordes delgados e interfaces limpias es el estándar moderno para software empresarial. ¡Excelente decisión!",
    "¡Hola! Estaba revisando la interfaz de usuario. Me parece que la densidad de información es perfecta ahora que los botones y campos de texto son más delgados.",
    "Sin degradados todo se ve mucho más limpio y corporativo. ¡Buen trabajo con la paleta de colores sólida!",
  ],
  "Patrick Hendricks": [
    "Excelente trabajo en la actualización del chat. ¿Ya implementaron la función de responder a mensajes específicos? Eso es clave para el flujo de trabajo.",
    "Los controles más delgados mejoran la densidad de información en la pantalla. Buen avance en el proyecto.",
    "Hola, ¿cómo van los entregables del día? El chat funciona excelente y la limpieza local de historial es muy fluida.",
    "Acabo de probar la funcionalidad de citas (reply). Funciona igual de rápido que en WhatsApp. ¡Buen trabajo!",
  ],
  "Albert Rodarte": [
    "Bun y WebSockets son la combinación perfecta para tiempo real. El rendimiento de este chat con animaciones sutiles es espectacular.",
    "¿Viste lo rápido que carga el servidor con Bun? Además, la persistencia en localStorage hace que no se pierdan los DMs.",
    "¡Hola! Estaba analizando la estructura del WebSocket. Muy bien implementado el debounce en el indicador de escritura.",
    "El código del frontend quedó muy limpio. Trabajar con componentes compactos es mucho mejor para el mantenimiento.",
  ],
  "Emily Watson": [
    "¡Hola! El chat se ve increíble. A nivel de marca y marketing, el diseño limpio y empresarial transmite mucha más confianza y seriedad.",
    "Me gusta mucho que podamos ver el perfil de cada integrante desde la barra lateral derecha. Es muy práctico.",
    "¡Excelente avance! ¿Podríamos usar este chat para la demo del cliente de mañana? Se ve muy real y pulido.",
    "El indicador de escritura 'typing...' le da el toque interactivo perfecto para que el usuario sienta la aplicación viva.",
  ],
};

let colorIndex = 0;
const userColorMap: Record<string, string> = {};

function getColorForUser(name: string): string {
  if (!userColorMap[name]) {
    userColorMap[name] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
  }
  return userColorMap[name];
}

function getWsUrl(): string {
  if (typeof window === "undefined") return "ws://localhost:3200";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.hostname}:3200`;
}

const generateDefaultMessages = (currentUserName: string): MessageEntry[] => {
  const baseTime = Date.now() - 3600000 * 2; // 2 hours ago
  const defaultEntries: MessageEntry[] = [];

  // Doris Brown
  defaultEntries.push(
    {
      id: "mock-d1",
      isSystem: false,
      message: {
        id: "mock-d1",
        name: "Doris Brown",
        text: "¡Hola! Estaba revisando la interfaz de usuario. Me parece que la densidad de información es perfecta ahora que los botones y campos de texto son más delgados.",
        timestamp: baseTime,
        to: currentUserName,
      },
      isOwn: false,
      color: "#f472b6",
    },
    {
      id: "mock-d2",
      isSystem: false,
      message: {
        id: "mock-d2",
        name: currentUserName,
        text: "¡Hola Doris! Sí, se ve mucho más limpia e integrada.",
        timestamp: baseTime + 60000,
        to: "Doris Brown",
      },
      isOwn: true,
      color: "#38bdf8",
    },
    {
      id: "mock-d3",
      isSystem: false,
      message: {
        id: "mock-d3",
        name: "Doris Brown",
        text: "Diseñar con bordes delgados e interfaces limpias es el estándar moderno para software empresarial. ¡Excelente decisión!",
        timestamp: baseTime + 120000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#f472b6",
    }
  );

  // Patrick Hendricks
  defaultEntries.push(
    {
      id: "mock-p1",
      isSystem: false,
      message: {
        id: "mock-p1",
        name: "Patrick Hendricks",
        text: "Hola, ¿cómo van los entregables del día? El chat funciona excelente y la limpieza local de historial es muy fluida.",
        timestamp: baseTime + 600000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#38bdf8",
    },
    {
      id: "mock-p2",
      isSystem: false,
      message: {
        id: "mock-p2",
        name: currentUserName,
        text: "Hola Patrick, todo va según el cronograma. Acabamos de subir los cambios del layout.",
        timestamp: baseTime + 600000 + 60000,
        to: "Patrick Hendricks",
      },
      isOwn: true,
      color: "#38bdf8",
    },
    {
      id: "mock-p3",
      isSystem: false,
      message: {
        id: "mock-p3",
        name: "Patrick Hendricks",
        text: "Acabo de probar la funcionalidad de citas (reply). Funciona igual de rápido que en WhatsApp. ¡Buen trabajo!",
        timestamp: baseTime + 600000 + 120000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#38bdf8",
    }
  );

  // Albert Rodarte
  defaultEntries.push(
    {
      id: "mock-a1",
      isSystem: false,
      message: {
        id: "mock-a1",
        name: "Albert Rodarte",
        text: "¡Hola! Estaba analizando la estructura del WebSocket. Muy bien implementado el debounce en el indicador de escritura.",
        timestamp: baseTime + 1200000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#a78bfa",
    },
    {
      id: "mock-a2",
      isSystem: false,
      message: {
        id: "mock-a2",
        name: currentUserName,
        text: "¡Gracias Albert! Sí, ayuda a evitar saturar el canal con eventos de tipeo.",
        timestamp: baseTime + 1200000 + 60000,
        to: "Albert Rodarte",
      },
      isOwn: true,
      color: "#38bdf8",
    },
    {
      id: "mock-a3",
      isSystem: false,
      message: {
        id: "mock-a3",
        name: "Albert Rodarte",
        text: "Bun y WebSockets son la combinación perfecta para tiempo real. El rendimiento de este chat con animaciones sutiles es espectacular.",
        timestamp: baseTime + 1200000 + 120000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#a78bfa",
    }
  );

  // Emily Watson
  defaultEntries.push(
    {
      id: "mock-e1",
      isSystem: false,
      message: {
        id: "mock-e1",
        name: "Emily Watson",
        text: "¡Hola! El chat se ve increíble. A nivel de marca y marketing, el diseño limpio y empresarial transmite mucha más confianza y seriedad.",
        timestamp: baseTime + 1800000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#34d399",
    },
    {
      id: "mock-e2",
      isSystem: false,
      message: {
        id: "mock-e2",
        name: currentUserName,
        text: "¡Qué bueno que te guste Emily! Estamos puliendo el diseño para que sea muy profesional.",
        timestamp: baseTime + 1800000 + 60000,
        to: "Emily Watson",
      },
      isOwn: true,
      color: "#38bdf8",
    },
    {
      id: "mock-e3",
      isSystem: false,
      message: {
        id: "mock-e3",
        name: "Emily Watson",
        text: "El indicador de escritura 'typing...' le da el toque interactivo perfecto para que el usuario sienta la aplicación viva.",
        timestamp: baseTime + 1800000 + 120000,
        to: currentUserName,
      },
      isOwn: false,
      color: "#34d399",
    }
  );

  return defaultEntries;
};

const loadStoredMessages = (currentUserName: string): MessageEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`chatHistory_${currentUserName}`);
    if (stored) {
      return JSON.parse(stored);
    }
    // If empty, generate and save defaults
    const defaults = generateDefaultMessages(currentUserName || "Invitado");
    saveMessages(currentUserName || "Invitado", defaults);
    return defaults;
  } catch {
    return [];
  }
};

const saveMessages = (userName: string, msgs: MessageEntry[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`chatHistory_${userName}`, JSON.stringify(msgs));
  } catch (e) {
    console.error("Error saving messages:", e);
  }
};

export function useChatWebSocket(
  addToast?: (text: string, icon?: Toast["icon"], ttl?: number, isSystem?: boolean) => void,
) {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [userName, setUserName] = useState<string>("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([]);

  const userNameRef = useRef<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef<boolean>(false);
  // Dedup join/disconnect toasts: key → last shown timestamp
  const sysEventTimestampRef = useRef<Record<string, number>>({});
  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  // Load messages on mount or when username changes
  useEffect(() => {
    if (userName) {
      const loaded = loadStoredMessages(userName);
      setMessages(loaded);
    }
  }, [userName]);

  const saveAndSetMessages = useCallback(
    (updater: (prev: MessageEntry[]) => MessageEntry[]) => {
      setMessages((prev) => {
        const next = updater(prev);
        if (userNameRef.current) {
          saveMessages(userNameRef.current, next);
        }
        return next;
      });
    },
    [],
  );

  const addMessage = useCallback(
    (msg: ChatMessage, isSystem: boolean) => {
      const currentUser = userNameRef.current;
      const entry: MessageEntry = {
        id: msg.id || `${Date.now()}-${Math.random()}`,
        message: msg,
        isSystem,
        isOwn: !isSystem && msg.name === currentUser,
        color: isSystem ? undefined : getColorForUser(msg.name),
      };
      saveAndSetMessages((prev) => {
        // Check for duplicates
        if (prev.some((m) => m.id === entry.id)) return prev;
        return [...prev, entry];
      });
    },
    [saveAndSetMessages],
  );

  const connect = useCallback(
    (name: string) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      setStatus("connecting");
      const ws = new WebSocket(getWsUrl());
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        ws.send(JSON.stringify({ type: "JOIN_CHAT", payload: { name } }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data as string);

          if (data.type === "CHAT_MESSAGE") {
            const payload = data.payload as ChatMessage;
            if (payload.name === "Sistema") {
              // Route join/disconnect events to toast with per-user deduplication (15s)
              const isJoin = payload.text.includes("unió");
              const isLeave = payload.text.includes("desconectó");
              // Extract the user name from the text ("X se unió..." or "X se desconectó")
              const eventType = isJoin ? "join" : isLeave ? "leave" : "info";
              // Build a key from the event type + user portion of the text
              const key = `${eventType}:${payload.text.split(" se ")[0]}`;
              const now = Date.now();
              const last = sysEventTimestampRef.current[key] ?? 0;
              if (now - last > 15000) {
                sysEventTimestampRef.current[key] = now;
                const icon: Toast["icon"] = isJoin ? "user" : isLeave ? "warn" : "info";
                addToastRef.current?.(payload.text, icon, 4000, true);
              }
              return; // Do NOT add to message list
            }
            addMessage(payload, false);
          }

          if (data.type === "USER_LIST") {
            setUsers(data.payload as string[]);
          }

          if (data.type === "DELETE_MESSAGE") {
            const payload = data.payload as { id: string };
            saveAndSetMessages((prev) =>
              prev.map((m) =>
                m.id === payload.id
                  ? { ...m, message: { ...m.message, isDeleted: true, text: "Mensaje eliminado" } }
                  : m
              )
            );
          }

          if (data.type === "TYPING") {
            const payload = data.payload as { name: string; to?: string };
            setTypingUsers((prev) => ({ ...prev, [payload.name]: true }));
          }

          if (data.type === "STOP_TYPING") {
            const payload = data.payload as { name: string; to?: string };
            setTypingUsers((prev) => ({ ...prev, [payload.name]: false }));
          }

          if (data.type === "ERROR") {
            const payload = data.payload as { error: string };
            addToastRef.current?.(payload.error, "warn");
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => setStatus("disconnected");
      ws.onerror = () => setStatus("error");
    },
    [addMessage],
  );

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const sendMessage = useCallback(
    (
      text: string,
      to?: string,
      replyTo?: { id: string; name: string; text: string },
    ) => {
      const currentUser = userNameRef.current;

      // Check if DMs to mock user
      if (to && MOCK_USERS.includes(to)) {
        const myMsg: ChatMessage = {
          id: `local-${Date.now()}-${Math.random()}`,
          name: currentUser,
          text,
          timestamp: Date.now(),
          to,
          replyTo,
        };

        const myEntry: MessageEntry = {
          id: myMsg.id!,
          message: myMsg,
          isSystem: false,
          isOwn: true,
          color: getColorForUser(currentUser),
        };

        saveAndSetMessages((prev) => [...prev, myEntry]);

        // Trigger typing for mock user
        setTypingUsers((prev) => ({ ...prev, [to]: true }));

        setTimeout(() => {
          // Clear typing
          setTypingUsers((prev) => ({ ...prev, [to]: false }));

          const responses = MOCK_USERS_DATA[
            to as keyof typeof MOCK_USERS_DATA
          ] || ["..."];
          const responseText =
            responses[Math.floor(Math.random() * responses.length)];

          const mockMsg: ChatMessage = {
            id: `mock-${Date.now()}-${Math.random()}`,
            name: to,
            text: responseText,
            timestamp: Date.now(),
            to: currentUser,
            replyTo: {
              id: myMsg.id!,
              name: currentUser,
              text: text,
            },
          };

          const mockEntry: MessageEntry = {
            id: mockMsg.id!,
            message: mockMsg,
            isSystem: false,
            isOwn: false,
            color: getColorForUser(to),
          };

          saveAndSetMessages((prev) => [...prev, mockEntry]);
        }, 1500);

        return;
      }

      if (socketRef.current?.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: "CHAT_MESSAGE",
          payload: { text, to, replyTo },
        }),
      );
    },
    [saveAndSetMessages],
  );

  const sendTyping = useCallback((to?: string) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      socketRef.current.send(
        JSON.stringify({
          type: "TYPING",
          payload: { to },
        }),
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (
        socketRef.current?.readyState === WebSocket.OPEN &&
        isCurrentlyTypingRef.current
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: "STOP_TYPING",
            payload: { to },
          }),
        );
      }
      isCurrentlyTypingRef.current = false;
    }, 2000);
  }, []);

  const changeName = useCallback((newName: string) => {
    userNameRef.current = newName;
    setUserName(newName);
    localStorage.setItem("chatUserName", newName);
    addToastRef.current?.(`Cambiaste tu nombre a "${newName}"`, "success");
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      wsSendJoinChat(newName);
    }
  }, []);

  const wsSendJoinChat = (name: string) => {
    socketRef.current?.send(
      JSON.stringify({ type: "JOIN_CHAT", payload: { name } }),
    );
  };

  const clearChat = useCallback(
    (chatId: string) => {
      saveAndSetMessages((prev) => {
        return prev.filter((m) => {
          const { message, isSystem } = m;
          if (isSystem) return false;

          if (chatId === "General") {
            return message.to !== undefined && message.to !== null;
          }

          const currentUser = userNameRef.current;
          const isFromUserToChat =
            message.name === currentUser && message.to === chatId;
          const isFromChatToUser =
            message.name === chatId && message.to === currentUser;
          return !(isFromUserToChat || isFromChatToUser);
        });
      });
    },
    [saveAndSetMessages],
  );

  /**
   * Delete a single message.
   * scope = "me"  → removes from local history only
   * scope = "all" → also broadcasts DELETE_MESSAGE over WS (if connected)
   */
  const deleteMessage = useCallback(
    (messageId: string, scope: "me" | "all") => {
      if (scope === "all") {
        // Optimistic local update
        saveAndSetMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, message: { ...m.message, isDeleted: true, text: "Mensaje eliminado" } }
              : m
          )
        );

        // Broadcast for "all" if connected
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({ type: "DELETE_MESSAGE", payload: { id: messageId } }),
          );
        }
      } else {
        // Optimistic local removal for "me"
        saveAndSetMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    },
    [saveAndSetMessages],
  );

  /** Hide a user from the active list (persists in this session only) */
  const hideUser = useCallback((name: string) => {
    setHiddenUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const showAllUsers = useCallback(() => setHiddenUsers([]), []);

  // Whether we still need the user to enter their name
  const [needsName, setNeedsName] = useState<boolean>(true);

  const setInitialName = useCallback((name: string) => {
    const trimmed = name.trim() || `Invitado${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem("chatUserName", trimmed);
    userNameRef.current = trimmed;
    setUserName(trimmed);
    setNeedsName(false);
    connect(trimmed);
  }, [connect]);

  // Init on mount — check localStorage first
  useEffect(() => {
    const stored = localStorage.getItem("chatUserName");
    if (stored) {
      userNameRef.current = stored;
      setUserName(stored);
      setNeedsName(false);
      connect(stored);
    }
    // else: needsName stays true → UI shows the name entry screen

    return () => {
      socketRef.current?.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    users,
    status,
    userName,
    typingUsers,
    hiddenUsers,
    needsName,
    setInitialName,
    connect: () => connect(userNameRef.current),
    disconnect,
    sendMessage,
    changeName,
    clearChat,
    sendTyping,
    deleteMessage,
    hideUser,
    showAllUsers,
  };
}
