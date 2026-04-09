"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getContractAddresses, setContractAddresses } from "@/lib/contracts";
import TokenInfoCard from "@/components/token/TokenInfoCard";
import TransferForm from "@/components/token/TransferForm";
import ApproveForm from "@/components/token/ApproveForm";
import AllowanceChecker from "@/components/token/AllowanceChecker";

// 토큰 상호작용 메인 페이지
export default function TokenInteractPage() {
  const { address, isConnected } = useAccount();

  // 컨트랙트 주소 상태 (입력 중인 값)
  const [inputAddress, setInputAddress] = useState("");
  // 실제 적용된 컨트랙트 주소
  const [tokenAddress, setTokenAddress] = useState("");

  // 마운트 시 localStorage에서 저장된 주소 불러오기
  useEffect(() => {
    const saved = getContractAddresses();
    if (saved.token) {
      setInputAddress(saved.token);
      setTokenAddress(saved.token);
    }
  }, []);

  // 컨트랙트 주소 적용 및 localStorage 저장
  const handleApplyAddress = () => {
    if (!inputAddress || !inputAddress.startsWith("0x") || inputAddress.length !== 42) {
      return;
    }
    setContractAddresses({ token: inputAddress });
    setTokenAddress(inputAddress);
  };

  // 지갑 미연결 시 안내 메시지 표시
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">토큰 상호작용</h1>
        <p className="mb-6 text-muted-foreground">
          ERC20 토큰을 전송하고, 승인하고, 허용량을 확인합니다.
        </p>
        <Alert>
          <AlertDescription>
            지갑이 연결되지 않았습니다. 상단의 &quot;메타마스크 연결&quot; 버튼으로 지갑을 연결해 주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">토큰 상호작용</h1>
      <p className="mb-6 text-muted-foreground">
        ERC20 토큰을 전송하고, 승인하고, 허용량을 확인합니다.
      </p>

      {/* 연결된 지갑 주소 표시 */}
      <div className="mb-4 text-sm text-muted-foreground">
        연결된 지갑: <span className="font-mono">{address}</span>
      </div>

      {/* 컨트랙트 주소 입력 섹션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">컨트랙트 주소 설정</CardTitle>
          <CardDescription>
            상호작용할 ERC20 토큰의 컨트랙트 주소를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="font-mono"
            />
            <Button
              type="button"
              onClick={handleApplyAddress}
              disabled={
                !inputAddress ||
                !inputAddress.startsWith("0x") ||
                inputAddress.length !== 42
              }
            >
              적용
            </Button>
          </div>
          {tokenAddress && tokenAddress !== inputAddress && (
            <p className="mt-2 text-xs text-muted-foreground">
              현재 적용된 주소: <span className="font-mono">{tokenAddress}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* 토큰 정보 카드 */}
      {tokenAddress && (
        <div className="mb-6">
          <TokenInfoCard tokenAddress={tokenAddress} />
        </div>
      )}

      <Separator className="mb-6" />

      {/* 주소 미설정 시 안내 */}
      {!tokenAddress && (
        <Alert>
          <AlertDescription>
            위에서 컨트랙트 주소를 입력하고 &quot;적용&quot; 버튼을 눌러주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 탭: 전송 / 승인 / 허용량 조회 */}
      {tokenAddress && (
        <Tabs defaultValue="transfer">
          <TabsList className="w-full">
            <TabsTrigger value="transfer" className="flex-1">전송</TabsTrigger>
            <TabsTrigger value="approve" className="flex-1">승인</TabsTrigger>
            <TabsTrigger value="allowance" className="flex-1">허용량 조회</TabsTrigger>
          </TabsList>

          {/* 전송 탭 */}
          <TabsContent value="transfer">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">토큰 전송</CardTitle>
                <CardDescription>
                  다른 주소로 토큰을 전송합니다. (transfer 함수)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransferForm tokenAddress={tokenAddress} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 승인 탭 */}
          <TabsContent value="approve">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">토큰 승인</CardTitle>
                <CardDescription>
                  특정 주소가 내 토큰을 사용할 수 있도록 허용량을 설정합니다. (approve 함수)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApproveForm tokenAddress={tokenAddress} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 허용량 조회 탭 */}
          <TabsContent value="allowance">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">허용량 조회</CardTitle>
                <CardDescription>
                  owner가 spender에게 허용한 토큰 수량을 조회합니다. (allowance 함수)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AllowanceChecker tokenAddress={tokenAddress} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
