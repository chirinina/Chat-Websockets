"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { LeftSidebar } from "./SidePanel";
import { useConfirm } from "./ConfirmDialog";
import { NameEntry } from "./NameEntry";
import { ToastBar, useToasts } from "./ToastBar";
import { useChatWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/types/chat";

type ReplyRef = { id: string; name: string; text: string };

const MOCK_PROFILES = {};

const getProfileData = (name: string) => {
  if (name === "General") {
    return {
      bio: "Canal global público. Todos los usuarios conectados pueden ver y enviar mensajes aquí. Ideal para anuncios generales y debates de equipo.",
      status: "Público",
    };
  }
  if (MOCK_PROFILES[name as keyof typeof MOCK_PROFILES]) {
    return MOCK_PROFILES[name as keyof typeof MOCK_PROFILES];
  }
  return {
    bio: "Usuario registrado actualmente online en el servidor de ChiriJson.",
    status: "En linea",
  };
};

/* ── Tiny three-dot dropdown ─────────────────────────────────────── */
interface HeaderMenuProps {
  onClear: () => void;
  onProfile: () => void;
  profileOpen: boolean;
}
function HeaderMenu({ onClear, onProfile, profileOpen }: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", h);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", h);
    };
  }, []);

  const item = "flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-medium rounded-lg cursor-pointer transition-colors duration-100 w-full text-left";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className={`p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
          open ? "text-accent bg-accent-light" : "text-text-muted hover:text-text-primary hover:bg-bg-sidebar"
        }`}
        aria-label="Más opciones"
        title="Más opciones"
      >
        {/* Three vertical dots */}
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 animate-fadeIn bg-bg-card shadow-xl rounded-xl p-1.5 min-w-[175px]">
          {/* Profile toggle */}
          <button
            className={`${item} ${profileOpen ? "text-accent bg-accent-light" : "text-text-primary hover:bg-bg-sidebar"}`}
            onClick={() => { onProfile(); setOpen(false); }}
          >
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            {profileOpen ? "Cerrar perfil" : "Ver perfil"}
          </button>

          <div className="my-1 h-px bg-bg-sidebar mx-1" />

          {/* Clear */}
          <button
            className={`${item} text-red-500 hover:bg-red-500/5`}
            onClick={() => { onClear(); setOpen(false); }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.78 0L9 9m9.77-5.52-.97-.48a1.5 1.5 0 0 0-.87-.02H6.23a1.5 1.5 0 0 0-1.23.64l-.2.48M19.5 7a48.9 48.9 0 0 0-15 0m15 0-1.8 13.32A2.25 2.25 0 0 1 15.45 22H8.55a2.25 2.25 0 0 1-2.24-1.68L4.5 7" />
            </svg>
            Limpiar conversación
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main chat app ───────────────────────────────────────────────── */
export function ChatApp() {
  const { toasts, addToast, dismissToast } = useToasts();

  const {
    messages,
    users,
    status,
    userName,
    typingUsers,
    hiddenUsers,
    needsName,
    setInitialName,
    connect,
    disconnect,
    sendMessage,
    changeName,
    clearChat,
    sendTyping,
    deleteMessage,
    hideUser,
  } = useChatWebSocket(addToast);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeChat, setActiveChat] = useState<string>("General");
  const [replyingTo, setReplyingTo] = useState<ReplyRef | null>(null);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const isDark = theme === "dark";
  const { openConfirm, dialog: confirmDialog } = useConfirm(isDark);

  useEffect(() => {
    const saved =
      (localStorage.getItem("chatTheme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  if (needsName) return <NameEntry isDark={isDark} onSubmit={setInitialName} />;

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("chatTheme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setReplyingTo(null);
    setShowSidebar(false);
  };

  const handleReplyMessage = (msg: ChatMessage) => {
    if (!msg.id) return;
    setReplyingTo({ id: msg.id, name: msg.name, text: msg.text });
  };

  const handleSend = (text: string, replyTo?: ReplyRef) => {
    const toParam = activeChat === "General" ? undefined : activeChat;
    sendMessage(text, toParam, replyTo ? { id: replyTo.id, name: replyTo.name, text: replyTo.text } : undefined);
  };

  const filteredMessages = messages.filter((m) => {
    if (m.isSystem) return activeChat === "General";
    if (activeChat === "General") return !m.message.to;
    const isFromMe = m.message.name === userName && m.message.to === activeChat;
    const isFromThem = m.message.name === activeChat && m.message.to === userName;
    return isFromMe || isFromThem;
  });

  const isDM = activeChat !== "General";
  const activePartnerTyping = isDM && typingUsers[activeChat] === true;
  const activeProfile = getProfileData(activeChat);
  const activePartnerColor = "var(--accent)";

  const handleClearActiveChat = async () => {
    const ok = await openConfirm({
      title: `Limpiar conversación`,
      description: `¿Seguro que deseas borrar todo el historial de "${activeChat}"? Esta acción no se puede deshacer.`,
      confirmLabel: "Si",
      cancelLabel: "No",
      variant: "danger",
      icon: "trash",
    });
    if (ok) clearChat(activeChat);
  };

  const handleClearFromProfile = async () => {
    const ok = await openConfirm({
      title: "Limpiar historial completo",
      description: `Se eliminará permanentemente todo el historial de chat con "${activeChat}".`,
      confirmLabel: "Si",
      cancelLabel: "No",
      variant: "danger",
      icon: "trash",
    });
    if (ok) clearChat(activeChat);
  };

  const handleDeleteMe = (id: string) => deleteMessage(id, "me");
  const handleDeleteAll = (id: string) => deleteMessage(id, "all");

  return (
    <>
      <div className="h-screen w-screen flex overflow-hidden bg-bg-app text-text-primary">
        {/* Mobile sidebar backdrop */}
        {showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[1.5px] animate-fadeIn"
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-200 ease-in-out md:translate-x-0 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } flex flex-shrink-0 h-full`}
        >
          <LeftSidebar
            userName={userName}
            status={status}
            users={users}
            activeChat={activeChat}
            onChangeChat={handleSelectChat}
            onChangeName={changeName}
            onConnect={connect}
            onDisconnect={disconnect}
            isDark={isDark}
            toggleTheme={toggleTheme}
            messages={messages}
            typingUsers={typingUsers}
            hiddenUsers={hiddenUsers}
            onHideUser={hideUser}
          />
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Header */}
          <header className="h-14 px-4 md:px-5 flex items-center justify-between bg-bg-card">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {/* Hamburger (mobile) */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-bg-sidebar text-text-muted hover:text-text-primary transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Abrir panel lateral"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              {/* Avatar */}
              <div
                onClick={() => setShowProfile(true)}
                className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase cursor-pointer flex-shrink-0 shadow-sm"
                style={{ background: activePartnerColor }}
              >
                {activeChat.charAt(0)}
              </div>

              <div className="min-w-0">
                <h2
                  onClick={() => setShowProfile(true)}
                  className="text-xs font-bold leading-tight cursor-pointer hover:text-accent transition-colors truncate"
                >
                  {activeChat === "General" ? "Canal General" : activeChat}
                </h2>
                <p className="text-[10px] text-text-muted truncate mt-0.5">
                  {activePartnerTyping ? (
                    <span className="text-accent font-bold">escribiendo...</span>
                  ) : activeChat === "General" ? (
                    `${users.length} miembros activos`
                  ) : (
                    activeProfile.status
                  )}
                </p>
              </div>
            </div>

            {/* Three-dot menu */}
            <HeaderMenu
              onClear={handleClearActiveChat}
              onProfile={() => setShowProfile((s) => !s)}
              profileOpen={showProfile}
            />
          </header>

          {/* Messages */}
          <div className="flex-1 min-h-0 bg-transparent flex flex-col">
            <MessageList
              messages={filteredMessages}
              isDark={isDark}
              isDM={isDM}
              onReply={handleReplyMessage}
              onDeleteMe={handleDeleteMe}
              onDeleteAll={handleDeleteAll}
              activePartnerTyping={activePartnerTyping}
              activePartnerName={activeChat}
              activePartnerColor={activePartnerColor}
            />
          </div>

          {/* Input */}
          <div className="flex-shrink-0">
            <ChatInput
              onSend={handleSend}
              disabled={status !== "connected"}
              isDark={isDark}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onTyping={() => sendTyping(isDM ? activeChat : undefined)}
            />
          </div>
        </div>

        {/* Right profile panel */}
        <div
          className={`transition-all duration-250 ease-in-out flex flex-col h-full flex-shrink-0 bg-bg-sidebar text-text-primary ${
            showProfile ? "w-64" : "w-0 overflow-hidden"
          }`}
        >
          <div className="p-4 flex items-center justify-between flex-shrink-0 bg-bg-sidebar/55">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Detalles</h3>
            <button
              onClick={() => setShowProfile(false)}
              className="p-1 rounded-lg hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Cerrar perfil"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4 scrollbar-thin">
            <div
              className="w-18 h-18 rounded-2xl shadow-sm flex items-center justify-center text-2xl font-bold text-white uppercase flex-shrink-0"
              style={{ background: activePartnerColor }}
            >
              {activeChat.charAt(0)}
            </div>

            <div className="text-center min-w-0 w-full">
              <h4 className="text-sm font-bold truncate text-text-primary">{activeChat}</h4>
              <span
                className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold mt-1.5 uppercase ${
                  activeChat === "General"
                    ? "bg-accent-light text-accent"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {activeProfile.status}
              </span>
            </div>

            <div className="w-full flex flex-col gap-3.5 text-xs pt-4 mt-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-text-muted block mb-1">Descripción</span>
                <p className="leading-relaxed text-[11px] text-text-primary opacity-80">
                  {activeProfile.bio}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 flex-shrink-0 bg-bg-sidebar/55">
            <button
              onClick={handleClearFromProfile}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 text-[10px] font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.78 0L9 9m4.77-3.52 1-.48a1.5 1.5 0 0 0-.87-2.85H9.23a1.5 1.5 0 0 0-1.23.64l-.2.48m11.3 2.22c.96.06 1.9.12 2.85.19m-2.85 0a48.11 48.11 0 0 1-12.84 0m12.84 0L17.7 20.82a2.25 2.25 0 0 1-2.24 1.18H8.54A2.25 2.25 0 0 1 6.3 20.82L4.6 6.7M16.5 6.7a48.56 48.56 0 0 0-9 0" />
              </svg>
              Limpiar Conversación
            </button>
          </div>
        </div>
      </div>
      {confirmDialog}
      <ToastBar toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
