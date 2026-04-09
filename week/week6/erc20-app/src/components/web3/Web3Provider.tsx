"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi-config";
import { useState } from "react";

// Web3Provider: wagmi + react-query를 앱 전체에 제공하는 래퍼 컴포넌트
// "use client" 필수: 브라우저에서만 동작하는 Web3 기능 사용
export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  // QueryClient를 state로 관리 (SSR 환경에서 인스턴스 공유 방지)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
