"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Types the target string one character at a time.
 * - Uses a ref so Strict Mode double-mounts don't race to the final value.
 * - Respects prefers-reduced-motion.
 */
export function useTypewriter(target: string, speedMs: number = 50): string {
  const [typed, setTyped] = useState("");
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Reduced motion: show final string, no animation
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTyped(target);
      return;
    }

    setTyped("");
    let i = 0;
    let lastStep = performance.now();

    const step = (now: number) => {
      if (now - lastStep >= speedMs) {
        i += 1;
        setTyped(target.slice(0, i));
        lastStep = now;
      }
      if (i < target.length) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [target, speedMs]);

  return typed;
}
