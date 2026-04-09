"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { FaucetStatus as FaucetStatusType } from "@/types";

interface FaucetStatusProps {
  // 퍼셋 상태 데이터
  status: FaucetStatusType;
  // 토큰 심볼 (표시용)
  tokenSymbol?: string;
}

// 초 단위 시간을 사람이 읽기 좋은 형태로 변환
function formatDuration(seconds: bigint): string {
  const total = Number(seconds);
  if (total <= 0) return "0초";
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (secs > 0 && hours === 0) parts.push(`${secs}초`);
  return parts.join(" ");
}

// 토큰 수량을 소수점 2자리로 포맷팅
function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  if (amount === 0n) return "0";
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

// 퍼셋 상태 정보 카드 컴포넌트
export default function FaucetStatus({ status, tokenSymbol = "TOKEN" }: FaucetStatusProps) {
  const balanceFmt = formatTokenAmount(status.balance);
  const claimAmountFmt = formatTokenAmount(status.claimAmount);
  const cooldownFmt = formatDuration(status.cooldownTime);

  // 잔액 수준에 따른 배지 색상
  const getBalanceBadge = () => {
    if (status.balance === 0n) return { label: "소진됨", variant: "destructive" as const };
    if (status.balance < status.claimAmount * 10n) return { label: "부족", variant: "secondary" as const };
    return { label: "충분", variant: "default" as const };
  };

  const balanceBadge = getBalanceBadge();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">퍼셋 현황</CardTitle>
        <CardDescription>
          현재 퍼셋의 잔여 토큰과 배포 조건을 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 잔여 토큰량 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">잔여 토큰량</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium">
              {balanceFmt} {tokenSymbol}
            </span>
            <Badge variant={balanceBadge.variant}>{balanceBadge.label}</Badge>
          </div>
        </div>

        <Separator />

        {/* 1회 배포량 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">1회 배포량</span>
          <span className="font-mono font-medium">
            {claimAmountFmt} {tokenSymbol}
          </span>
        </div>

        <Separator />

        {/* 쿨다운 시간 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">재요청 대기 시간</span>
          <span className="font-mono font-medium">{cooldownFmt}</span>
        </div>

        {/* 잔액 부족 경고 */}
        {status.balance === 0n && (
          <>
            <Separator />
            <p className="text-xs text-destructive">
              퍼셋에 토큰이 소진되었습니다. 관리자가 토큰을 충전해야 합니다.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
