"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { setContractAddresses } from "@/lib/contracts";
import AddTokenButton from "@/components/web3/AddTokenButton";

// MyToken.sol 전체 소스코드 (가이드에 표시용)
const MY_TOKEN_SOL = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MyToken - 기본 ERC20 토큰
 * @notice 이 컨트랙트는 ERC20 표준을 따르는 가장 기본적인 토큰입니다.
 * @dev OpenZeppelin의 ERC20 구현을 상속받아 사용합니다.
 *
 * ERC20 표준 함수:
 * - totalSupply(): 전체 발행량 조회
 * - balanceOf(address): 특정 주소의 잔액 조회
 * - transfer(to, amount): 토큰 전송
 * - approve(spender, amount): 제3자에게 사용 권한 부여
 * - allowance(owner, spender): 승인된 사용량 조회
 * - transferFrom(from, to, amount): 승인받은 토큰 전송
 */
contract MyToken is ERC20 {
    /**
     * @notice 토큰 생성자
     * @param initialSupply 초기 발행량 (단위: 토큰 개수, decimals 자동 적용)
     * @dev msg.sender에게 초기 발행량 전체를 민팅합니다.
     *
     * 예시: initialSupply = 1000 이면
     * 실제 발행량 = 1000 * 10^18 = 1000000000000000000000 (wei 단위)
     */
    constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
        // msg.sender = 컨트랙트를 배포하는 사람의 지갑 주소
        // decimals() = 18 (기본값)
        // initialSupply * 10 ** decimals() = 실제 토큰 수량 (wei 단위로 변환)
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}`;

// 배포 가이드 단계 데이터
const steps = [
  {
    step: 1,
    title: "Remix IDE 접속",
    description: "브라우저에서 Remix IDE를 엽니다.",
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          아래 링크를 클릭하거나 주소창에 직접 입력하세요.
        </p>
        <a
          href="https://remix.ethereum.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          🌐 remix.ethereum.org 열기
        </a>
        <Alert>
          <AlertDescription>
            💡 <strong>팁:</strong> Remix IDE는 설치 없이 브라우저에서 바로
            사용할 수 있는 Solidity 개발 환경입니다. Chrome 또는 Firefox를
            권장합니다.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    step: 2,
    title: "새 파일 생성 + 코드 붙여넣기",
    description:
      "contracts 폴더에 MyToken.sol 파일을 만들고 아래 코드를 붙여넣습니다.",
    content: null, // 별도 렌더링 (코드 블록 포함)
  },
  {
    step: 3,
    title: "컴파일러 설정",
    description: "Solidity 컴파일러 버전을 0.8.20 이상으로 설정합니다.",
    content: (
      <div className="space-y-3">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            왼쪽 사이드바에서{" "}
            <span className="rounded bg-muted px-1 font-mono">Solidity Compiler</span>{" "}
            아이콘(S 모양)을 클릭합니다.
          </li>
          <li>
            <span className="rounded bg-muted px-1 font-mono">COMPILER</span>{" "}
            드롭다운에서 <strong>0.8.20</strong> 이상 버전을 선택합니다.
          </li>
          <li>
            <span className="rounded bg-muted px-1 font-mono">
              Compile MyToken.sol
            </span>{" "}
            버튼을 클릭합니다.
          </li>
          <li>
            왼쪽 아이콘에 초록색 체크(✓)가 표시되면 컴파일 성공입니다.
          </li>
        </ol>
        <Alert>
          <AlertDescription>
            ⚠️ <strong>주의:</strong> 컴파일 오류가 발생하면{" "}
            <span className="font-mono">pragma solidity ^0.8.20;</span> 버전과
            선택한 컴파일러 버전이 일치하는지 확인하세요.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    step: 4,
    title: "배포 환경 설정",
    description:
      "메타마스크와 연결된 Injected Provider 환경으로 전환합니다.",
    content: (
      <div className="space-y-3">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            왼쪽 사이드바에서{" "}
            <span className="rounded bg-muted px-1 font-mono">
              Deploy &amp; Run Transactions
            </span>{" "}
            아이콘(화살표 모양)을 클릭합니다.
          </li>
          <li>
            <span className="rounded bg-muted px-1 font-mono">ENVIRONMENT</span>{" "}
            드롭다운을{" "}
            <strong>Injected Provider - MetaMask</strong>로 변경합니다.
          </li>
          <li>
            메타마스크 팝업이 열리면 <strong>연결(Connect)</strong>을
            클릭합니다.
          </li>
          <li>
            네트워크가 <strong>Sepolia 테스트넷</strong>으로 설정되어 있는지
            확인합니다.
          </li>
        </ol>
        <Alert>
          <AlertDescription>
            💡 <strong>팁:</strong> 메타마스크가 Remix와 연결되면 상단에 계정
            주소와 잔액이 표시됩니다. Sepolia ETH가 없다면{" "}
            <a
              href="https://sepoliafaucet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Sepolia Faucet
            </a>
            에서 받아오세요.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    step: 5,
    title: "생성자 인자 입력 + Deploy",
    description:
      "initialSupply 값을 입력하고 Deploy 버튼을 눌러 배포합니다.",
    content: (
      <div className="space-y-3">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <span className="rounded bg-muted px-1 font-mono">CONTRACT</span>{" "}
            드롭다운에서 <strong>MyToken</strong>이 선택되어 있는지 확인합니다.
          </li>
          <li>
            <span className="rounded bg-muted px-1 font-mono">
              Deploy
            </span>{" "}
            버튼 옆 입력란에{" "}
            <span className="rounded bg-muted px-1 font-mono">1000</span>을
            입력합니다. (초기 발행량: 1,000 MTK)
          </li>
          <li>
            <span className="rounded bg-muted px-1 font-mono">Deploy</span>{" "}
            버튼을 클릭합니다.
          </li>
          <li>
            메타마스크에서 트랜잭션 확인 팝업이 뜨면{" "}
            <strong>확인(Confirm)</strong>을 클릭합니다.
          </li>
        </ol>
        <Alert>
          <AlertDescription>
            💡 <strong>팁:</strong> initialSupply = 1000 이면 실제 발행량은{" "}
            <span className="font-mono">1000 × 10¹⁸ = 1,000 MTK</span>입니다.
            decimals가 18이기 때문입니다.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    step: 6,
    title: "배포된 컨트랙트 주소 확인",
    description:
      "Remix 하단 콘솔 또는 Deployed Contracts 섹션에서 주소를 복사합니다.",
    content: (
      <div className="space-y-3">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            배포 성공 시 하단{" "}
            <span className="rounded bg-muted px-1 font-mono">
              Terminal
            </span>{" "}
            콘솔에 초록색 체크(✓)와 함께 트랜잭션 해시가 표시됩니다.
          </li>
          <li>
            왼쪽 하단{" "}
            <span className="rounded bg-muted px-1 font-mono">
              Deployed Contracts
            </span>{" "}
            섹션에 <strong>MYTOKEN AT 0x...</strong> 형태로 주소가 나타납니다.
          </li>
          <li>
            주소 옆 복사 아이콘을 클릭하여 컨트랙트 주소를 복사합니다.
          </li>
        </ol>
        <Alert>
          <AlertDescription>
            ⚠️ <strong>주의:</strong> 컨트랙트 주소는 아래 입력 폼에 반드시
            저장하세요. 새로고침하면 Deployed Contracts 목록이 초기화됩니다.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    step: 7,
    title: "메타마스크에 토큰 추가",
    description:
      "배포한 토큰을 메타마스크 지갑에 등록해 잔액을 확인합니다.",
    content: (
      <div className="space-y-3">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>메타마스크를 열고 하단 [토큰] 탭으로 이동합니다.</li>
          <li>
            <strong>토큰 가져오기</strong>를 클릭합니다.
          </li>
          <li>
            <strong>커스텀 토큰</strong> 탭에서 컨트랙트 주소를 붙여넣습니다.
          </li>
          <li>
            토큰 기호(<strong>MTK</strong>)와 소수 자릿수(
            <strong>18</strong>)가 자동으로 채워집니다.
          </li>
          <li>
            <strong>다음 → 토큰 가져오기</strong>를 클릭합니다.
          </li>
        </ol>
        <Alert>
          <AlertDescription>
            💡 <strong>팁:</strong> 아래 저장된 주소를 입력한 뒤{" "}
            <strong>메타마스크에 토큰 추가</strong> 버튼을 누르면 자동으로
            추가됩니다.
          </AlertDescription>
        </Alert>
      </div>
    ),
  },
];

export default function DeployGuidePage() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [copied, setCopied] = useState(false);

  // 컨트랙트 주소를 localStorage에 저장
  const handleSaveAddress = () => {
    if (!tokenAddress.trim()) return;
    setContractAddresses({ token: tokenAddress.trim() });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  // 코드 복사 기능
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(MY_TOKEN_SOL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 페이지 헤더 */}
      <section className="mb-8">
        <Badge className="mb-3" variant="secondary">
          Step 2 실습
        </Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Remix IDE로 토큰 배포하기
        </h1>
        <p className="text-muted-foreground">
          Remix IDE를 사용해 MyToken 스마트 컨트랙트를 Sepolia 테스트넷에
          배포하는 7단계 가이드입니다.
        </p>
      </section>

      <Separator className="mb-8" />

      {/* 단계별 가이드 */}
      <div className="space-y-6">
        {steps.map((item) => (
          <Card key={item.step}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {/* 단계 번호 뱃지 */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </span>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Step 2: 코드 블록 별도 렌더링 */}
            {item.step === 2 ? (
              <CardContent className="space-y-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    왼쪽 파일 탐색기에서{" "}
                    <span className="rounded bg-muted px-1 font-mono">
                      contracts
                    </span>{" "}
                    폴더를 우클릭 →{" "}
                    <strong>New File</strong>을 선택합니다.
                  </li>
                  <li>
                    파일명을{" "}
                    <span className="rounded bg-muted px-1 font-mono">
                      MyToken.sol
                    </span>
                    로 입력합니다.
                  </li>
                  <li>
                    아래 코드를 전체 복사하여 파일에 붙여넣습니다.
                  </li>
                </ol>

                {/* 코드 블록 */}
                <div className="relative rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between border-b px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      MyToken.sol
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleCopyCode}
                    >
                      {copied ? "✓ 복사됨" : "📋 복사"}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
                    <code>{MY_TOKEN_SOL}</code>
                  </pre>
                </div>

                <Alert>
                  <AlertDescription>
                    💡 <strong>팁:</strong> OpenZeppelin 라이브러리는 Remix에서
                    자동으로 설치됩니다. 별도 npm install 없이 import만
                    하면 됩니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            ) : (
              item.content && (
                <CardContent>{item.content}</CardContent>
              )
            )}
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      {/* 컨트랙트 주소 저장 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">컨트랙트 주소 저장</CardTitle>
          <p className="text-sm text-muted-foreground">
            배포된 토큰 컨트랙트 주소를 입력하면 다른 페이지에서도 사용할 수
            있습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="0x... 컨트랙트 주소 입력"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleSaveAddress}
              disabled={!tokenAddress.trim()}
              className="shrink-0"
            >
              저장
            </Button>
          </div>

          {/* 저장 완료 알림 */}
          {saveStatus === "saved" && (
            <Alert>
              <AlertDescription className="text-green-700">
                ✅ 저장 완료! 컨트랙트 주소가 브라우저에 저장되었습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 메타마스크 토큰 추가 버튼 */}
          {tokenAddress.trim() && (
            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">메타마스크 빠른 추가</p>
              <AddTokenButton
                tokenAddress={tokenAddress.trim()}
                tokenSymbol="MTK"
                tokenDecimals={18}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
