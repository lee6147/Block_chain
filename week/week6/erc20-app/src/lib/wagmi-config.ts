import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

// wagmi 설정: Sepolia 테스트넷 전용
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    // Sepolia RPC 엔드포인트 (환경변수 또는 공용 RPC)
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    ),
  },
});
