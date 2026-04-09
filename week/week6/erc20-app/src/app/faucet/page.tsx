"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getContractAddresses, setContractAddresses } from "@/lib/contracts";
import FaucetStatusCard from "@/components/faucet/FaucetStatus";
import FaucetClaim from "@/components/faucet/FaucetClaim";
import { useFaucetContract } from "@/hooks/useFaucetContract";

// TokenFaucet.sol 소스 코드 (한국어 주석 포함)
const FAUCET_SOL_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenFaucet - 토큰 퍼셋 (수도꼭지)
 * @notice 테스트용 토큰을 무료로 받을 수 있는 퍼셋입니다.
 *
 * 동작 흐름:
 * 1. owner가 퍼셋에 토큰을 충전 (deposit)
 * 2. 사용자가 토큰 요청 (claim)
 * 3. 24시간 쿨다운 후 재요청 가능
 *
 * 비유: 학교 정수기에서 물을 받는 것과 비슷합니다.
 *       - 한 번에 일정량만 받을 수 있고 (claimAmount)
 *       - 너무 자주 받으면 안 되고 (cooldownTime)
 *       - 물이 떨어지면 관리자가 채워야 합니다 (deposit)
 */
contract TokenFaucet is Ownable {
    // 배포할 ERC20 토큰의 컨트랙트 참조
    IERC20 public token;

    // 한 번에 받을 수 있는 토큰 수량 (기본: 100 토큰)
    uint256 public claimAmount = 100 * 10 ** 18;

    // 재요청 대기 시간 (기본: 24시간 = 86400초)
    uint256 public cooldownTime = 24 hours;

    // 각 주소별 마지막 요청 시간 기록
    // mapping = 키-값 저장소 (주소 → 시간)
    mapping(address => uint256) public lastClaimTime;

    // 이벤트: 토큰이 배포될 때 발생 (프론트엔드에서 감지 가능)
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    // 이벤트: 퍼셋에 토큰이 충전될 때 발생
    event TokensDeposited(address indexed depositor, uint256 amount);

    // 생성자: 배포할 ERC20 토큰 주소를 받아 초기화
    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
    }

    /**
     * @notice 토큰 요청 (claim)
     * @dev 쿨다운 확인 → 잔액 확인 → 토큰 전송 → 시간 기록
     *
     * require = 조건이 거짓이면 트랜잭션 취소 (가스비 환불)
     * block.timestamp = 현재 블록의 시간 (초 단위 유닉스 타임스탬프)
     */
    function claim() external {
        // 1. 쿨다운 확인: 마지막 요청 시간 + 대기시간 < 현재 시간
        require(
            block.timestamp >= lastClaimTime[msg.sender] + cooldownTime,
            unicode"아직 쿨다운 중입니다. 24시간 후에 다시 시도하세요."
        );

        // 2. 퍼셋 잔액 확인: 퍼셋이 보유한 토큰이 충분한지
        require(
            token.balanceOf(address(this)) >= claimAmount,
            unicode"퍼셋에 토큰이 부족합니다. 관리자에게 문의하세요."
        );

        // 3. 마지막 요청 시간 업데이트 (재진입 공격 방지를 위해 전송 전에 기록)
        lastClaimTime[msg.sender] = block.timestamp;

        // 4. 토큰 전송: 퍼셋 → 요청자
        require(
            token.transfer(msg.sender, claimAmount),
            unicode"토큰 전송에 실패했습니다."
        );

        // 5. 이벤트 발생 (프론트엔드에서 이 이벤트를 감지하여 UI 업데이트)
        emit TokensClaimed(msg.sender, claimAmount, block.timestamp);
    }

    /**
     * @notice 퍼셋에 토큰 충전 (owner 전용)
     * @dev 호출 전에 token.approve(faucetAddress, amount) 필요!
     */
    function deposit(uint256 amount) external onlyOwner {
        require(
            token.transferFrom(msg.sender, address(this), amount),
            unicode"토큰 충전에 실패했습니다. approve를 먼저 호출하세요."
        );
        emit TokensDeposited(msg.sender, amount);
    }

    // 퍼셋의 토큰 잔액 조회
    function faucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // 특정 주소의 다음 요청 가능 시간 조회 (0이면 즉시 가능)
    function nextClaimTime(address user) external view returns (uint256) {
        uint256 lastClaim = lastClaimTime[user];
        if (lastClaim == 0) return 0;
        return lastClaim + cooldownTime;
    }
}`;

// 퍼셋 메인 페이지
export default function FaucetPage() {
  const { address, isConnected } = useAccount();

  // 입력 중인 퍼셋 컨트랙트 주소
  const [inputAddress, setInputAddress] = useState("");
  // 실제 적용된 퍼셋 컨트랙트 주소
  const [faucetAddress, setFaucetAddress] = useState("");
  // 토큰 심볼 (추후 확장 가능)
  const [tokenSymbol] = useState("TOKEN");

  // 퍼셋 온체인 상태 조회
  const { faucetStatus } = useFaucetContract(faucetAddress);

  // 마운트 시 localStorage에서 저장된 퍼셋 주소 불러오기
  useEffect(() => {
    const saved = getContractAddresses();
    if (saved.faucet) {
      setInputAddress(saved.faucet);
      setFaucetAddress(saved.faucet);
    }
  }, []);

  // 주소 유효성 검사
  const isValidAddress =
    !!inputAddress && inputAddress.startsWith("0x") && inputAddress.length === 42;

  // 퍼셋 컨트랙트 주소 적용 및 localStorage 저장
  const handleApplyAddress = () => {
    if (!isValidAddress) return;
    setContractAddresses({ faucet: inputAddress });
    setFaucetAddress(inputAddress);
  };

  // 지갑 미연결 시 안내 페이지
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">토큰 퍼셋</h1>
        <p className="mb-6 text-muted-foreground">
          테스트용 ERC20 토큰을 무료로 받을 수 있습니다.
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
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">토큰 퍼셋</h1>
          <Badge variant="secondary">Sepolia 테스트넷</Badge>
        </div>
        <p className="text-muted-foreground">
          퍼셋(Faucet)은 &quot;수도꼭지&quot;라는 뜻입니다. 학교 정수기처럼 일정량의 토큰을
          무료로 받을 수 있으며, 하루에 한 번만 요청할 수 있습니다.
        </p>
      </div>

      {/* 연결된 지갑 주소 */}
      <div className="text-sm text-muted-foreground">
        연결된 지갑:{" "}
        <span className="font-mono">{address}</span>
      </div>

      <Separator />

      {/* 퍼셋 컨트랙트 주소 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">퍼셋 컨트랙트 주소</CardTitle>
          <CardDescription>
            배포한 TokenFaucet 컨트랙트 주소를 입력하세요. 입력값은 브라우저에 저장됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
              disabled={!isValidAddress}
            >
              적용
            </Button>
          </div>
          {faucetAddress && faucetAddress !== inputAddress && (
            <p className="text-xs text-muted-foreground">
              현재 적용된 주소:{" "}
              <span className="font-mono">{faucetAddress}</span>
            </p>
          )}
          {!faucetAddress && (
            <p className="text-xs text-muted-foreground">
              퍼셋을 아직 배포하지 않으셨나요?{" "}
              <Link href="/deploy-guide" className="underline font-medium">
                배포 가이드 보기 →
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* 주소 미설정 시 안내 */}
      {!faucetAddress && (
        <Alert>
          <AlertDescription>
            위에서 퍼셋 컨트랙트 주소를 입력하고 &quot;적용&quot; 버튼을 눌러주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 퍼셋 상태 + 클레임 섹션 */}
      {faucetAddress && (
        <>
          {/* 퍼셋 상태 카드 */}
          <FaucetStatusCard
            status={faucetStatus}
            tokenSymbol={tokenSymbol}
          />

          {/* 클레임 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">토큰 받기</CardTitle>
              <CardDescription>
                버튼을 눌러 테스트용 토큰을 받으세요. 24시간마다 한 번 요청할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaucetClaim
                faucetAddress={faucetAddress}
                tokenSymbol={tokenSymbol}
              />
            </CardContent>
          </Card>
        </>
      )}

      <Separator />

      {/* TokenFaucet.sol 코드 블록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TokenFaucet.sol 소스 코드</CardTitle>
          <CardDescription>
            이 퍼셋 페이지가 상호작용하는 스마트 컨트랙트 코드입니다.
            한국어 주석으로 동작 원리를 설명합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
            <code>{FAUCET_SOL_CODE}</code>
          </pre>
        </CardContent>
      </Card>

      {/* 하단: 배포 가이드 링크 */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium">퍼셋을 아직 배포하지 않으셨나요?</p>
            <p className="text-xs text-muted-foreground">
              Remix IDE 또는 Hardhat을 사용하여 TokenFaucet 컨트랙트를 Sepolia에 배포할 수 있습니다.
            </p>
            <Link
              href="/deploy-guide"
              className={buttonVariants({ variant: "outline" })}
            >
              먼저 퍼셋을 배포하세요 →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
