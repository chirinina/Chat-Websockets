"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Algo salió mal</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-sky-500 rounded-lg hover:bg-sky-400 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
