"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import type { Address } from "viem";
import { FAUCET_ABI } from "@/lib/contracts";
import type { FaucetStatus } from "@/types";

// 퍼셋 컨트랙트 읽기 + 쓰기 훅
export function useFaucetContract(faucetAddress: string) {
  const { address: userAddress } = useAccount();

  // 주소 유효성 검사
  const enabled = !!faucetAddress && faucetAddress.startsWith("0x") && faucetAddress.length === 42;
  const address = faucetAddress as Address;

  // 퍼셋 토큰 잔여량 조회
  const { data: faucetBalance, refetch: refetchBalance } = useReadContract({
    address,
    abi: FAUCET_ABI,
    functionName: "faucetBalance",
    query: { enabled },
  });

  // 1회 배포량 조회
  const { data: claimAmount } = useReadContract({
    address,
    abi: FAUCET_ABI,
    functionName: "claimAmount",
    query: { enabled },
  });

  // 쿨다운 시간 조회 (초 단위)
  const { data: cooldownTime } = useReadContract({
    address,
    abi: FAUCET_ABI,
    functionName: "cooldownTime",
    query: { enabled },
  });

  // 현재 사용자의 다음 요청 가능 시간 조회
  const { data: nextClaimTime, refetch: refetchNextClaimTime } = useReadContract({
    address,
    abi: FAUCET_ABI,
    functionName: "nextClaimTime",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: enabled && !!userAddress },
  });

  // claim 트랜잭션 쓰기 훅
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // 트랜잭션 완료 대기
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // 현재 시각 기준 클레임 가능 여부 계산
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const canClaim =
    enabled &&
    !!userAddress &&
    (nextClaimTime === undefined || nextClaimTime === 0n || nowSec >= nextClaimTime) &&
    !!faucetBalance &&
    !!claimAmount &&
    faucetBalance >= claimAmount;

  // FaucetStatus 타입으로 정리
  const faucetStatus: FaucetStatus = {
    balance: (faucetBalance as bigint | undefined) ?? 0n,
    claimAmount: (claimAmount as bigint | undefined) ?? 0n,
    cooldownTime: (cooldownTime as bigint | undefined) ?? 0n,
    nextClaimTime: (nextClaimTime as bigint | undefined) ?? 0n,
    canClaim,
  };

  // claim() 호출 함수
  const claim = () => {
    if (!enabled) return;
    writeContract({
      address,
      abi: FAUCET_ABI,
      functionName: "claim",
    });
  };

  // 성공 후 데이터 갱신
  const refetch = () => {
    refetchBalance();
    refetchNextClaimTime();
  };

  // 에러 메시지 파싱 (사용자 친화적 표시)
  const getErrorMessage = (err: Error | null): string => {
    if (!err) return "";
    const msg = err.message.toLowerCase();
    if (msg.includes("쿨다운") || msg.includes("cooldown")) {
      return "아직 쿨다운 중입니다. 잠시 후 다시 시도해 주세요.";
    }
    if (msg.includes("부족") || msg.includes("insufficient")) {
      return "퍼셋에 토큰이 부족합니다. 관리자에게 문의하세요.";
    }
    if (msg.includes("user rejected") || msg.includes("user denied")) {
      return "사용자가 트랜잭션을 거부했습니다.";
    }
    return "클레임에 실패했습니다. 다시 시도해 주세요.";
  };

  // 포맷팅 유틸
  const formatAmount = (amount: bigint, decimals: number = 18): string =>
    formatUnits(amount, decimals);

  // 쿨다운 남은 시간 (초)
  const remainingCooldown =
    nextClaimTime && nextClaimTime > nowSec ? Number(nextClaimTime - nowSec) : 0;

  return {
    faucetStatus,
    claim,
    refetch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    getErrorMessage,
    formatAmount,
    remainingCooldown,
  };
}
