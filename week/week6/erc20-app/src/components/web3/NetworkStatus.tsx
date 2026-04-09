"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 네트워크 상태 표시 + Sepolia가 아닌 경우 전환 안내
export default function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) return null;

  const isCorrectNetwork = chainId === sepolia.id;

  if (isCorrectNetwork) {
    return (
      <Badge variant="outline" className="border-green-500 text-green-600">
        Sepolia 테스트넷
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="destructive">잘못된 네트워크</Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={() => switchChain({ chainId: sepolia.id })}
      >
        Sepolia로 전환
      </Button>
    </div>
  );
}
