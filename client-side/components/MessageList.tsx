"use client";

import type { MessageEntry, ChatMessage } from "@/types/chat";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Three-dot floating context menu ──────────────────────────────── */
interface MsgMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  isDM: boolean; // true when in a direct-message conversation
  onDeleteMe: () => void;
  onDeleteAll: () => void;
  onReply: () => void;
  onClose: () => void;
}

function MsgMenu({ x, y, isOwn, isDM, onDeleteMe, onDeleteAll, onReply, onClose }: MsgMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: "fixed",
    top: y,
    left: x,
    zIndex: 9998,
  };

  const item = "flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-medium rounded-lg cursor-pointer transition-colors duration-100 w-full text-left";

  return (
    <div
      ref={ref}
      style={style}
      className="animate-fadeIn bg-bg-card shadow-xl rounded-xl p-1.5 min-w-[175px]"
    >
      {/* Reply */}
      <button
        className={`${item} text-text-primary hover:bg-bg-sidebar`}
        onClick={() => { onReply(); onClose(); }}
      >
        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
        Responder
      </button>

      {/* Separator */}
      <div className="my-1 h-px bg-bg-sidebar mx-1" />

      {/* Delete for me — always shown */}
      <button
        className={`${item} text-red-500 hover:bg-red-500/5`}
        onClick={() => { onDeleteMe(); onClose(); }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
        {isDM ? "Eliminar para mí" : "Eliminar"}
      </button>

      {/* Delete for everyone — only if it's our message */}
      {isOwn && (
        <button
          className={`${item} text-red-600 hover:bg-red-500/10 font-semibold`}
          onClick={() => { onDeleteAll(); onClose(); }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.78 0L9 9m9.77-5.52-.97-.48a1.5 1.5 0 0 0-.87-.02H6.23a1.5 1.5 0 0 0-1.23.64l-.2.48M19.5 7a48.9 48.9 0 0 0-15 0m15 0-1.8 13.32A2.25 2.25 0 0 1 15.45 22H8.55a2.25 2.25 0 0 1-2.24-1.68L4.5 7" />
          </svg>
          Eliminar para todos
        </button>
      )}
    </div>
  );
}

/* ─── Single message item ───────────────────────────────────────────── */
interface MessageItemProps {
  entry: MessageEntry;
  isDark: boolean;
  isDM: boolean;
  onReply: (message: ChatMessage) => void;
  onDeleteMe: (id: string) => void;
  onDeleteAll: (id: string) => void;
}

function MessageItem({ entry, isDark, isDM, onReply, onDeleteMe, onDeleteAll }: MessageItemProps) {
  const { id, message, isSystem, isOwn, color } = entry;
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const openMenu = useCallback((e: React.MouseEvent) => {
    if (message.isDeleted) return;
    e.preventDefault();
    e.stopPropagation();
    // Clamp so menu never overflows the right/bottom edge
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const menuW = 180;
    const menuH = 150;
    const x = Math.min(e.clientX, vw - menuW - 8);
    const y = Math.min(e.clientY, vh - menuH - 8);
    setMenu({ x, y });
  }, [message.isDeleted]);

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] rounded-lg px-2.5 py-0.5 bg-bg-sidebar/55 text-text-muted">
          {message.text}
        </span>
      </div>
    );
  }

  const handleQuoteClick = () => {
    if (!message.replyTo?.id) return;
    let targetEl = document.getElementById(message.replyTo.id);
    if (!targetEl) targetEl = document.getElementById(`server-${message.replyTo.id}`);
    if (!targetEl) targetEl = document.getElementById(`msg-${message.replyTo.id}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("highlight-pulse");
      setTimeout(() => targetEl?.classList.remove("highlight-pulse"), 1500);
    }
  };

  const elementId = id.startsWith("local-") || id.startsWith("mock-") ? id : `server-${id}`;

  return (
    <>
      <div
        id={elementId}
        onContextMenu={openMenu}
        className={`group flex items-start gap-2.5 max-w-full transition-colors duration-300 py-1 px-3.5 rounded-xl ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        {!isOwn && (
          <div
            className="w-7.5 h-7.5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mb-0.5 shadow-sm uppercase"
            style={{ background: color ?? "var(--accent)" }}
          >
            {message.name.charAt(0)}
          </div>
        )}

        {/* Bubble + action buttons */}
        <div className={`flex items-center gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          {/* Bubble group */}
          <div className={`flex flex-col gap-0.5 max-w-[400px] sm:max-w-[500px] ${isOwn ? "items-end" : "items-start"}`}>
            {!isOwn && (
              <span className="text-[10px] font-bold px-0.5 mb-0.5" style={{ color: color ?? "var(--accent)" }}>
                {message.name}
              </span>
            )}

            <div
              className={`px-3.5 py-2 text-[12px] leading-relaxed break-words whitespace-pre-wrap rounded-2xl ${
                message.isDeleted
                  ? "italic text-text-muted bg-bg-sidebar/40 border border-border-muted/10"
                  : isOwn
                  ? "bg-bubble-own text-bubble-own-text shadow-sm shadow-accent/5"
                  : "bg-bubble-other text-bubble-other-text"
              }`}
            >
              {message.isDeleted ? (
                <span className="flex items-center gap-1.5 text-text-muted opacity-80 select-none">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  {isOwn ? "Eliminaste este mensaje" : "Este mensaje fue eliminado"}
                </span>
              ) : (
                <>
                  {/* Quoted message */}
                  {message.replyTo && (
                    <div
                      onClick={handleQuoteClick}
                      className={`cursor-pointer pl-2.5 pr-1.5 py-1.5 mb-2 text-[10.5px] rounded-lg select-none transition-colors duration-150 ${
                        isOwn
                          ? "bg-white/10 text-slate-100 hover:bg-white/15"
                          : "bg-bg-sidebar/55 text-text-muted hover:bg-bg-sidebar/85"
                      }`}
                    >
                      <div className={`font-bold text-[9px] uppercase tracking-wider mb-0.5 ${isOwn ? "text-white" : "text-accent"}`}>
                        {message.replyTo.name}
                      </div>
                      <div className="truncate opacity-80 leading-normal">{message.replyTo.text}</div>
                    </div>
                  )}

                  {message.text}
                </>
              )}
            </div>

            <span className="text-[9px] px-0.5 text-text-muted mt-0.5">{time}</span>
          </div>

          {/* Hover action cluster: Reply + Three-dot menu */}
          {!message.isDeleted && (
            <div className={`flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150`}>
              {/* Reply */}
              <button
                onClick={() => onReply(message)}
                type="button"
                className="p-1.5 rounded-lg cursor-pointer text-text-muted hover:text-text-primary hover:bg-bg-sidebar"
                title="Responder"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
              </button>

              {/* Three-dot */}
              <button
                onClick={openMenu}
                type="button"
                className="p-1.5 rounded-lg cursor-pointer text-text-muted hover:text-text-primary hover:bg-bg-sidebar"
                title="Más opciones"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Context menu portal */}
      {menu && (
        <MsgMenu
          x={menu.x}
          y={menu.y}
          isOwn={isOwn}
          isDM={isDM}
          onReply={() => onReply(message)}
          onDeleteMe={() => onDeleteMe(id)}
          onDeleteAll={() => onDeleteAll(id)}
          onClose={() => setMenu(null)}
        />
      )}
    </>
  );
}

/* ─── Message list ──────────────────────────────────────────────────── */
interface MessageListProps {
  messages: MessageEntry[];
  isDark: boolean;
  isDM: boolean;
  onReply: (message: ChatMessage) => void;
  onDeleteMe: (id: string) => void;
  onDeleteAll: (id: string) => void;
  activePartnerTyping: boolean;
  activePartnerName: string;
  activePartnerColor?: string;
}

export function MessageList({
  messages,
  isDark,
  isDM,
  onReply,
  onDeleteMe,
  onDeleteAll,
  activePartnerTyping,
  activePartnerName,
  activePartnerColor,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activePartnerTyping]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-4 py-3 scrollbar-thin scrollbar-track-transparent">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-text-muted opacity-60">
          <div className="text-4xl">💬</div>
          <p className="text-xs font-semibold">¡Comienza esta conversación!</p>
        </div>
      )}

      {messages.map((entry) => (
        <MessageItem
          key={entry.id}
          entry={entry}
          isDark={isDark}
          isDM={isDM}
          onReply={onReply}
          onDeleteMe={onDeleteMe}
          onDeleteAll={onDeleteAll}
        />
      ))}

      {/* Typing indicator */}
      {activePartnerTyping && (
        <div className="flex items-start gap-2.5 py-1 px-3.5 animate-fadeIn">
          <div
            className="w-7.5 h-7.5 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mb-0.5 shadow-sm uppercase"
            style={{ background: activePartnerColor ?? "var(--accent)" }}
          >
            {activePartnerName.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold px-0.5 mb-0.5" style={{ color: activePartnerColor ?? "var(--accent)" }}>
              {activePartnerName}
            </span>
            <div className="px-3.5 py-2.5 rounded-2xl bg-bubble-other">
              <div className="flex gap-1.5 items-center">
                <span className="typing-dot animate-bounce text-text-muted" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot animate-bounce text-text-muted" style={{ animationDelay: "160ms" }} />
                <span className="typing-dot animate-bounce text-text-muted" style={{ animationDelay: "320ms" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
