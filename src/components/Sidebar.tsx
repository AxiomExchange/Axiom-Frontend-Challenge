import { useCallback, useSyncExternalStore } from "react";
import { tokenStore } from "../data/tokenStore";
import {
  formatUsd,
  formatNumber,
  formatPct,
  formatAge,
} from "../format";

interface SidebarProps {
  selectedId: string | null;
}


export function Sidebar({ selectedId }: SidebarProps) {
  const subscribe = useCallback(
    (fn: () => void) => tokenStore.subscribeRow(fn),
    []
  );
  const getSnapshot = useCallback(
    () => (selectedId ? tokenStore.getToken(selectedId) ?? null : null),
    [selectedId]
  );

  const token = useSyncExternalStore(subscribe, getSnapshot);

  if (!token) {
    return (
      <aside className="sidebar">
        <div className="sidebar__empty">Select a token to see details.</div>
      </aside>
    );
  }

  const changeClass = token.priceChangePct >= 0 ? "up" : "down";

  return (
    <aside className="sidebar">
      <div className="sidebar__name">{token.name}</div>
      <div className="sidebar__ticker">{token.ticker}</div>

      <Stat label="Price" value={formatUsd(token.priceUsd)} />
      <Stat
        label="24h Change"
        value={formatPct(token.priceChangePct)}
        valueClass={changeClass}
      />
      <Stat label="Market Cap" value={formatUsd(token.marketCapUsd)} />
      <Stat label="24h Volume" value={formatUsd(token.volume24hUsd)} />
      <Stat label="Liquidity" value={formatUsd(token.liquidityUsd)} />
      <Stat label="Holders" value={formatNumber(token.holders)} />
      <Stat label="Transactions" value={formatNumber(token.txCount)} />
      <Stat label="Age" value={formatAge(token.ageSeconds)} />
    </aside>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className={`stat__value${valueClass ? " " + valueClass : ""}`}>
        {value}
      </span>
    </div>
  );
}
