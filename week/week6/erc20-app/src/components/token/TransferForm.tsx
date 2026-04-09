"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTokenWrite, useTokenRead } from "@/hooks/useTokenContract";

interface TransferFormProps {
  tokenAddress: string;
}

// ERC20 토큰 전송 폼 컴포넌트
export default function TransferForm({ tokenAddress }: TransferFormProps) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  const { decimals } = useTokenRead(tokenAddress);
  const { transfer, hash, isPending, isConfirming, isSuccess, error } = useTokenWrite();

  // 입력값 유효성 검사 후 트랜잭션 전송
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (!to || !to.startsWith("0x") || to.length !== 42) {
      setValidationError("올바른 이더리움 주소를 입력해 주세요.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("0보다 큰 수량을 입력해 주세요.");
      return;
    }

    transfer(tokenAddress, to, amount, decimals ?? 18);
  };

  // 에러 메시지 파싱 (잔액 부족 등 사용자 친화적 표시)
  const getErrorMessage = (err: Error | null): string => {
    if (!err) return "";
    const msg = err.message.toLowerCase();
    if (msg.includes("insufficient") || msg.includes("exceeds balance")) {
      return "잔액이 부족합니다.";
    }
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
      {/* 받는 주소 입력 */}
      <div className="space-y-1">
        <label htmlFor="transfer-to" className="text-sm font-medium">
          받는 주소 (to)
        </label>
        <Input
          id="transfer-to"
          placeholder="0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          disabled={isPending || isConfirming}
        />
      </div>

      {/* 전송 수량 입력 */}
      <div className="space-y-1">
        <label htmlFor="transfer-amount" className="text-sm font-medium">
          수량 (amount)
        </label>
        <Input
          id="transfer-amount"
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
            전송 성공!{" "}
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
        {isPending ? "서명 대기 중..." : isConfirming ? "확인 중..." : "전송하기"}
      </Button>
    </form>
  );
}
