"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";

interface NameEntryProps {
  onSubmit: (name: string) => void;
  isDark: boolean;
}

export function NameEntry({ onSubmit, isDark }: NameEntryProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
      return;
    }
    onSubmit(value.trim());
  };

  return (
    <div
      className={`h-screen w-screen flex items-center justify-center bg-bg-app overflow-hidden`}
    >
      {/* Ambient warm glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(204,94,66,0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(204,94,66,0.11) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm mx-4 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8 select-none">
          {/* Real Next.js Logo Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
              isDark
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          >
            {/* SVG of Next.js */}
            <svg
              className={`w-8.5 h-8.5 ${isDark ? "text-slate-100" : "text-slate-950"}`}
              viewBox="0 0 180 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask-next"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="180"
                height="180"
              >
                <circle cx="90" cy="90" r="90" fill="black" />
              </mask>
              <g mask="url(#mask-next)">
                <circle cx="90" cy="90" r="90" fill="currentColor" />
                <path
                  d="M149.508 157.52L69.142 54.0289H54V125.971H66.8208V73.7431L137.994 165.078C142.022 162.775 145.867 160.246 149.508 157.52Z"
                  fill="white"
                />
                <path d="M115 54H128V126H115V54Z" fill="white" />
              </g>
            </svg>
          </div>

          <h1 className={`text-lg font-bold tracking-tight text-text-primary`}>
            ChiriJson
          </h1>
        </div>

        {/* Form card */}
        <div
          className={`rounded-2xl border p-6 bg-bg-card`}
          style={{
            boxShadow: isDark
              ? "0 16px 48px rgba(0,0,0,0.4)"
              : "0 12px 32px rgba(0,0,0,0.04)",
          }}
        >
          <p className={`text-[11px] mb-4 text-text-muted`}>
            Escribe tu nombre para participar en la sala.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Input */}
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all duration-150 ${
                shake ? "animate-[shake_0.4s_ease-in-out]" : ""
              } ${
                focused
                  ? "border-accent/40 ring-2 ring-accent/5 bg-bg-app"
                  : "border-border-main bg-bg-app/50"
              }`}
            >
              {/* Avatar preview */}
              <div
                className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 transition-all duration-150 ${
                  value.trim()
                    ? "bg-accent shadow-sm"
                    : isDark
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {value.trim() ? value.trim().charAt(0).toUpperCase() : "?"}
              </div>

              <input
                ref={inputRef}
                id="name-input"
                type="text"
                value={value}
                maxLength={32}
                autoComplete="nickname"
                spellCheck={false}
                placeholder="Ingresa tu nombre..."
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`flex-1 bg-transparent text-xs outline-none placeholder-text-muted text-text-primary`}
              />

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    inputRef.current?.focus();
                  }}
                  className={`flex-shrink-0 text-text-muted hover:text-text-primary transition-colors`}
                  aria-label="Limpiar"
                  tabIndex={-1}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              id="join-btn"
              type="submit"
              className={`w-full h-10 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                value.trim()
                  ? "bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/10 cursor-pointer"
                  : isDark
                    ? "bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800/80"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50"
              }`}
            >
              {value.trim() ? "Comenzar →" : "Pon tu nombre"}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className={`text-center text-[10px] mt-4 text-text-muted`}>
          Tus datos se guardan de forma local y segura en este navegador
        </p>
      </div>
    </div>
  );
}
