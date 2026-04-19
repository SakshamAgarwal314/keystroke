"use client";

import { useState, useEffect } from "react";

interface LoginProps {
  onSubmit: (apeKey: string) => void;
  onDemo: () => void;
  loading: boolean;
  error: string | null;
}

const TAGLINES = [
  "your typing history, finally visualized.",
  "chart the road to your wpm goal.",
  "know when you're improving, know when you're stuck.",
  "built because i type a lot. probably you too.",
];

export default function Login({ onSubmit, onDemo, loading, error }: LoginProps) {
  const [apeKey, setApeKey] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const [taglineIdx, setTaglineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TAGLINES[taglineIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && typed.length < current.length) {
      timeout = setTimeout(() => setTyped(current.slice(0, typed.length + 1)), 38);
    } else if (!deleting && typed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && typed.length > 0) {
      timeout = setTimeout(() => setTyped(current.slice(0, typed.length - 1)), 18);
    } else if (deleting && typed.length === 0) {
      setDeleting(false);
      setTaglineIdx((i) => (i + 1) % TAGLINES.length);
    }

    return () => clearTimeout(timeout);
  }, [typed, deleting, taglineIdx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apeKey.trim()) {
      onSubmit(apeKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#e2b714 1px, transparent 1px), linear-gradient(90deg, #e2b714 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-6 sm:px-10 py-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-dim">
              v1.0 / monkeytype analytics
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono text-ink-dim hover:text-accent transition-colors"
          >
            github ↗
          </a>
        </nav>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-accent mb-5">
                  ◢ track · analyze · improve
                </p>
                <h1 className="font-display font-bold tracking-tighter leading-[0.9]">
                  <span className="block text-6xl sm:text-7xl lg:text-8xl text-ink">
                    keystroke
                    <span className="text-accent">.</span>
                  </span>
                </h1>
              </div>

              <p className="text-lg sm:text-xl font-mono text-ink-dim min-h-[3.5rem] sm:min-h-[2rem]">
                <span>{typed}</span>
                <span className="inline-block w-[0.6ch] h-[1em] bg-accent ml-0.5 align-middle animate-pulse" />
              </p>
            </div>

            <div className="w-full max-w-md lg:max-w-none mx-auto lg:mx-0">
              <div className="relative rounded-2xl border border-ink-faint bg-surface-1/80 backdrop-blur-sm p-7 shadow-2xl shadow-black/40">
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                <div className="mb-6">
                  <h2 className="text-xl font-display font-semibold text-ink">
                    sign in
                  </h2>
                  <p className="text-xs font-mono text-ink-dim mt-1">
                    your ApeKey stays client-side — never stored.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-ink-dim mb-2">
                      MonkeyType ApeKey
                    </label>
                    <input
                      type="password"
                      value={apeKey}
                      onChange={(e) => setApeKey(e.target.value)}
                      placeholder="Da2.xxxxxxxxxxxx"
                      className="w-full bg-surface-2 border border-ink-faint rounded-lg px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-dim/40 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-all"
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-[10px] font-mono text-accent/80 hover:text-accent mt-2 transition-colors"
                    >
                      {showHelp ? "↑ hide" : "→ how do i get one?"}
                    </button>
                    {showHelp && (
                      <div className="mt-3 p-4 rounded-lg bg-surface-2 border border-ink-faint text-xs font-mono text-ink-dim leading-relaxed space-y-1.5">
                        <p><span className="text-accent">1.</span> monkeytype.com → log in</p>
                        <p><span className="text-accent">2.</span> settings → scroll to <span className="text-ink">Ape Keys</span></p>
                        <p><span className="text-accent">3.</span> enable them if disabled → generate new key</p>
                        <p><span className="text-accent">4.</span> copy and paste above (only shown once)</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-speed-low/10 border border-speed-low/30 text-xs font-mono text-speed-low leading-relaxed">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!apeKey.trim() || loading}
                    className="w-full py-3.5 rounded-lg font-mono text-sm font-semibold tracking-wide uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-accent text-surface-0 hover:bg-accent-glow hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        loading your data…
                      </span>
                    ) : (
                      "→ load my dashboard"
                    )}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-ink-faint" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-dim/60">
                      or
                    </span>
                    <div className="flex-1 h-px bg-ink-faint" />
                  </div>

                  <button
                    type="button"
                    onClick={onDemo}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-mono text-sm text-ink-dim border border-ink-faint hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40"
                  >
                    ▸ preview with demo data
                  </button>
                </form>
              </div>

              <p className="text-center text-[10px] font-mono text-ink-dim/50 mt-4">
                no account? no problem — demo mode shows the full dashboard.
              </p>
            </div>
          </div>
        </div>

        <footer className="px-6 sm:px-10 py-5 flex items-center justify-between text-[10px] font-mono text-ink-dim/40">
          <span>built with next.js · typescript · recharts</span>
          <span>saksham agarwal / 2026</span>
        </footer>
      </div>
    </div>
  );
}
