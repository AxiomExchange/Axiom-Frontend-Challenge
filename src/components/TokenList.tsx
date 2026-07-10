import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TokenRow } from "./TokenRow";

const ROW_HEIGHT = 52;

interface TokenListProps {
  tokenIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TokenList({ tokenIds, selectedId, onSelect }: TokenListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tokenIds.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="feed__list" ref={scrollRef}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {items.map((virtualRow) => {
          const tokenId = tokenIds[virtualRow.index];
          return (
            <div
              key={tokenId}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: ROW_HEIGHT,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TokenRow
                tokenId={tokenId}
                selected={tokenId === selectedId}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
