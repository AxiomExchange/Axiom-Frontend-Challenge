import { useCallback, useSyncExternalStore } from "react";
import { tokenStore } from "../data/tokenStore";
import { formatUsd, formatPct } from "../format";

interface TokenRowProps {
  tokenId: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Reads its own token directly from tokenStore via useSyncExternalStore.
 * Re renders only when its specific token's object reference changes.
 */
export function TokenRow({ tokenId, selected, onSelect }: TokenRowProps) {
  const subscribe = useCallback(
    (fn: () => void) => tokenStore.subscribeRow(fn),
    []
  );
  const getSnapshot = useCallback(
    () => tokenStore.getToken(tokenId),
    [tokenId]
  );

  const token = useSyncExternalStore(subscribe, getSnapshot);

  if (!token) return null;

  const changeClass = token.priceChangePct >= 0 ? "up" : "down";

  return (
    <div
      className={`row${selected ? " row--selected" : ""}`}
      onClick={() => onSelect(tokenId)}
    >
      <div className="row__token">
        <span className="row__name">{token.name}</span>
        <span className="row__ticker">{token.ticker}</span>
      </div>
      <div className="num">{formatUsd(token.priceUsd)}</div>
      <div className="num col--hide-mobile">{formatUsd(token.marketCapUsd)}</div>
      <div className="num col--hide-mobile">{formatUsd(token.volume24hUsd)}</div>
      <div className="num col--hide-mobile">{formatUsd(token.liquidityUsd)}</div>
      <div className={`num ${changeClass}`}>{formatPct(token.priceChangePct)}</div>
    </div>
  );
}
