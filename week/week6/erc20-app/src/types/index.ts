// 토큰 기본 정보 타입
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  address: string;
}

// Transfer 이벤트 로그 타입
export interface TransferEvent {
  from: string;
  to: string;
  value: bigint;
  transactionHash: string;
  blockNumber: bigint;
  timestamp?: number;
}

// 튜토리얼 단계 타입
export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  codeExample?: string;
  simpleExplanation?: string; // 비유 설명
  technicalExplanation?: string; // 정석 설명
}

// 퀴즈 문제 타입
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "concept" | "code" | "practice";
}

// 퍼셋 상태 타입
export interface FaucetStatus {
  balance: bigint;
  claimAmount: bigint;
  cooldownTime: bigint;
  nextClaimTime: bigint;
  canClaim: boolean;
}

// 거래 내역 차트 데이터
export interface ChartDataPoint {
  date: string;
  transfers: number;
  volume: string;
}

// 보유자 분포 파이 차트 데이터
export interface HolderData {
  address: string;
  balance: string;
  percentage: number;
}
