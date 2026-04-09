import { QuizQuestion } from "@/types";

// ERC20 개념 퀴즈 문제 데이터 (12문제)
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ===== 개념 (concept) 4문제 =====
  {
    id: 1,
    category: "concept",
    question: "ERC20 표준이 존재하는 핵심 이유는 무엇인가요?",
    options: [
      "토큰을 더 빠르게 전송하기 위해",
      "서로 다른 토큰을 동일한 방식으로 다룰 수 있는 공통 인터페이스를 제공하기 위해",
      "이더리움 가스비를 줄이기 위해",
      "토큰의 가격을 안정시키기 위해",
    ],
    correctAnswer: 1,
    explanation:
      "ERC20은 모든 토큰이 동일한 함수 이름과 동작 방식을 갖도록 강제하는 인터페이스 표준입니다. 덕분에 메타마스크, 유니스왑, 코인베이스 같은 지갑·거래소·DApp이 토큰 종류에 무관하게 동일한 코드로 모든 ERC20 토큰을 처리할 수 있습니다. USB 포트 규격과 동일한 원리입니다.",
  },
  {
    id: 2,
    category: "concept",
    question: "코인(Coin)과 토큰(Token)의 차이를 가장 정확하게 설명한 것은?",
    options: [
      "코인은 싸고 토큰은 비싸다",
      "코인은 자체 블록체인을 가지며, 토큰은 다른 블록체인 위에서 스마트 컨트랙트로 동작한다",
      "코인은 중앙화되어 있고 토큰은 탈중앙화되어 있다",
      "코인은 개인이 만들 수 없지만 토큰은 누구나 만들 수 있다",
    ],
    correctAnswer: 1,
    explanation:
      "ETH는 이더리움이라는 자체 블록체인의 네이티브 화폐이므로 코인입니다. 반면 ERC20 토큰은 이더리움 블록체인 위에서 스마트 컨트랙트 코드로 구현됩니다. 토큰 잔액은 블록체인 원장에 직접 기록되는 것이 아니라, 컨트랙트 내부의 mapping 변수에 저장됩니다.",
  },
  {
    id: 3,
    category: "concept",
    question: "ERC20의 decimals 값이 18인 이유로 가장 적절한 것은?",
    options: [
      "솔리디티가 소수점을 지원하지 않아서 정수로 최솟값을 표현하기 위해",
      "18이 가장 아름다운 숫자이기 때문에",
      "이더리움 네트워크 규칙에서 반드시 18로 고정해야 하기 때문에",
      "18개의 함수를 구현해야 ERC20이 되기 때문에",
    ],
    correctAnswer: 0,
    explanation:
      "솔리디티는 부동소수점(float)을 지원하지 않습니다. 따라서 '1.5 토큰'을 표현하려면 내부적으로 1500000000000000000(1.5 × 10^18)으로 저장합니다. decimals=18은 ETH의 최소 단위인 wei와 동일한 정밀도로, 극히 작은 금액도 표현할 수 있게 해줍니다.",
  },
  {
    id: 4,
    category: "concept",
    question: "ERC20 컨트랙트가 Transfer와 Approval 이벤트를 emit하는 주된 목적은?",
    options: [
      "컨트랙트 실행 속도를 높이기 위해",
      "블록체인 외부(프론트엔드, 인덱서 등)에서 거래 내역을 효율적으로 추적하기 위해",
      "다른 컨트랙트가 함수를 호출할 수 있도록 허용하기 위해",
      "토큰 잔액을 저장하는 대체 수단으로 사용하기 위해",
    ],
    correctAnswer: 1,
    explanation:
      "이벤트(Event)는 블록체인의 트랜잭션 로그에 기록되며, 컨트랙트 스토리지보다 훨씬 저렴합니다. 프론트엔드나 The Graph 같은 인덱서가 이 로그를 구독(subscribe)하면 누가, 언제, 얼마를 전송했는지 효율적으로 조회할 수 있습니다. 이벤트 자체는 컨트랙트 내부에서 읽을 수 없습니다.",
  },

  // ===== 코드 (code) 4문제 =====
  {
    id: 5,
    category: "code",
    question: "transfer(address to, uint256 amount) 함수에서 from 주소를 별도 매개변수로 받지 않는 이유는?",
    options: [
      "from 주소는 항상 0x0이기 때문에",
      "솔리디티에서 주소를 3개 이상 받을 수 없기 때문에",
      "msg.sender가 트랜잭션 서명자이므로 자동으로 from이 되기 때문에",
      "from 주소는 컨트랙트 배포자로 고정되기 때문에",
    ],
    correctAnswer: 2,
    explanation:
      "msg.sender는 현재 트랜잭션을 서명하고 제출한 계정 주소입니다. transfer를 호출한 사람이 곧 토큰을 보내는 사람(from)이므로, 별도로 받을 필요가 없습니다. 만약 from을 매개변수로 받는다면 다른 사람 명의로 전송을 위조할 수 있는 보안 취약점이 생깁니다.",
  },
  {
    id: 6,
    category: "code",
    question: "approve(spender, amount)와 transferFrom(from, to, amount)의 관계로 올바른 것은?",
    options: [
      "approve를 호출하면 즉시 토큰이 전송된다",
      "approve로 제3자(spender)에게 인출 권한을 부여하고, spender가 나중에 transferFrom으로 실제 인출한다",
      "transferFrom은 approve 없이도 누구나 호출할 수 있다",
      "approve와 transferFrom은 항상 같은 트랜잭션에서 호출해야 한다",
    ],
    correctAnswer: 1,
    explanation:
      "approve → transferFrom은 2단계 위임 패턴입니다. 먼저 토큰 소유자가 approve(DEX주소, 금액)를 호출해 인출 한도를 설정합니다. 그 후 DEX 컨트랙트가 transferFrom(소유자, DEX, 금액)을 호출해 실제로 가져갑니다. allowance 매핑이 이 한도를 추적합니다. 유니스왑 같은 DEX가 이 방식을 사용합니다.",
  },
  {
    id: 7,
    category: "code",
    question: "다음 코드에서 msg.sender가 가리키는 것은?\n\nfunction mint(address to, uint256 amount) external {\n    require(msg.sender == owner, \"권한 없음\");\n    _mint(to, amount);\n}",
    options: [
      "컨트랙트 자신의 주소",
      "to 매개변수로 전달된 주소",
      "이 mint 함수를 호출한 트랜잭션의 서명자 주소",
      "컨트랙트를 배포한 사람의 주소(항상 고정)",
    ],
    correctAnswer: 2,
    explanation:
      "msg.sender는 '지금 이 함수를 호출한 사람'입니다. 배포자가 아니라 현재 트랜잭션의 서명자입니다. 배포자 주소는 constructor에서 owner = msg.sender로 한 번 저장해두고, 이후 함수 호출 시에는 msg.sender와 owner를 비교해 권한을 확인합니다. 이것이 Ownable 패턴의 핵심입니다.",
  },
  {
    id: 8,
    category: "code",
    question: "_mint(address account, uint256 amount) 함수의 역할로 옳은 것은?",
    options: [
      "기존 토큰을 다른 계정으로 이동시킨다",
      "지정한 계정의 잔액을 늘리고 totalSupply를 증가시켜 새 토큰을 발행한다",
      "토큰을 소각(burn)하여 총 공급량을 줄인다",
      "컨트랙트에 ETH를 입금한다",
    ],
    correctAnswer: 1,
    explanation:
      "_mint는 OpenZeppelin ERC20의 내부 함수로, balances[account] += amount와 totalSupply += amount를 동시에 실행합니다. 즉 '없던 토큰을 새로 만들어' 특정 계정에 부여합니다. constructor에서 초기 공급량 배포나 퍼셋(faucet) 기능 구현에 사용됩니다. 반대 역할을 하는 함수는 _burn입니다.",
  },

  // ===== 실습 (practice) 4문제 =====
  {
    id: 9,
    category: "practice",
    question: "Remix IDE에서 ERC20 토큰을 Sepolia 테스트넷에 배포하는 올바른 순서는?",
    options: [
      "컴파일 → 메타마스크 Sepolia 연결 → Deploy & Run에서 Injected Provider 선택 → Deploy",
      "Deploy → 컴파일 → 메타마스크 연결 → 네트워크 선택",
      "메타마스크 연결 → Deploy → 컴파일 → Injected Provider 선택",
      "Injected Provider 선택 → Deploy → 컴파일 → 메타마스크 연결",
    ],
    correctAnswer: 0,
    explanation:
      "올바른 순서: ① Solidity 파일 작성 후 Compile 탭에서 컴파일(Ctrl+S) → ② 메타마스크에서 Sepolia 네트워크 선택 → ③ Deploy & Run 탭에서 Environment를 'Injected Provider - MetaMask'로 변경 → ④ Deploy 버튼 클릭 후 메타마스크 팝업에서 트랜잭션 승인. 컴파일 전에는 ABI가 생성되지 않아 배포할 수 없습니다.",
  },
  {
    id: 10,
    category: "practice",
    question: "메타마스크에 커스텀 ERC20 토큰을 추가하려면 무엇이 필요한가요?",
    options: [
      "토큰 이름과 심볼만 입력하면 자동으로 추가된다",
      "컨트랙트 주소를 입력하면 메타마스크가 토큰 정보를 자동으로 읽어온다",
      "개발자에게 특별 권한을 신청해야 한다",
      "토큰을 먼저 구매해야만 추가할 수 있다",
    ],
    correctAnswer: 1,
    explanation:
      "메타마스크에서 '토큰 가져오기' → '커스텀 토큰' 탭을 선택하고 컨트랙트 주소를 붙여넣으면, 메타마스크가 해당 컨트랙트의 name(), symbol(), decimals() 함수를 자동으로 호출해 정보를 채워줍니다. 이것이 ERC20 표준의 실용적 이점입니다. 주소만 알면 어떤 토큰이든 동일한 방법으로 추가할 수 있습니다.",
  },
  {
    id: 11,
    category: "practice",
    question: "퍼셋(Faucet)에 쿨다운(cooldown) 시간을 두는 주된 이유는?",
    options: [
      "블록체인 처리 속도가 느려서 기다려야 하기 때문에",
      "한 사람이 무한정 토큰을 수령해 퍼셋을 고갈시키는 것을 방지하기 위해",
      "메타마스크가 연속 트랜잭션을 지원하지 않기 때문에",
      "이더리움 네트워크 규칙으로 동일 컨트랙트 연속 호출이 금지되어 있기 때문에",
    ],
    correctAnswer: 1,
    explanation:
      "쿨다운이 없으면 스크립트로 자동화해 퍼셋의 모든 토큰을 순식간에 빼갈 수 있습니다. 컨트랙트 내부에서 lastClaimTime[msg.sender] 매핑으로 마지막 수령 시각을 기록하고, 현재 시각(block.timestamp)과의 차이가 쿨다운보다 짧으면 revert합니다. 이것이 블록체인 레벨의 속도 제한(rate limiting)입니다.",
  },
  {
    id: 12,
    category: "practice",
    question: "Remix에서 배포 후 컨트랙트 주소를 확인할 수 있는 가장 정확한 방법은?",
    options: [
      "컨트랙트 파일명이 곧 주소가 된다",
      "Remix의 Deploy & Run 탭 하단 'Deployed Contracts' 섹션 또는 메타마스크 활동 탭에서 확인한다",
      "배포 후 이메일로 주소가 전송된다",
      "주소는 배포 전에 미리 정해서 입력해야 한다",
    ],
    correctAnswer: 1,
    explanation:
      "배포가 성공하면 Remix 하단 콘솔에 트랜잭션 해시가 표시되고, Deploy & Run 탭 하단 'Deployed Contracts'에 컨트랙트 주소가 나타납니다. 메타마스크 '활동' 탭에서 해당 트랜잭션을 클릭하면 Etherscan 링크로 이동해 컨트랙트 주소를 확인할 수도 있습니다. 이 주소를 퍼셋이나 메타마스크 토큰 추가 시 사용합니다.",
  },
];
