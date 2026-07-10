import type { Token } from "../types";

type Listener = () => void;

/**
 * Holds all token data outside React state. rowListeners fire every 500ms tick
 * so each visible TokenRow can self-update. appListeners are throttled to 500ms
 * to match the stream interval — App re-sorts at the same cadence as updates.
 */
function createTokenStore() {
  const data = new Map<string, Token>();
  const rowListeners = new Set<Listener>();
  const appListeners = new Set<Listener>();
  let appSnapshot: Token[] = [];
  let appThrottle: ReturnType<typeof setTimeout> | null = null;

  return {
    data,
    initialize(tokens: Token[]): void {
      tokens.forEach((t) => data.set(t.id, t));
      appSnapshot = tokens;
    },

    update(id: string, token: Token): void {
      data.set(id, token);
    },

    notify(): void {
      rowListeners.forEach((fn) => fn());

      if (appThrottle !== null) return;
      appThrottle = setTimeout(() => {
        appThrottle = null;
        appSnapshot = Array.from(data.values());
        appListeners.forEach((fn) => fn());
      }, 500);
    },

    subscribeRow(fn: Listener): () => void {
      rowListeners.add(fn);
      return () => rowListeners.delete(fn);
    },

    subscribeApp(fn: Listener): () => void {
      appListeners.add(fn);
      return () => appListeners.delete(fn);
    },

    getToken(id: string): Token | undefined {
      return data.get(id);
    },

    getAppSnapshot(): Token[] {
      return appSnapshot;
    },
  };
}

export const tokenStore = createTokenStore();
