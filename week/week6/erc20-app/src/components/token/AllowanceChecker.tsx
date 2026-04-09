"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTokenAllowance, useTokenRead, formatTokenAmount } from "@/hooks/useTokenContract";

interface AllowanceCheckerProps {
  tokenAddress: string;
}

// 허용량(allowance) 조회 컴포넌트
export default function AllowanceChecker({ tokenAddress }: AllowanceCheckerProps) {
  const [owner, setOwner] = useState("");
  const [spender, setSpender] = useState("");
  const [queried, setQueried] = useState(false);
  const [validationError, setValidationError] = useState("");

  // 실제 조회 시 사용할 주소 상태 (조회 버튼 클릭 시에만 업데이트)
  const [queryOwner, setQueryOwner] = useState("");
  const [querySpender, setQuerySpender] = useState("");

  const { decimals } = useTokenRead(tokenAddress);
  const { allowance, isLoading } = useTokenAllowance(tokenAddress, queryOwner, querySpender);

  // 입력값 유효성 검사 후 조회 실행
  const handleQuery = () => {
    setValidationError("");
    setQueried(false);

    if (!owner || !owner.startsWith("0x") || owner.length !== 42) {
      setValidationError("올바른 owner 주소를 입력해 주세요.");
      return;
    }
    if (!spender || !spender.startsWith("0x") || spender.length !== 42) {
      setValidationError("올바른 spender 주소를 입력해 주세요.");
      return;
    }

    // 조회용 주소를 업데이트하면 useTokenAllowance가 자동으로 재조회
    setQueryOwner(owner);
    setQuerySpender(spender);
    setQueried(true);
  };

  return (
    <div className="space-y-4">
      {/* owner 주소 입력 */}
      <div className="space-y-1">
        <label htmlFor="allowance-owner" className="text-sm font-medium">
          토큰 소유자 주소 (owner)
        </label>
        <Input
          id="allowance-owner"
          placeholder="0x..."
          value={owner}
          onChange={(e) => {
            setOwner(e.target.value);
            setQueried(false);
          }}
        />
      </div>

      {/* spender 주소 입력 */}
      <div className="space-y-1">
        <label htmlFor="allowance-spender" className="text-sm font-medium">
          승인된 주소 (spender)
        </label>
        <Input
          id="allowance-spender"
          placeholder="0x..."
          value={spender}
          onChange={(e) => {
            setSpender(e.target.value);
            setQueried(false);
          }}
        />
      </div>

      {/* 유효성 검사 에러 */}
      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        onClick={handleQuery}
        disabled={isLoading || !tokenAddress}
        className="w-full"
      >
        {isLoading ? "조회 중..." : "허용량 조회"}
      </Button>

      {/* 조회 결과 표시 */}
      {queried && !isLoading && allowance !== undefined && (
        <Alert>
          <AlertDescription>
            <span className="font-medium">허용량: </span>
            {formatTokenAmount(allowance, decimals ?? 18)}
            {" "}토큰
          </AlertDescription>
        </Alert>
      )}

      {/* 조회했으나 데이터가 없을 때 */}
      {queried && !isLoading && allowance === undefined && (
        <Alert variant="destructive">
          <AlertDescription>
            허용량을 조회하지 못했습니다. 주소를 다시 확인해 주세요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
