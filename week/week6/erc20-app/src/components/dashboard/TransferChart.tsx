"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransferEvent } from "@/types";
import { formatUnits } from "viem";

interface TransferChartProps {
  events: TransferEvent[];
  decimals?: number;
}

interface ChartEntry {
  block: string;
  volume: number;
  count: number;
}

// Transfer 이벤트를 블록 번호별로 집계하여 차트 데이터로 변환
function aggregateByBlock(
  events: TransferEvent[],
  decimals: number
): ChartEntry[] {
  const blockMap = new Map<string, { volume: number; count: number }>();

  for (const event of events) {
    // 블록 번호를 1000 단위로 그룹핑하여 가독성 향상
    const blockGroup =
      (BigInt(event.blockNumber) / 1000n * 1000n).toString();
    const volumeNum = parseFloat(formatUnits(event.value, decimals));
    const existing = blockMap.get(blockGroup);

    if (existing) {
      existing.volume += volumeNum;
      existing.count += 1;
    } else {
      blockMap.set(blockGroup, { volume: volumeNum, count: 1 });
    }
  }

  // 블록 번호 오름차순 정렬 후 최근 20개만 표시
  return Array.from(blockMap.entries())
    .sort(([a], [b]) => Number(BigInt(a) - BigInt(b)))
    .slice(-20)
    .map(([block, data]) => ({
      block: `#${block}`,
      volume: Math.round(data.volume * 10000) / 10000,
      count: data.count,
    }));
}

// Transfer 이벤트 볼륨을 블록별 막대 차트로 시각화하는 컴포넌트
export default function TransferChart({
  events,
  decimals = 18,
}: TransferChartProps) {
  const chartData = aggregateByBlock(events, decimals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>전송량 차트</CardTitle>
        <p className="text-sm text-muted-foreground">
          블록별 토큰 전송 볼륨 (최근 20개 그룹)
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          // 빈 데이터 처리
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            차트 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 40 }}
            >
              <XAxis
                dataKey="block"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(value) => [
                  typeof value === "number"
                    ? value.toLocaleString("ko-KR")
                    : String(value),
                  "전송량",
                ]}
                labelFormatter={(label) => `블록 ${label}`}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="volume"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="전송량"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
