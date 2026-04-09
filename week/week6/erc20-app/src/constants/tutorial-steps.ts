import { TutorialStep } from "@/types";

// 5단계 ERC20 튜토리얼 학습 콘텐츠
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "ERC20이란?",
    description: "토큰 표준이 왜 필요한지, ERC20이 무엇인지 이해합니다.",
    content:
      "ERC20은 이더리움 블록체인 위에서 토큰을 만들 때 지켜야 하는 규칙 집합입니다. 모든 ERC20 토큰은 같은 함수 이름과 동작 방식을 공유하므로 지갑·거래소·DApp이 토큰 종류와 무관하게 동일한 방법으로 상호작용할 수 있습니다.",
    simpleExplanation:
      "전 세계 USB 포트를 USB-A 규격으로 통일했다고 상상해보세요. 어떤 제조사의 USB 장치든 모든 컴퓨터에 꽂을 수 있습니다. ERC20도 마찬가지입니다. 누가 만든 토큰이든 메타마스크, 유니스왑, 코인베이스 어디서든 동일하게 사용할 수 있습니다.",
    technicalExplanation:
      "ERC20(Ethereum Request for Comment 20)은 2015년 파비안 포겔스텔러가 제안한 인터페이스 표준입니다. 스마트 컨트랙트가 `IERC20` 인터페이스를 구현하면, ABI를 알고 있는 모든 클라이언트가 해당 컨트랙트와 통신할 수 있습니다. 이는 다형성(Polymorphism)과 동일한 원리입니다.",
    codeExample: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ERC20 인터페이스 — 이 6개 함수를 구현해야 ERC20 토큰이 됩니다
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}`,
  },
  {
    id: 2,
    title: "핵심 함수 6개",
    description:
      "totalSupply, balanceOf, transfer, approve, allowance, transferFrom의 역할을 익힙니다.",
    content:
      "ERC20 표준은 6개의 필수 함수를 정의합니다. 읽기 전용(view) 함수 3개와 상태를 변경하는 함수 3개로 구성됩니다. 이 6개를 이해하면 ERC20 토큰의 80%를 이해한 것입니다.",
    simpleExplanation:
      "은행 통장을 생각해보세요. totalSupply는 '총 발행된 돈', balanceOf는 '내 잔액 조회', transfer는 '송금', approve는 '자동이체 등록', allowance는 '자동이체 한도 조회', transferFrom은 '등록된 자동이체 실행'입니다.",
    technicalExplanation:
      "view 함수(totalSupply, balanceOf, allowance)는 가스를 소모하지 않습니다. 상태 변경 함수(transfer, approve, transferFrom)는 트랜잭션을 생성하며 가스가 필요합니다. approve + transferFrom 조합은 DEX나 DApp이 사용자 대신 토큰을 처리할 수 있게 하는 위임 메커니즘입니다.",
    codeExample: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    // 1. 총 발행량 조회 (가스 무료)
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // 2. 특정 주소의 잔액 조회 (가스 무료)
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // 3. 직접 송금 — msg.sender → to
    function transfer(address to, uint256 amount) public returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }

    // 4. spender가 내 토큰을 쓸 수 있도록 허용
    function approve(address spender, uint256 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    // 5. 허용된 한도 조회 (가스 무료)
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    // 6. 허용된 한도 안에서 위임 송금 — from → to (spender가 호출)
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        _allowances[from][msg.sender] -= amount; // 한도 차감
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
}`,
  },
  {
    id: 3,
    title: "이벤트 (Events)",
    description:
      "Transfer, Approval 이벤트가 블록체인에 기록되는 방식과 프론트엔드 활용법을 배웁니다.",
    content:
      "이벤트는 스마트 컨트랙트가 외부에 '이런 일이 일어났습니다'라고 알리는 수단입니다. 블록체인 로그에 저장되며 가스 비용이 일반 storage보다 훨씬 저렴합니다. ERC20은 Transfer와 Approval 두 가지 이벤트를 표준으로 정의합니다.",
    simpleExplanation:
      "카페에서 주문하면 진동벨이 울리는 것처럼, 토큰 전송이 일어나면 Transfer 이벤트가 '진동'합니다. 지갑 앱·블록 탐색기·대시보드는 이 진동을 감지해서 실시간으로 거래 내역을 업데이트합니다.",
    technicalExplanation:
      "이벤트는 EVM 로그(LOG opcode)로 기록되며, 블록체인에 영구 저장되지만 스마트 컨트랙트 내부에서 읽을 수는 없습니다. `indexed` 키워드가 붙은 파라미터는 필터링에 사용됩니다. viem/ethers.js의 `watchContractEvent` 또는 `getLogs`로 구독·조회할 수 있습니다.",
    codeExample: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    // Transfer 이벤트: 토큰이 이동할 때마다 발생 (발행·소각 포함)
    event Transfer(
        address indexed from, // indexed: 이 주소로 필터링 가능
        address indexed to,
        uint256 value
    );

    // Approval 이벤트: approve 호출 시 발생
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    function transfer(address to, uint256 amount) public returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        emit Transfer(msg.sender, to, amount); // 이벤트 발생
        return true;
    }

    // 토큰 발행 시: from을 address(0)으로 설정하는 관례
    function _mint(address to, uint256 amount) internal {
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount); // from = 0x000...000
    }
}

/* --- 프론트엔드에서 이벤트 감지 (viem 예시) ---
const unwatch = publicClient.watchContractEvent({
  address: TOKEN_ADDRESS,
  abi: ERC20_ABI,
  eventName: 'Transfer',
  onLogs: (logs) => console.log('새 전송:', logs),
})
*/`,
  },
  {
    id: 4,
    title: "전체 코드 해설",
    description: "MyToken.sol 전체 코드를 라인별로 이해합니다.",
    content:
      "OpenZeppelin의 ERC20 구현을 상속하는 MyToken.sol 전체를 분석합니다. 각 라인이 무엇을 하는지, 왜 필요한지 설명합니다.",
    simpleExplanation:
      "레고 세트에서 ERC20 베이스 블록을 OpenZeppelin이 이미 만들어 두었습니다. MyToken은 그 블록 위에 '이름, 심볼, 초기 발행량'만 지정해서 나만의 토큰을 완성합니다.",
    technicalExplanation:
      "OpenZeppelin의 ERC20.sol은 감사(audit)를 통과한 안전한 구현체입니다. `constructor`에서 `_mint`를 호출하면 배포자 주소에 초기 토큰이 발행되며, Transfer(address(0), deployer, initialSupply) 이벤트가 발생합니다. decimals()는 기본값 18을 반환하며, 이는 1 토큰 = 10^18 최소 단위를 의미합니다.",
    codeExample: `// SPDX-License-Identifier: MIT
// 1. 라이선스 선언 — 오픈소스 공개 (MIT)
pragma solidity ^0.8.20;
// 2. 컴파일러 버전 지정 — 0.8.20 이상 사용

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 3. OpenZeppelin ERC20 베이스 컨트랙트 불러오기
//    totalSupply, balanceOf, transfer 등 6개 함수가 이미 구현되어 있음

contract MyToken is ERC20 {
// 4. MyToken이 ERC20을 상속(inheritance)
//    is 키워드로 부모 컨트랙트의 모든 기능을 물려받음

    constructor(
        string memory name,    // 5. 토큰 이름 (예: "MyToken")
        string memory symbol,  // 6. 토큰 심볼 (예: "MTK")
        uint256 initialSupply  // 7. 초기 발행량 (단위: wei, 1 MTK = 10^18)
    ) ERC20(name, symbol) {
    // 8. 부모 ERC20 생성자 호출 — 이름과 심볼 저장

        _mint(msg.sender, initialSupply);
        // 9. msg.sender = 배포자 주소
        //    initialSupply만큼 토큰을 배포자에게 발행
        //    Transfer(address(0), msg.sender, initialSupply) 이벤트 발생
    }

    // 10. decimals()는 ERC20에서 기본 18을 반환
    //     오버라이드하면 소수점 자릿수 변경 가능
    // function decimals() public pure override returns (uint8) {
    //     return 6; // USDC처럼 소수점 6자리로 변경
    // }
}`,
  },
  {
    id: 5,
    title: "확장 기능",
    description: "mint, burn, pause 등 실무에서 자주 쓰이는 확장 기능을 배웁니다.",
    content:
      "기본 ERC20 위에 추가 기능을 얹어 실용적인 토큰을 만드는 방법을 배웁니다. OpenZeppelin은 이러한 확장을 믹스인(mixin) 형태로 제공합니다.",
    simpleExplanation:
      "기본 스마트폰에 케이스(Mintable), 배터리팩(Burnable), 잠금장치(Pausable)를 추가하는 것과 같습니다. 필요한 기능만 골라서 붙이면 됩니다.",
    technicalExplanation:
      "OpenZeppelin의 ERC20Mintable, ERC20Burnable, ERC20Pausable 등은 다중 상속으로 조합합니다. Pausable은 비상 정지(Circuit Breaker) 패턴으로, 해킹 감지 시 토큰 이동을 즉시 중단할 수 있습니다. Ownable과 함께 사용해 권한을 제한합니다.",
    codeExample: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdvancedToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    constructor(address initialOwner)
        ERC20("AdvancedToken", "ADV")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    // ── Mintable: 오너만 추가 발행 가능 ──
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        // Transfer(address(0), to, amount) 이벤트 발생
    }

    // ── Burnable: 누구나 자신의 토큰을 소각 가능 ──
    // burn(amount) 함수는 ERC20Burnable에서 상속됨
    // Transfer(holder, address(0), amount) 이벤트 발생

    // ── Pausable: 비상 정지 / 재개 (오너 전용) ──
    function pause() public onlyOwner {
        _pause(); // 모든 transfer 중단
    }

    function unpause() public onlyOwner {
        _unpause(); // 재개
    }

    // ERC20Pausable이 _update를 오버라이드하므로 아래 코드 필요
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}`,
  },
];
