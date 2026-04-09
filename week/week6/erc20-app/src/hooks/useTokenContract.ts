"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_ABI } from "@/lib/contracts";
import { parseUnits, formatUnits } from "viem";
import type { Address } from "viem";

// ERC20 토큰 읽기 훅 (가스비 없는 조회 함수들)
export function useTokenRead(tokenAddress: string) {
  const address = tokenAddress as Address;
  const enabled = !!tokenAddress && tokenAddress.startsWith("0x");

  const name = useReadContract({
    address,
    abi: ERC20_ABI,
    functionName: "name",
    query: { enabled },
  });

  const symbol = useReadContract({
    address,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled },
  });

  const decimals = useReadContract({
    address,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled },
  });

  const totalSupply = useReadContract({
    address,
    abi: ERC20_ABI,
    functionName: "totalSupply",
    query: { enabled },
  });

  return {
    name: name.data as string | undefined,
    symbol: symbol.data as string | undefined,
    decimals: decimals.data as number | undefined,
    totalSupply: totalSupply.data as bigint | undefined,
    isLoading: name.isLoading || symbol.isLoading || decimals.isLoading || totalSupply.isLoading,
    isError: name.isError || symbol.isError,
  };
}

// 특정 주소의 잔액 조회 훅
export function useTokenBalance(tokenAddress: string, account: string) {
  const enabled = !!tokenAddress && !!account && tokenAddress.startsWith("0x") && account.startsWith("0x");

  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account as Address],
    query: { enabled },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// allowance 조회 훅
export function useTokenAllowance(tokenAddress: string, owner: string, spender: string) {
  const enabled = !!tokenAddress && !!owner && !!spender &&
    tokenAddress.startsWith("0x") && owner.startsWith("0x") && spender.startsWith("0x");

  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [owner as Address, spender as Address],
    query: { enabled },
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// 토큰 쓰기 훅 (트랜잭션 발생)
export function useTokenWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 토큰 전송
  const transfer = (tokenAddress: string, to: string, amount: string, decimals: number) => {
    writeContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to as Address, parseUnits(amount, decimals)],
    });
  };

  // 토큰 승인
  const approve = (tokenAddress: string, spender: string, amount: string, decimals: number) => {
    writeContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender as Address, parseUnits(amount, decimals)],
    });
  };

  // 위임 전송
  const transferFrom = (
    tokenAddress: string,
    from: string,
    to: string,
    amount: string,
    decimals: number
  ) => {
    writeContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "transferFrom",
      args: [from as Address, to as Address, parseUnits(amount, decimals)],
    });
  };

  return {
    transfer,
    approve,
    transferFrom,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// 유틸리티: 토큰 수량 포맷팅
export function formatTokenAmount(amount: bigint | undefined, decimals: number = 18): string {
  if (!amount) return "0";
  return formatUnits(amount, decimals);
}
