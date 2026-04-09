"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTokenRead, formatTokenAmount } from "@/hooks/useTokenContract";

interface TokenInfoCardProps {
  tokenAddress: string;
}

// 토큰 기본 정보를 카드 형태로 표시하는 컴포넌트
export default function TokenInfoCard({ tokenAddress }: TokenInfoCardProps) {
  const { name, symbol, decimals, totalSupply, isLoading, isError } = useTokenRead(tokenAddress);

  // 컨트랙트 주소가 없으면 렌더링하지 않음
  if (!tokenAddress || !tokenAddress.startsWith("0x")) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">토큰 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          토큰 정보를 불러오지 못했습니다. 컨트랙트 주소를 확인해 주세요.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">토큰 정보</CardTitle>
          {symbol && (
            <Badge variant="secondary">{symbol}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* 토큰 이름 */}
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">이름</dt>
            <dd className="text-sm font-medium">{name ?? "-"}</dd>
          </div>

          {/* 심볼 */}
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">심볼</dt>
            <dd className="text-sm font-medium">{symbol ?? "-"}</dd>
          </div>

          {/* 소수점 자리수 */}
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">소수점</dt>
            <dd className="text-sm font-medium">{decimals ?? "-"}</dd>
          </div>

          {/* 총 발행량 */}
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">총 발행량</dt>
            <dd className="text-sm font-medium break-all">
              {totalSupply !== undefined
                ? `${formatTokenAmount(totalSupply, decimals ?? 18)} ${symbol ?? ""}`
                : "-"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
