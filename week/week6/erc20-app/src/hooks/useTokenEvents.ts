"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";
import type { Address } from "viem";
import type { TransferEvent } from "@/types";

interface UseTokenEventsReturn {
  events: TransferEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /** true이면 전체 히스토리가 아닌 최근 블록 범위만 조회된 결과 */
  isPartialHistory: boolean;
}

// 최근 블록의 Transfer 이벤트를 조회하는 훅
// 주의: RPC 제한으로 최근 10,000 블록만 조회합니다 (전체 히스토리 아님)
const BLOCK_RANGE = 10000n;

export function useTokenEvents(tokenAddress: string): UseTokenEventsReturn {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<TransferEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPartialHistory, setIsPartialHistory] = useState(false);

  const fetchEvents = useCallback(async () => {
    // 주소 유효성 검사
    if (!tokenAddress || !tokenAddress.startsWith("0x") || !publicClient) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 현재 블록 번호 조회
      const currentBlock = await publicClient.getBlockNumber();
      // 최근 블록 범위 계산 (음수 방지)
      const fromBlock = currentBlock > BLOCK_RANGE ? currentBlock - BLOCK_RANGE : 0n;
      const isPartial = currentBlock > BLOCK_RANGE;

      // Transfer 이벤트 로그 조회 (parseAbiItem으로 이벤트 시그니처 파싱)
      const logs = await publicClient.getLogs({
        address: tokenAddress as Address,
        event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
        fromBlock,
        toBlock: currentBlock,
      });

      // 로그를 TransferEvent 타입으로 변환
      const transferEvents: TransferEvent[] = logs
        .filter(
          (log) =>
            log.args.from !== undefined &&
            log.args.to !== undefined &&
            log.args.value !== undefined &&
            log.transactionHash !== null &&
            log.blockNumber !== null
        )
        .map((log) => ({
          from: log.args.from as string,
          to: log.args.to as string,
          value: log.args.value as bigint,
          transactionHash: log.transactionHash as `0x${string}`,
          blockNumber: log.blockNumber as bigint,
        }))
        // 최신 블록 순으로 정렬
        .sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : -1));

      setEvents(transferEvents);
      setIsPartialHistory(isPartial);
    } catch (err) {
      const message = err instanceof Error ? err.message : "이벤트 조회 중 오류가 발생했습니다.";
      setError(message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, publicClient]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents, isPartialHistory };
}

// bigint 금액을 읽기 쉬운 문자열로 변환 (소수점 4자리)
export function formatAmount(value: bigint, decimals: number = 18): string {
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";
  return num.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
}
