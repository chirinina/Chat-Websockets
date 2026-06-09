"use client";

import { useState, useRef, type FormEvent, useEffect } from "react";

const EMOJI_CATEGORIES = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75Zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" />
      </svg>
    ),
    label: "Caras",
    emojis: ["😊","😂","🥰","😍","😎","🤔","😢","😡","🤯","🥳","😴","🤩","😏","🤗","😬","🙄","😤","🤭","🥺","😳"],
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ),
    label: "Gestos",
    emojis: ["👍","👎","👏","🙏","🤝","✌️","🤞","👋","🤙","💪","🫶","🤜","🤛","👊","✊","🫵","👆","👇","🤌","🤏"],
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    label: "Amor",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","💕","💯","💞","💓","💗","💖","💝","❣️","💘","🫀","♥️"],
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.904L9 9l.813 5.096L15 15l-5.187.904zM19.071 4.929l-.707 3.536-3.536.707 3.536.707.707 3.536.707-3.536 3.536-.707-3.536-.707-.707-3.536z" />
      </svg>
    ),
    label: "Otros",
    emojis: ["🔥","✨","🎉","🚀","💎","🌟","⚡","🎊","🏆","🎯","🎮","💡","🎵","🎶","🍕","🍔","☕","🍺","🎂","🌈"],
  },
];

interface ChatInputProps {
  onSend: (
    text: string,
    replyTo?: { id: string; name: string; text: string },
  ) => void;
  disabled: boolean;
  isDark: boolean;
  replyingTo: { id: string; name: string; text: string } | null;
  onCancelReply: () => void;
  onTyping: () => void;
}

export function ChatInput({
  onSend,
  disabled,
  isDark,
  replyingTo,
  onCancelReply,
  onTyping,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value.trim(), replyingTo || undefined);
    setValue("");
    onCancelReply();
    setShowEmoji(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const insertEmoji = (emoji: string) => {
    setValue((prev) => prev + emoji);
    onTyping();
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleInputChange = (val: string) => {
    setValue(val);
    onTyping();
  };

  return (
    <div className="relative px-3 pb-3 bg-transparent">
      {/* Reply Preview - Borderless with soft bg */}
      {replyingTo && (
        <div
          className="flex items-center gap-3 px-3.5 py-2 mb-1.5 rounded-xl text-xs animate-fadeIn bg-bg-card/90"
        >
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-[9px] uppercase tracking-wider text-accent leading-none mb-1 select-none">
              Respondiendo a {replyingTo.name}
            </span>
            <span className="truncate text-[11px] text-text-primary opacity-80 leading-snug">
              {replyingTo.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-lg flex-shrink-0 transition-colors hover:bg-bg-sidebar text-text-muted hover:text-text-primary cursor-pointer"
            aria-label="Cancelar respuesta"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Emoji Picker - Borderless & Floating */}
      {showEmoji && (
        <div
          ref={pickerRef}
          className={`absolute bottom-full mb-2 left-3 right-3 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn bg-bg-card p-1.5`}
        >
          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1 pb-2 bg-bg-sidebar/30 rounded-t-xl">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(i)}
                title={cat.label}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                  activeCategory === i
                    ? "bg-accent text-white scale-105 font-bold shadow-sm shadow-accent/15"
                    : "hover:bg-bg-sidebar text-text-muted hover:text-text-primary"
                }`}
              >
                {cat.icon}
                <span className="text-[10px] font-bold tracking-tight hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
          
          {/* Emoji Grid */}
          <div className="grid grid-cols-10 gap-1.5 p-2 max-h-40 overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className={`text-xl p-2 rounded-xl transition-all duration-100 active:scale-90 hover:bg-bg-sidebar cursor-pointer flex items-center justify-center`}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Row - Completely Borderless Capsule */}
      <form onSubmit={handleSubmit} className="flex">
        <div
          className={`flex-1 flex items-center gap-2 rounded-2xl px-3 py-1.5 transition-all duration-150 bg-bg-card ${
            replyingTo ? "rounded-t-none" : ""
          } focus-within:ring-2 focus-within:ring-accent/5`}
        >
          {/* Premium smiley face SVG icon */}
          <button
            id="emoji-btn"
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className={`transition-colors flex-shrink-0 rounded-lg p-1.5 hover:bg-bg-sidebar cursor-pointer ${
              showEmoji ? "text-accent bg-accent-light" : "text-text-muted hover:text-text-primary"
            }`}
            aria-label="Selector de emojis"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75.375.336.375.75Zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z"
              />
            </svg>
          </button>

          <input
            ref={inputRef}
            id="input-message"
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={disabled ? "Estableciendo conexión..." : "Escribe un mensaje..."}
            disabled={disabled}
            autoComplete="off"
            className={`flex-1 bg-transparent text-xs outline-none disabled:opacity-40 min-w-0 h-7 text-text-primary placeholder-text-muted`}
          />

          {/* Integrated Send Button */}
          <button
            id="send-btn"
            type="submit"
            disabled={disabled || !value.trim()}
            className={`flex items-center justify-center w-8.5 h-8.5 transition-all text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer ${
              value.trim() ? "bg-accent hover:bg-accent-hover shadow-md shadow-accent/15" : "bg-text-muted/10 text-text-muted"
            }`}
            aria-label="Enviar"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
