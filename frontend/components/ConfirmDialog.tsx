"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ConfirmDialogConfig {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" = red confirm button, "primary" = brand accent (default) */
  variant?: "danger" | "primary";
  icon?: "trash" | "info" | "warning";
}

interface ConfirmDialogProps extends ConfirmDialogConfig {
  isOpen: boolean;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.78 0L9 9m9.77-5.52-.97-.48a1.5 1.5 0 0 0-.87-.02H6.23a1.5 1.5 0 0 0-1.23.64l-.2.48M19.5 7a48.9 48.9 0 0 0-15 0m15 0-1.8 13.32A2.25 2.25 0 0 1 15.45 22H8.55a2.25 2.25 0 0 1-2.24-1.68L4.5 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

const ICON_MAP = {
  trash:   <TrashIcon />,
  warning: <WarningIcon />,
  info:    <InfoIcon />,
};

export function ConfirmDialog({
  isOpen,
  isDark,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "primary",
  icon = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Portal mount guard (Next.js SSR)
  useEffect(() => { setMounted(true); }, []);

  // Focus trap on open
  useEffect(() => {
    if (isOpen && !closing) {
      const id = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen, closing]);

  // Keyboard handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCancel = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onCancel();
    }, 150);
  };

  const handleConfirm = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onConfirm();
    }, 150);
  };

  if (!mounted || !isOpen) return null;

  const iconColor =
    variant === "danger" ? "text-red-500" : "text-accent";
  const iconBg =
    variant === "danger"
      ? "bg-red-500/10 border-red-500/20"
      : "bg-accent-light border-accent/20";

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500/40"
      : "bg-accent hover:bg-accent-hover text-white focus-visible:ring-accent/40 shadow-sm shadow-accent/10";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
        closing ? "animate-backdrop-out" : "animate-backdrop-in"
      }`}
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div
        className={`w-full max-w-[310px] rounded-2xl border border-border-main shadow-2xl overflow-hidden bg-bg-card ${
          closing ? "animate-dialog-out" : "animate-dialog-in"
        }`}
      >
        {/* Top accent bar */}
        <div className={`h-0.5 w-full ${variant === "danger" ? "bg-red-500" : "bg-accent"}`} />

        <div className="p-4.5 flex flex-col gap-3.5">
          {/* Icon + Title row */}
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${iconBg} ${iconColor}`}>
              {ICON_MAP[icon]}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                id="confirm-dialog-title"
                className="text-[11px] uppercase font-bold tracking-wider text-text-primary leading-snug"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-desc"
                className="text-[10.5px] leading-relaxed mt-1 text-text-muted"
              >
                {description}
              </p>
            </div>
          </div>

          {/* Action buttons - highly slender and elegant */}
          <div className="flex gap-2 pt-0.5">
            <button
              ref={cancelRef}
              onClick={handleCancel}
              className={`flex-1 h-7.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border-main bg-bg-card text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer`}
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 h-7.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 cursor-pointer ${confirmClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useConfirm(isDark: boolean) {
  const [cfg, setCfg] = useState<ConfirmDialogConfig | null>(null);
  const [open, setOpen] = useState(false);
  const resolveRef = useRef<(v: boolean) => void>(() => {});

  const openConfirm = (config: ConfirmDialogConfig): Promise<boolean> => {
    setCfg(config);
    setOpen(true);
    return new Promise<boolean>((res) => { resolveRef.current = res; });
  };

  const handleConfirm = () => { setOpen(false); resolveRef.current(true);  };
  const handleCancel  = () => { setOpen(false); resolveRef.current(false); };

  const dialog = cfg ? (
    <ConfirmDialog
      isOpen={open}
      isDark={isDark}
      {...cfg}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { openConfirm, dialog };
}
