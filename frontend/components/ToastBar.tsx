"use client";

import { useEffect, useRef, useState } from "react";

export interface Toast {
  id: string;
  text: string;
  icon: "user" | "success" | "info" | "warn";
  isSystem?: boolean;
}

interface ToastBarProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  user: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  success: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  info: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  ),
  warn: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
};

const ICON_COLOR: Record<Toast["icon"], string> = {
  user:    "text-accent",
  success: "text-emerald-500",
  info:    "text-text-muted",
  warn:    "text-amber-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay mount so we get the enter animation
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-bg-card shadow-lg transition-all duration-200 max-w-[280px] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span className={ICON_COLOR[toast.icon]}>{ICONS[toast.icon]}</span>
      <span className="text-[11px] text-text-primary leading-snug flex-1 min-w-0 truncate">
        {toast.text}
      </span>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer p-0.5 rounded"
        aria-label="Cerrar notificación"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastBar({ toasts, onDismiss }: ToastBarProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

/** Convenience hook — manages toast state + auto-dismiss */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const addToast = (text: string, icon: Toast["icon"] = "info", ttl = 4000, isSystem = false) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((p) => {
      // For system toasts (join/leave), cap at 2 visible at a time — drop the oldest
      const filtered = isSystem
        ? p.filter((t) => !t.isSystem).concat(p.filter((t) => t.isSystem).slice(-1))
        : p;
      return [...filtered, { id, text, icon, isSystem }];
    });
    timerRef.current[id] = setTimeout(() => dismissToast(id), ttl);
    return id;
  };

  const dismissToast = (id: string) => {
    clearTimeout(timerRef.current[id]);
    delete timerRef.current[id];
    setToasts((p) => p.filter((t) => t.id !== id));
  };

  useEffect(() => {
    return () => {
      Object.values(timerRef.current).forEach(clearTimeout);
    };
  }, []);

  return { toasts, addToast, dismissToast };
}
