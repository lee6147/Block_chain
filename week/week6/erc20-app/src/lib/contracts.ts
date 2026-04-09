// ERC20 표준 ABI (토큰과 상호작용하기 위한 인터페이스 정의)
// ABI = Application Binary Interface
// 스마트 컨트랙트의 함수/이벤트를 프론트엔드에서 호출할 수 있게 해주는 명세서
export const ERC20_ABI = [
  // 읽기 전용 함수 (가스비 없음)
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  // 쓰기 함수 (가스비 필요)
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  // 이벤트 (블록체인에 기록되는 로그)
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Approval",
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

// TokenFaucet ABI (퍼셋 컨트랙트 전용)
export const FAUCET_ABI = [
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimAmount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "cooldownTime",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "faucetBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "nextClaimTime",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "lastClaimTime",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "token",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "TokensClaimed",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokensDeposited",
    type: "event",
    inputs: [
      { name: "depositor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

// 컨트랙트 주소 관리 (localStorage 기반)
const STORAGE_KEY = "erc20-tutorial-contracts";

interface ContractAddresses {
  token: string;
  faucet: string;
}

// 저장된 컨트랙트 주소 가져오기 (손상된 데이터 방어)
export function getContractAddresses(): ContractAddresses {
  const fallback: ContractAddresses = { token: "", faucet: "" };
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.token === "string" &&
      typeof parsed.faucet === "string"
    ) {
      return parsed as ContractAddresses;
    }
    // 스키마 불일치 시 초기화
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  } catch {
    // JSON 파싱 실패 시 손상된 데이터 제거
    localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

// 컨트랙트 주소 저장하기
export function setContractAddresses(addresses: Partial<ContractAddresses>) {
  const current = getContractAddresses();
  const updated = { ...current, ...addresses };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
