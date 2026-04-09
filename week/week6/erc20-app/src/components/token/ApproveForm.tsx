"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTokenWrite, useTokenRead } from "@/hooks/useTokenContract";

interface ApproveFormProps {
  tokenAddress: string;
}

// ERC20 토큰 승인(approve) 폼 컴포넌트
export default function ApproveForm({ tokenAddress }: ApproveFormProps) {
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  const { decimals } = useTokenRead(tokenAddress);
  const { approve, hash, isPending, isConfirming, isSuccess, error } = useTokenWrite();

  // 입력값 유효성 검사 후 approve 트랜잭션 전송
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (!spender || !spender.startsWith("0x") || spender.length !== 42) {
      setValidationError("올바른 이더리움 주소(spender)를 입력해 주세요.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount < 0) {
      setValidationError("0 이상의 수량을 입력해 주세요.");
      return;
    }

    approve(tokenAddress, spender, amount, decimals ?? 18);
  };

  // 에러 메시지 파싱
  const getErrorMessage = (err: Error | null): string => {
    if (!err) return "";
    const msg = err.message.toLowerCase();
    if (msg.includes("user rejected") || msg.includes("user denied")) {
      return "사용자가 트랜잭션을 거부했습니다.";
    }
    if (msg.includes("invalid address")) {
      return "올바르지 않은 주소입니다.";
    }
    return "트랜잭션 전송에 실패했습니다. 다시 시도해 주세요.";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 승인 대상 주소 입력 */}
      <div className="space-y-1">
        <label htmlFor="approve-spender" className="text-sm font-medium">
          승인할 주소 (spender)
        </label>
        <Input
          id="approve-spender"
          placeholder="0x..."
          value={spender}
          onChange={(e) => setSpender(e.target.value)}
          disabled={isPending || isConfirming}
        />
      </div>

      {/* 승인 수량 입력 */}
      <div className="space-y-1">
        <label htmlFor="approve-amount" className="text-sm font-medium">
          승인 수량 (amount)
        </label>
        <Input
          id="approve-amount"
          type="number"
          placeholder="0.0"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isPending || isConfirming}
        />
      </div>

      {/* 유효성 검사 에러 */}
      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* 컨트랙트 에러 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {/* 트랜잭션 대기 중 상태 */}
      {isPending && (
        <Alert>
          <AlertDescription>지갑에서 트랜잭션을 확인해 주세요...</AlertDescription>
        </Alert>
      )}

      {/* 블록 확인 중 상태 */}
      {isConfirming && (
        <Alert>
          <AlertDescription>블록에 포함되는 중입니다...</AlertDescription>
        </Alert>
      )}

      {/* 성공 상태 - Sepolia Etherscan 링크 표시 */}
      {isSuccess && hash && (
        <Alert>
          <AlertDescription>
            승인 성공!{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Etherscan에서 확인하기
            </a>
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isPending || isConfirming || !tokenAddress}
        className="w-full"
      >
        {isPending ? "서명 대기 중..." : isConfirming ? "확인 중..." : "승인하기"}
      </Button>
    </form>
  );
}
