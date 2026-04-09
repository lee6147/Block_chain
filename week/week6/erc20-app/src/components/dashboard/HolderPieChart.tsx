"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUnits } from "viem";
import type { TransferEvent } from "@/types";

interface HolderPieChartProps {
  events: TransferEvent[];
  decimals?: number;
}

interface PieEntry {
  name: string;
  value: number;
  fullAddress: string;
}

// 파이 차트 색상 팔레트
const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#94a3b8",
];

// 주소 축약
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Transfer 이벤트로부터 보유자별 잔액 추정 (from에서 빼고 to에 더하기)
function computeHolderBalances(
  events: TransferEvent[],
  decimals: number
): PieEntry[] {
  const balanceMap = new Map<string, bigint>();

  for (const event of events) {
    // 영주소(0x000...)는 민팅/소각이므로 제외하지 않고 포함 (선택적)
    const fromBalance = balanceMap.get(event.from) ?? 0n;
    balanceMap.set(
      event.from,
      fromBalance - event.value < 0n ? 0n : fromBalance - event.value
    );

    const toBalance = balanceMap.get(event.to) ?? 0n;
    balanceMap.set(event.to, toBalance + event.value);
  }

  // 잔액 0 이하 제거 및 내림차순 정렬
  const sorted = Array.from(balanceMap.entries())
    .filter(([, bal]) => bal > 0n)
    .sort(([, a], [, b]) => (b > a ? 1 : b < a ? -1 : 0));

  const top5 = sorted.slice(0, 5);
  const rest = sorted.slice(5);

  // 상위 5개 항목
  const entries: PieEntry[] = top5.map(([address, balance]) => ({
    name: shortenAddress(address),
    fullAddress: address,
    value:
      Math.round(
        parseFloat(formatUnits(balance, decimals)) * 10000
      ) / 10000,
  }));

  // 나머지를 "기타"로 묶기
  if (rest.length > 0) {
    const othersTotal = rest.reduce((acc, [, bal]) => acc + bal, 0n);
    entries.push({
      name: "기타",
      fullAddress: "",
      value:
        Math.round(
          parseFloat(formatUnits(othersTotal, decimals)) * 10000
        ) / 10000,
    });
  }

  return entries;
}

// 커스텀 툴팁 타입
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieEntry;
    value: number;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background p-2 text-xs shadow-md">
      <p className="font-medium">{data.payload.fullAddress || data.payload.name}</p>
      <p className="text-muted-foreground">
        잔액: {data.value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

// 보유자 분포 파이 차트 컴포넌트
export default function HolderPieChart({
  events,
  decimals = 18,
}: HolderPieChartProps) {
  const pieData = computeHolderBalances(events, decimals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>보유자 분포</CardTitle>
        <p className="text-sm text-muted-foreground">
          상위 5개 주소 + 기타 (추정 잔액 기준)
        </p>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          // 빈 데이터 처리
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            보유자 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
