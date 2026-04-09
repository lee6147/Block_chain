"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { RefreshCw, Wallet, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getContractAddresses, setContractAddresses } from "@/lib/contracts";
import { useTokenEvents } from "@/hooks/useTokenEvents";
import TokenStatsCard from "@/components/dashboard/TokenStatsCard";
import TransferChart from "@/components/dashboard/TransferChart";
import HolderPieChart from "@/components/dashboard/HolderPieChart";
import TransactionTable from "@/components/dashboard/TransactionTable";

// 대시보드 메인 페이지: 토큰 Transfer 이벤트 시각화
export default function DashboardPage() {
  const { isConnected } = useAccount();

  // localStorage에서 컨트랙트 주소 초기화
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [inputAddress, setInputAddress] = useState<string>("");

  // 컴포넌트 마운트 시 localStorage에서 주소 복원
  useEffect(() => {
    const saved = getContractAddresses();
    if (saved.token) {
      setTokenAddress(saved.token);
      setInputAddress(saved.token);
    }
  }, []);

  // Transfer 이벤트 조회 훅
  const { events, isLoading, error, refetch } = useTokenEvents(tokenAddress);

  // 주소 적용 핸들러 (localStorage에 저장)
  function handleApplyAddress() {
    const trimmed = inputAddress.trim();
    setTokenAddress(trimmed);
    if (trimmed) {
      setContractAddresses({ token: trimmed });
    }
  }

  // Enter 키 입력 처리
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleApplyAddress();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">거래 내역 대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ERC20 토큰의 Transfer 이벤트를 실시간으로 조회하고 시각화합니다.
        </p>
      </div>

      {/* 컨트랙트 주소 입력 영역 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                토큰 컨트랙트 주소
              </label>
              <Input
                placeholder="0x... (ERC20 토큰 컨트랙트 주소 입력)"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyAddress} disabled={!inputAddress.trim()}>
                <Search className="mr-2 h-4 w-4" />
                조회
              </Button>
              <Button
                variant="outline"
                onClick={refetch}
                disabled={!tokenAddress || isLoading}
                title="새로고침"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* 주소 미입력 안내 */}
          {!tokenAddress && (
            <p className="mt-2 text-xs text-muted-foreground">
              조회할 ERC20 토큰 컨트랙트 주소를 입력하세요.
            </p>
          )}

          {/* 에러 메시지 */}
          {error && (
            <p className="mt-2 text-xs text-destructive">
              오류: {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 지갑 미연결 안내 */}
      {!isConnected && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <Wallet className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                지갑이 연결되지 않았습니다.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                상단 내비게이션에서 MetaMask를 연결하면 더 많은 기능을 사용할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주소가 입력된 경우에만 데이터 표시 */}
      {tokenAddress ? (
        <div className="space-y-6">
          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-sm">이벤트를 조회하는 중입니다...</span>
            </div>
          )}

          {/* 데이터 로드 완료 후 표시 */}
          {!isLoading && (
            <>
              {/* 통계 요약 카드 */}
              <section>
                <h2 className="mb-3 text-base font-semibold">통계 요약</h2>
                <TokenStatsCard events={events} />
              </section>

              <Separator />

              {/* 차트 2열 그리드 */}
              <section>
                <h2 className="mb-3 text-base font-semibold">시각화</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <TransferChart events={events} />
                  <HolderPieChart events={events} />
                </div>
              </section>

              <Separator />

              {/* 전체 거래 목록 테이블 */}
              <section>
                <h2 className="mb-3 text-base font-semibold">전체 거래 목록</h2>
                <TransactionTable events={events} />
              </section>
            </>
          )}
        </div>
      ) : (
        // 주소 미입력 시 안내 메시지
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Search className="mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">컨트랙트 주소를 입력해주세요.</p>
          <p className="mt-1 text-xs">
            위 입력창에 ERC20 토큰 주소를 입력하면 거래 내역을 확인할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
