"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUnits } from "viem";
import type { TransferEvent } from "@/types";

interface TokenStatsCardProps {
  events: TransferEvent[];
  decimals?: number;
}

interface StatItem {
  label: string;
  value: string;
  description: string;
}

// Transfer 이벤트에서 통계 데이터 계산
function computeStats(events: TransferEvent[], decimals: number): StatItem[] {
  if (events.length === 0) {
    return [
      { label: "총 전송 횟수", value: "0", description: "Transfer 이벤트 수" },
      { label: "고유 주소 수", value: "0", description: "참여 지갑 주소" },
      { label: "최대 전송량", value: "0", description: "단일 트랜잭션 최대값" },
    ];
  }

  // 총 전송 횟수
  const totalCount = events.length;

  // 고유 주소 수 (from + to 합집합)
  const addressSet = new Set<string>();
  for (const event of events) {
    addressSet.add(event.from);
    addressSet.add(event.to);
  }
  const uniqueAddresses = addressSet.size;

  // 최대 전송량 (bigint 비교)
  const maxValue = events.reduce(
    (max, event) => (event.value > max ? event.value : max),
    0n
  );
  const maxFormatted = parseFloat(formatUnits(maxValue, decimals));

  return [
    {
      label: "총 전송 횟수",
      value: totalCount.toLocaleString("ko-KR"),
      description: "Transfer 이벤트 수",
    },
    {
      label: "고유 주소 수",
      value: uniqueAddresses.toLocaleString("ko-KR"),
      description: "참여 지갑 주소",
    },
    {
      label: "최대 전송량",
      value: maxFormatted.toLocaleString("ko-KR", { maximumFractionDigits: 4 }),
      description: "단일 트랜잭션 최대값",
    },
  ];
}

// 토큰 통계 요약 카드 그리드 컴포넌트
export default function TokenStatsCard({
  events,
  decimals = 18,
}: TokenStatsCardProps) {
  const stats = computeStats(events, decimals);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
