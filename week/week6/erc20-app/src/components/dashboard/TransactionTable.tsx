"use client";

import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransferEvent } from "@/types";
import { formatAmount } from "@/hooks/useTokenEvents";

interface TransactionTableProps {
  events: TransferEvent[];
  decimals?: number;
}

// 주소 축약 표시: 0x1234...5678
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Transfer 이벤트 목록을 테이블로 표시하는 컴포넌트
export default function TransactionTable({
  events,
  decimals = 18,
}: TransactionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          거래 내역
          <Badge variant="secondary">{events.length}건</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          // 빈 데이터 안내
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">아직 거래 내역이 없습니다.</p>
            <p className="mt-1 text-xs">
              컨트랙트 주소를 입력하거나 토큰 전송을 시도해보세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">From</th>
                  <th className="pb-3 pr-4 font-medium">To</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr
                    key={`${event.transactionHash}-${index}`}
                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                  >
                    {/* From 주소 */}
                    <td className="py-3 pr-4">
                      <span
                        className="font-mono text-xs"
                        title={event.from}
                      >
                        {shortenAddress(event.from)}
                      </span>
                    </td>
                    {/* To 주소 */}
                    <td className="py-3 pr-4">
                      <span
                        className="font-mono text-xs"
                        title={event.to}
                      >
                        {shortenAddress(event.to)}
                      </span>
                    </td>
                    {/* 전송량 */}
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs font-medium">
                        {formatAmount(event.value, decimals)}
                      </span>
                    </td>
                    {/* Tx Hash - Sepolia Etherscan 링크 */}
                    <td className="py-3">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                        title={event.transactionHash}
                      >
                        {shortenAddress(event.transactionHash)}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
