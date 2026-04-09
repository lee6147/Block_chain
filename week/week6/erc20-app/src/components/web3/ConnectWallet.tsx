"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";

// 지갑 연결/해제 버튼 컴포넌트
export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {/* 주소 축약 표시: 0x1234...5678 */}
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          연결 해제
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => {
        const metamask = connectors.find((c) => c.id === "metaMask");
        if (metamask) connect({ connector: metamask });
      }}
      size="sm"
    >
      🦊 메타마스크 연결
    </Button>
  );
}
