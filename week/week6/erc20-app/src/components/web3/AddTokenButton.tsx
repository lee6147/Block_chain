"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AddTokenButtonProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
}

// 메타마스크 window.ethereum 타입 선언
interface EthereumProvider {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// 메타마스크에 커스텀 토큰을 추가하는 버튼 컴포넌트
export default function AddTokenButton({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
}: AddTokenButtonProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleAddToken = async () => {
    // window.ethereum이 없으면 메타마스크 미설치 상태
    if (typeof window === "undefined" || !window.ethereum) {
      setStatus("error");
      return;
    }

    try {
      // wallet_watchAsset: 메타마스크에 ERC20 토큰 추가 요청
      const result = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });

      if (result) {
        setStatus("success");
      } else {
        // 사용자가 거부한 경우
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    // 3초 후 상태 초기화
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddToken}
        disabled={status !== "idle"}
      >
        🦊 메타마스크에 토큰 추가
      </Button>
      {status === "success" && (
        <p className="text-xs text-green-600">토큰이 메타마스크에 추가되었습니다.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500">
          추가에 실패했습니다. 메타마스크가 설치되어 있는지 확인하세요.
        </p>
      )}
    </div>
  );
}
