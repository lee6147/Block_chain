# Blockchain Lab & Teaching Materials

블록체인 수업을 위한 강의 자료와 주차별 실습을 모아 둔 교육용 저장소입니다. 블록체인 기초 개념부터 지갑, RPC, 트랜잭션, 테스트넷, Faucet, Gas, Nonce, Signature, 스테이블코인 네트워크, Solidity/Remix, ERC20, Staking, 스마트 컨트랙트 보안, 그리고 MCP 기반 블록체인 도구 데모까지 단계적으로 다룹니다.

이 저장소의 중심은 **MCP 단일 프로젝트가 아니라 블록체인 강의와 실습 전체 흐름**입니다. MCP Weather & Coin 데모는 수업 후반부에 활용할 수 있는 보조 실습 자료로 포함되어 있습니다.

## 저장소 소개

이 저장소는 블록체인 입문자가 실제 도구와 코드를 통해 핵심 개념을 확인하도록 구성되어 있습니다.

- CoinGecko 같은 공개 API로 블록체인/암호화폐 데이터를 조회합니다.
- MetaMask, JSON-RPC, ethers.js를 사용해 지갑 연결과 트랜잭션 흐름을 실습합니다.
- Sepolia, Base Sepolia, GIWA Sepolia 등 테스트넷에서 Gas, Nonce, Signature를 관찰합니다.
- 스테이블코인 네트워크와 결제 DApp 사례를 학습합니다.
- Solidity, Remix, ABI, Faucet, ERC20, Staking 컨트랙트를 작성하고 배포합니다.
- DAO/Parity 사례를 통해 스마트 컨트랙트 보안 취약점과 방어 패턴을 이해합니다.
- MCP client/server 구조를 활용해 외부 API를 tool 형태로 호출하는 데모를 실행합니다.

## 전체 학습 흐름

| 단계 | 주제 | 주요 내용 |
|---|---|---|
| Week 1 | 블록체인 데이터/API | CoinGecko 가격 조회, BTC/ETH 가격 테이블, API 응답 구조 |
| Week 2 | 지갑과 트랜잭션 | MetaMask, RPC, 가격 추적, 블록 조회, Sepolia ETH 전송 |
| Week 3 | 테스트넷과 트랜잭션 내부 구조 | Sepolia/Base/GIWA 테스트넷, Gas, Nonce, Signature, Bridge |
| Week 4 | 스테이블코인 네트워크 | 스테이블코인 구조, 네트워크 관점의 이해 |
| Week 5 | Solidity/Remix | Solidity 기초, Remix 실습, ABI, Faucet |
| Week 6 | ERC20/Staking/DApp | ERC20 토큰, Faucet, Staking 컨트랙트, Sepolia 배포, DApp UI |
| Week 12 | 스마트 컨트랙트 보안 | DAO Reentrancy, Parity 취약점, local Hardhat 보안 실습 |
| 보조 실습 | MCP 블록체인 도구 데모 | MCP client/server 분리, Weather/Coin tool 호출, 학생 프로젝트 예시 |

## 폴더 구조

```text
.
├── week/
│   ├── week_1_Blockchain Lab Report/   # CoinGecko 가격 조회와 블록체인 기초
│   ├── week_2-wallet-price-tracker/    # 지갑, MetaMask, RPC, 가격 추적, 트랜잭션
│   ├── week3-sepolia-lab/              # Sepolia/Base/GIWA 테스트넷 실습
│   ├── week4/                          # 스테이블코인 네트워크 학습 자료
│   ├── week5/                          # Solidity, Remix, ABI, Faucet 실습
│   ├── week6/                          # ERC20, Faucet, Staking, DApp 실습
│   ├── week_12/                        # DAO/Parity 스마트 컨트랙트 보안 취약점 실습
│   └── mcp-blockchain-demo/            # MCP Weather & Coin demo
├── 이론보강/                            # 주차별 이론 보강 자료와 HTML 학습 자료
├── 특강/DApp/                           # KUSDC 카페 결제 DApp 특강 자료
├── Score/                              # 평가/채점 관련 보조 자료
└── 논문/                               # 논문 및 참고 자료
```

주요 폴더 바로가기:

- [Week 1 — Blockchain Lab Report](week/week_1_Blockchain%20Lab%20Report/)
- [Week 2 — Wallet & Price Tracker](week/week_2-wallet-price-tracker/)
- [Week 3 — Sepolia Lab](week/week3-sepolia-lab/)
- [Week 4 — Stablecoin Networks](week/week4/README.md)
- [Week 5 — Solidity/Remix](week/week5/README.md)
- [Week 6 — ERC20 Staking](week/week6/)
- [Week 12 — Smart Contract Security](week/week_12/)
- [이론보강](이론보강/)
- [특강 DApp](특강/DApp/)
- [MCP Blockchain Demo](week/mcp-blockchain-demo/)

## 빠른 시작

1. 저장소를 클론합니다.

   ```bash
   git clone https://github.com/lee6147/Block_chain.git
   cd Block_chain
   ```

2. 학습하려는 주차 폴더로 이동합니다.

   ```bash
   cd week/week3-sepolia-lab
   ```

3. 해당 폴더의 `README.md` 또는 주제별 Markdown 문서를 먼저 읽습니다.

4. Node.js, npm, uv, MetaMask, Remix 등 실행 환경이 필요한 하위 프로젝트는 각 폴더의 안내를 기준으로 설치·실행합니다. 예를 들어:

   - Week 2/3/12처럼 Node.js 프로젝트가 포함된 실습은 해당 폴더의 `package.json`과 README를 확인합니다.
   - Week 5/6의 Solidity 실습은 Remix와 Sepolia 테스트넷 안내를 먼저 확인합니다.
   - MCP 데모는 `week/mcp-blockchain-demo/`에서 `uv sync` 후 실행합니다.

## 주요 실습 주제

- 블록체인 데이터 조회와 API 응답 해석
- MetaMask 지갑 연결과 네트워크 전환
- JSON-RPC와 ethers.js 기반 블록/트랜잭션 조회
- 테스트넷 ETH Faucet 사용과 Sepolia 송금
- Gas, Nonce, Signature, Bridge 트랜잭션 분석
- Solidity 컨트랙트 작성, ABI 이해, Remix 배포
- ERC20 토큰, Faucet, Staking 보상 로직 구현
- Sepolia 배포와 Etherscan 소스 검증
- DAO Reentrancy와 Parity 취약점 재현 및 완화
- MCP client/server 분리와 tool 호출 흐름 이해

## MCP 블록체인 도구 데모

MCP 관련 자료는 루트 프로젝트의 핵심 주제가 아니라, 블록체인 도구를 MCP 구조로 감싸는 보조 데모입니다. 자료는 아래 폴더에 정리되어 있습니다.

```text
week/mcp-blockchain-demo/
```

핵심 포인트는 **MCP server만 만드는 것이 아니라 MCP client와 MCP server를 분리해서 보여주는 것**입니다.

1. MCP server가 Weather/Coin 관련 기능을 tool로 노출합니다.
2. MCP client가 server에 `stdio`로 연결합니다.
3. client가 `list_tools()`로 사용 가능한 tool을 조회합니다.
4. client가 `call_tool()`로 구체적인 인자를 전달합니다.
5. server가 Open-Meteo 또는 CoinGecko 같은 외부 API를 호출합니다.
6. tool result가 client/UI로 돌아옵니다.

```text
MCP Client / Web Backend
  ↓ list_tools(), call_tool()
MCP Server
  ↓ external API request
Open-Meteo or CoinGecko
  ↓ result
MCP Server
  ↓ tool result
MCP Client / UI
```

관련 문서:

- [MCP demo README](week/mcp-blockchain-demo/README.md)
- [MCP demo README_KR](week/mcp-blockchain-demo/README_KR.md)
- [MCP presentation](week/mcp-blockchain-demo/presentation.html)

빠른 실행:

```bash
cd week/mcp-blockchain-demo
uv sync
./run_all_demos.sh
```

브라우저 UI:

```bash
cd week/mcp-blockchain-demo
./run_ui.sh
```

접속 주소:

```text
http://127.0.0.1:8765
```

## 이론보강 자료

[`이론보강/`](이론보강/) 폴더에는 주차별 개념 보강 문서와 학습 보조 자료가 있습니다. 실습 전에 배경지식을 정리하거나, 실습 후 개념을 다시 확인할 때 활용할 수 있습니다.

권장 시작점:

- [START_HERE.md](이론보강/START_HERE.md)
- [Week 1 — Blockchain Basics](이론보강/01_week1_blockchain_basics.md)
- [Week 2 — Wallet & Transaction](이론보강/02_week2_wallet_transaction.md)
- [Week 3 — Testnet/Gas/Nonce/Signature](이론보강/03_week3_testnet_gas_nonce_signature.md)
- [Week 4 — Stablecoin Networks](이론보강/04_week4_stablecoin_networks.md)
- [Week 5 — Solidity/Remix/Faucet](이론보강/05_week5_solidity_remix_faucet.md)
- [Week 6 — ERC20/Staking/Errors](이론보강/06_week6_erc20_staking_errors.md)

## 대상 독자

- 블록체인 기초를 처음 배우는 학생
- 지갑, RPC, 트랜잭션, 테스트넷 실습을 준비하는 수강생
- Solidity/Remix/ERC20/Staking 과제를 진행하는 학생
- 실습을 안내하거나 채점해야 하는 조교
- 수업 자료의 흐름과 실습 구성을 검토하는 교수/강사
- MCP 기반 블록체인 도구 데모를 참고하려는 프로젝트 팀
