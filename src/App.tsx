import { useState, useMemo, useCallback, useEffect, useSyncExternalStore } from "react";
import { useTokenStream } from "./data/useTokenStream";
import { tokenStore } from "./data/tokenStore";
import { TokenList } from "./components/TokenList";
import { Sidebar } from "./components/Sidebar";
import { Controls, type SortKey } from "./components/Controls";

const TOKEN_COUNT = 10_000;
const UPDATE_INTERVAL_MS = 500;
const CHURN = 0.3;

export default function App() {
  useTokenStream({
    count: TOKEN_COUNT,
    intervalMs: UPDATE_INTERVAL_MS,
    churn: CHURN,
  });

  const tokens = useSyncExternalStore(
    tokenStore.subscribeApp,
    tokenStore.getAppSnapshot
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("marketCapUsd");

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const sortedIds = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    const filtered = normalizedQuery
      ? tokens.filter(
          (t) =>
            t.name.toLowerCase().includes(normalizedQuery) ||
            t.ticker.toLowerCase().includes(normalizedQuery)
        )
      : tokens;
    return filtered
      .slice()
      .sort((a, b) => b[sortKey] - a[sortKey])
      .map((t) => t.id);
  }, [tokens, debouncedQuery, sortKey]);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleSortChange = useCallback((key: SortKey) => setSortKey(key), []);
  const handleQueryChange = useCallback((q: string) => setQuery(q), []);

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__title">AXIOM</span>
        <span className="app__subtitle">Token Feed</span>
      </header>

      <div className="app__body">
        <section className="feed">
          <Controls
            query={query}
            onQueryChange={handleQueryChange}
            sortKey={sortKey}
            onSortKeyChange={handleSortChange}
            visibleCount={sortedIds.length}
            totalCount={TOKEN_COUNT}
          />
          <div className="feed__head">
            <div>Token</div>
            <div className="num">Price</div>
            <div className="num col--hide-mobile">Market Cap</div>
            <div className="num col--hide-mobile">Volume</div>
            <div className="num col--hide-mobile">Liquidity</div>
            <div className="num">24h</div>
          </div>
          <TokenList
            tokenIds={sortedIds}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </section>

        <Sidebar selectedId={selectedId} />
      </div>
    </div>
  );
}
