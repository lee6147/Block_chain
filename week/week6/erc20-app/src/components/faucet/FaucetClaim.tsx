"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useFaucetContract } from "@/hooks/useFaucetContract";

interface FaucetClaimProps {
  // 퍼셋 컨트랙트 주소
  faucetAddress: string;
  // 토큰 심볼 (표시용)
  tokenSymbol?: string;
  // 클레임 성공 시 부모 컴포넌트에 알림
  onSuccess?: () => void;
}

// 남은 초를 "시:분:초" 형태로 변환
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// 토큰 클레임 버튼 + 상태 표시 컴포넌트
export default function FaucetClaim({
  faucetAddress,
  tokenSymbol = "TOKEN",
  onSuccess,
}: FaucetClaimProps) {
  const {
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
  } = useFaucetContract(faucetAddress);

  // 쿨다운 카운트다운 상태 (초 단위)
  const [countdown, setCountdown] = useState<number>(0);

  // remainingCooldown 변경 시 카운트다운 초기화
  useEffect(() => {
    setCountdown(remainingCooldown);
  }, [remainingCooldown]);

  // 1초마다 카운트다운 감소
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 쿨다운 종료 시 온체인 데이터 재조회
          refetch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, refetch]);

  // 클레임 성공 시 데이터 갱신 + 부모 콜백 호출
  useEffect(() => {
    if (isSuccess) {
      refetch();
      onSuccess?.();
    }
  }, [isSuccess, refetch, onSuccess]);

  // 쿨다운 진행률 (0~100)
  const totalCooldown = Number(faucetStatus.cooldownTime);
  const cooldownProgress =
    totalCooldown > 0
      ? Math.max(0, Math.min(100, ((totalCooldown - countdown) / totalCooldown) * 100))
      : 100;

  const isCoolingDown = countdown > 0;
  const isDisabled = isPending || isConfirming || isCoolingDown || !faucetStatus.canClaim;

  // 버튼 텍스트 결정
  const getButtonLabel = (): string => {
    if (isPending) return "서명 대기 중...";
    if (isConfirming) return "블록 확인 중...";
    if (isCoolingDown) return `쿨다운 중 (${formatCountdown(countdown)})`;
    if (!faucetStatus.canClaim && faucetStatus.balance === 0n) return "토큰 소진됨";
    return `토큰 받기 (${formatAmount(faucetStatus.claimAmount)} ${tokenSymbol})`;
  };

  return (
    <div className="space-y-4">
      {/* 쿨다운 진행 바 */}
      {isCoolingDown && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>쿨다운 진행</span>
            <span>{formatCountdown(countdown)} 남음</span>
          </div>
          <Progress value={cooldownProgress} className="h-2" />
        </div>
      )}

      {/* 트랜잭션 대기 상태 */}
      {isPending && (
        <Alert>
          <AlertDescription>
            지갑에서 트랜잭션을 확인해 주세요...
          </AlertDescription>
        </Alert>
      )}

      {/* 블록 확인 중 상태 */}
      {isConfirming && (
        <Alert>
          <AlertDescription>
            블록에 포함되는 중입니다. 잠시만 기다려 주세요...
          </AlertDescription>
        </Alert>
      )}

      {/* 성공 상태 - Etherscan 링크 표시 */}
      {isSuccess && hash && (
        <Alert>
          <AlertDescription>
            <span className="font-medium text-green-700">
              {formatAmount(faucetStatus.claimAmount)} {tokenSymbol} 수령 완료!
            </span>{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Etherscan에서 확인하기 →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* 에러 상태 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {/* 토큰 클레임 버튼 */}
      <Button
        type="button"
        onClick={claim}
        disabled={isDisabled}
        className="w-full"
        size="lg"
      >
        {getButtonLabel()}
      </Button>

      {/* 쿨다운 안내 텍스트 */}
      {isCoolingDown && (
        <p className="text-center text-xs text-muted-foreground">
          24시간마다 한 번씩 토큰을 받을 수 있습니다.
        </p>
      )}
    </div>
  );
}
