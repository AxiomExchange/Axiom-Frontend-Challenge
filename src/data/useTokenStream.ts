import { useEffect, useRef } from "react";
import { generateTokens } from "./generateTokens";
import { tokenStore } from "./tokenStore";

interface StreamOptions {
  /** How many tokens to seed the feed with. */
  count: number;
  /** Milliseconds between update ticks. */
  intervalMs: number;
  /** Fraction of tokens (0–1) that change on every tick. */
  churn: number;
}

/**
 * Starts the simulated live market feed and writes updates directly into
 * tokenStore — bypassing React state entirely so App never re-renders from
 * ticks. Each visible TokenRow subscribes to the store independently via
 * useSyncExternalStore and only re-renders when its own token changes.
 */
export function useTokenStream({ count, intervalMs, churn }: StreamOptions): void {
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    tokenStore.initialize(generateTokens(count));
  }

  useEffect(() => {
    const id = setInterval(() => {
      const all = Array.from(tokenStore.data.values());
      const updatesPerTick = Math.floor(all.length * churn);

      for (let i = 0; i < updatesPerTick; i++) {
        const index = Math.floor(Math.random() * all.length);
        const token = all[index];
        const drift = 1 + (Math.random() - 0.5) * 0.08;
        const priceUsd = token.priceUsd * drift;
        tokenStore.update(token.id, {
          ...token,
          priceUsd,
          marketCapUsd: token.marketCapUsd * drift,
          volume24hUsd: token.volume24hUsd * (1 + (Math.random() - 0.5) * 0.1),
          txCount: token.txCount + Math.floor(Math.random() * 50),
          priceChangePct: token.priceChangePct + (drift - 1) * 100,
        });
      }

      tokenStore.notify();
    }, intervalMs);

    return () => clearInterval(id);
  }, [count, intervalMs, churn]);
}
