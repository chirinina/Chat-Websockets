"use client";

import { useState, type FormEvent } from "react";
import type { MessageEntry } from "@/types/chat";

interface LeftSidebarProps {
  userName: string;
  status: "connecting" | "connected" | "disconnected" | "error";
  users: string[];
  activeChat: string;
  onChangeChat: (chatId: string) => void;
  onChangeName: (name: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  messages: MessageEntry[];
  typingUsers: Record<string, boolean>;
  hiddenUsers: string[];
  onHideUser: (name: string) => void;
}

const MOCK_USERS: string[] = [];
const MOCK_COLORS: Record<string, string> = {};

export function LeftSidebar({
  userName,
  status,
  users,
  activeChat,
  onChangeChat,
  onChangeName,
  onConnect,
  onDisconnect,
  isDark,
  toggleTheme,
  messages,
  typingUsers,
  hiddenUsers,
  onHideUser,
}: LeftSidebarProps) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || trimmed === userName) return;
    onChangeName(trimmed);
    setNewName("");
    setIsEditingName(false);
  };

  const getLastMessage = (chatId: string) => {
    const chatMsgs = messages.filter((m) => {
      if (m.isSystem) return false;
      if (chatId === "General") return !m.message.to;
      const isFromMe = m.message.name === userName && m.message.to === chatId;
      const isFromThem = m.message.name === chatId && m.message.to === userName;
      return isFromMe || isFromThem;
    });
    if (chatMsgs.length === 0) return "Sin mensajes";
    const last = chatMsgs[chatMsgs.length - 1];
    return `${last.message.name === userName ? "Tú: " : ""}${last.message.text}`;
  };

  const uniqueOnlineUsers = [...new Set(users)].filter(
    (u) => u !== userName && !MOCK_USERS.includes(u),
  );
  const dmList = [...new Set([...uniqueOnlineUsers, ...MOCK_USERS])].filter(
    (u) => !hiddenUsers.includes(u),
  );
  const filteredDMs = dmList.filter((u) =>
    u.toLowerCase().includes(search.toLowerCase()),
  );

  const statusConfig = {
    connected:    { dot: "bg-emerald-500",            label: "En línea",      text: "text-emerald-500" },
    connecting:   { dot: "bg-amber-500 animate-pulse", label: "Conectando...", text: "text-amber-500"   },
    disconnected: { dot: "bg-slate-500",               label: "Desconectado",  text: "text-slate-500"   },
    error:        { dot: "bg-red-500",                 label: "Error de red",  text: "text-red-500"     },
  }[status];

  return (
    <div className="w-64 flex flex-col h-full bg-bg-sidebar text-text-primary">
      {/* Header */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-text-primary">
            <span className="w-2.5 h-2.5 bg-accent rounded-sm inline-block" />
            Chisme
          </h2>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span className={`text-[9px] font-bold uppercase ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Search - Borderless */}
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs bg-bg-card transition-all duration-150 focus-within:ring-2 focus-within:ring-accent/5">
          <svg className="w-3 h-3 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none flex-1 text-[11px] placeholder-text-muted text-text-primary"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer" aria-label="Limpiar búsqueda">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-4">
        {/* Channels */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2.5 mb-1.5">Canales</h3>
          <button
            onClick={() => onChangeChat("General")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
              activeChat === "General"
                ? "bg-accent-light text-accent font-bold"
                : "hover:bg-bg-card/50 text-text-muted hover:text-text-primary"
            }`}
          >
            <span className="text-xs truncate flex items-center gap-2">
              <span className="opacity-60 font-semibold">#</span> general
            </span>
          </button>
        </div>

        {/* Direct Messages */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-2.5 mb-1.5">
            Miembros en línea
          </h3>
          <ul className="flex flex-col gap-0.5">
            {filteredDMs.length === 0 && (
              <li className="text-[10px] text-text-muted text-center py-4 bg-bg-card/25 rounded-xl">
                Nadie más conectado aún
              </li>
            )}
            {filteredDMs.map((user) => {
              const isActive = activeChat === user;
              const isTyping = typingUsers[user] === true;
              const isMock = MOCK_USERS.includes(user);
              const color = isMock ? MOCK_COLORS[user] : "var(--accent)";

              return (
                <li key={user} className="group/item relative">
                  <button
                    onClick={() => onChangeChat(user)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-accent-light text-accent font-bold"
                        : "hover:bg-bg-card/50 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white uppercase relative"
                      style={{ background: color }}
                    >
                      {user.charAt(0)}
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-bg-sidebar" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate font-medium">{user}</div>
                      <p className={`text-[10px] truncate ${isTyping ? "text-accent font-bold" : "text-text-muted"}`}>
                        {isTyping ? "escribiendo..." : getLastMessage(user)}
                      </p>
                    </div>
                  </button>

                  {/* Dismiss button — appears on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onHideUser(user); }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded-md text-text-muted hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                    title={`Ocultar a ${user}`}
                    aria-label={`Ocultar a ${user}`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex flex-col gap-2.5 bg-bg-sidebar/90">
        {isEditingName ? (
          <form onSubmit={handleNameSubmit} className="flex gap-1.5 animate-fadeIn">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={userName}
              autoComplete="off"
              className="flex-1 rounded-lg px-2.5 py-1 text-xs outline-none bg-bg-card text-text-primary focus:ring-1 focus:ring-accent/40"
            />
            <button type="submit" className="px-2.5 py-1 bg-accent hover:bg-accent-hover text-white text-[10px] font-bold rounded-lg cursor-pointer">Ok</button>
            <button type="button" onClick={() => setIsEditingName(false)} className="px-2 py-1 rounded-lg text-[10px] bg-bg-card text-text-muted hover:text-text-primary cursor-pointer">X</button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                {userName.charAt(0) || "?"}
              </div>
              <span className="text-xs font-semibold truncate text-text-primary">{userName || "Invitado"}</span>
            </div>
            <button
              onClick={() => { setNewName(userName); setIsEditingName(true); }}
              className="p-1.5 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Editar Nombre"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.089a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex gap-1.5">
          <button onClick={toggleTheme} className="flex-1 flex items-center justify-center h-7.5 rounded-lg bg-bg-card text-[10px] font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            {isDark ? "Modo Claro" : "Modo Oscuro"}
          </button>
          {status === "connected" ? (
            <button onClick={onDisconnect} className="flex-1 flex items-center justify-center h-7.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-500 text-[10px] font-semibold transition-colors cursor-pointer">
              Desconectar
            </button>
          ) : (
            <button onClick={onConnect} disabled={status === "connecting"} className="flex-1 flex items-center justify-center h-7.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-500 text-[10px] font-semibold transition-colors disabled:opacity-40 cursor-pointer">
              Conectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
