# 01. Faucet 수령 가이드

## §1. MetaMask에 Sepolia 네트워크 추가

MetaMask 최신 버전은 기본적으로 Sepolia를 내장하고 있다.
`설정 → 네트워크 → 테스트 네트워크 표시` 를 켜면 네트워크 드롭다운에 **Sepolia test network**가 나타난다.

수동 추가가 필요하면:

| 필드 | 값 |
|---|---|
| Network Name | Sepolia |
| RPC URL | `https://sepolia.infura.io/v3/<YOUR_KEY>` 또는 `https://rpc.sepolia.org` |
| Chain ID | `11155111` |
| Symbol | `SepoliaETH` |
| Explorer | `https://sepolia.etherscan.io` |

## §2. Sepolia ETH Faucet (가스비용)

Sepolia 배포에는 **소액의 ETH가 필요**하다. 아래 Faucet 중 하나에서 하루 1회 수령.

| Faucet | URL | 비고 |
|---|---|---|
| Google Cloud | https://cloud.google.com/application/web3/faucet/ethereum/sepolia | Google 계정 로그인 |
| Alchemy | https://www.alchemy.com/faucets/ethereum-sepolia | Alchemy 계정 필요 |
| QuickNode | https://faucet.quicknode.com/ethereum/sepolia | |
| PoW Faucet | https://sepolia-faucet.pk910.de/ | 브라우저 채굴 방식 |

> 💡 하나에서 실패하면 다른 것을 시도. 트래픽 몰리면 일시 차단된다.

## §3. 과제용 HNL Faucet (토큰)

조교가 배포한 `Faucet.sol`에서 실습용 ERC20(**HNL** 등)을 수령한다.

### 주소 확인

수업 공지 또는 과제 게시판에서 아래 두 주소를 확인하고 메모:

- `FAUCET_ADDRESS` — 조교가 배포한 Faucet 컨트랙트
- `TOKEN_ADDRESS` — 조교가 배포한 ExampleToken (HNL)

### 수령 방법 A — Remix에서 직접 호출

1. Remix 열기 → `21_Faucet.sol` 붙여넣기 후 컴파일.
2. Deploy & Run → **Injected Provider - MetaMask** 선택 (Sepolia 확인).
3. `At Address` 입력란에 `FAUCET_ADDRESS` 붙여넣고 **At Address** 클릭.
4. 펼쳐진 함수 목록에서 `requestTokens` 클릭 → MetaMask 트랜잭션 승인.
5. 잠시 후 Etherscan에서 내 지갑 주소로 토큰이 들어왔는지 확인.

### 수령 방법 B — DApp에서

`30_DApp.html`을 열고 Faucet 주소를 입력 후 **Connect → requestTokens** 클릭.

### Cooldown

Faucet은 **쿨다운**이 설정되어 있다 (예: 1시간). 쿨다운 중 호출하면 revert.
DApp의 Faucet 탭에는 "다음 수령 가능" 카운트다운이 표시된다.

### 내 토큰 잔액을 MetaMask에 노출하려면

MetaMask → Assets → **Import tokens** → `TOKEN_ADDRESS` 입력 → Symbol·Decimals 자동 로드 → Add.
