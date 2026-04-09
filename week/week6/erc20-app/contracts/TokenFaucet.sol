// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenFaucet - 토큰 퍼셋 (수도꼭지)
 * @notice 학생들이 테스트용 토큰을 무료로 받을 수 있는 퍼셋입니다.
 * @dev 퍼셋 = "수도꼭지"라는 뜻. 테스트 환경에서 토큰을 배포하는 장치.
 *      SafeERC20으로 transfer 반환값을 자동 검증하고,
 *      ReentrancyGuard로 재진입 공격을 방어합니다.
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
contract TokenFaucet is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
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

    /**
     * @notice 퍼셋 생성자
     * @param tokenAddress 배포할 ERC20 토큰의 컨트랙트 주소
     */
    constructor(address tokenAddress) Ownable(msg.sender) {
        // IERC20 인터페이스로 토큰 컨트랙트에 접근
        token = IERC20(tokenAddress);
    }

    /**
     * @notice 토큰 요청 (claim)
     * @dev 쿨다운 확인 → 잔액 확인 → 토큰 전송 → 시간 기록
     *
     * require = 조건이 거짓이면 트랜잭션 취소 (가스비 환불)
     * block.timestamp = 현재 블록의 시간 (초 단위 유닉스 타임스탬프)
     */
    /**
     * CEI 패턴 (Checks-Effects-Interactions):
     * 1. Checks: 조건 검증
     * 2. Effects: 상태 변경 (외부 호출보다 먼저!)
     * 3. Interactions: 외부 컨트랙트 호출
     */
    function claim() external nonReentrant {
        // 1. Checks: 쿨다운 및 잔액 확인
        require(
            block.timestamp >= lastClaimTime[msg.sender] + cooldownTime,
            unicode"아직 쿨다운 중입니다. 24시간 후에 다시 시도하세요."
        );
        require(
            token.balanceOf(address(this)) >= claimAmount,
            unicode"퍼셋에 토큰이 부족합니다. 관리자에게 문의하세요."
        );

        // 2. Effects: 상태 변경을 외부 호출보다 먼저 (재진입 방지)
        lastClaimTime[msg.sender] = block.timestamp;

        // 3. Interactions: SafeERC20으로 반환값 자동 검증
        token.safeTransfer(msg.sender, claimAmount);

        emit TokensClaimed(msg.sender, claimAmount, block.timestamp);
    }

    /**
     * @notice 퍼셋에 토큰 충전 (owner 전용)
     * @param amount 충전할 토큰 수량 (wei 단위)
     * @dev 호출 전에 token.approve(faucetAddress, amount) 필요!
     *
     * transferFrom 흐름:
     * 1. owner가 토큰 컨트랙트에서 approve(퍼셋주소, 수량) 호출
     * 2. 이 함수에서 transferFrom(owner, 퍼셋, 수량) 호출
     */
    function deposit(uint256 amount) external onlyOwner {
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(msg.sender, amount);
    }

    /**
     * @notice 1회 배포량 변경 (owner 전용)
     * @param newAmount 새로운 배포량 (wei 단위)
     */
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        claimAmount = newAmount;
    }

    /**
     * @notice 쿨다운 시간 변경 (owner 전용)
     * @param newCooldown 새로운 쿨다운 (초 단위)
     */
    function setCooldownTime(uint256 newCooldown) external onlyOwner {
        cooldownTime = newCooldown;
    }

    /**
     * @notice 퍼셋의 토큰 잔액 조회
     * @return 퍼셋이 보유한 토큰 수량
     */
    function faucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice 특정 주소의 다음 요청 가능 시간 조회
     * @param user 확인할 주소
     * @return 다음 요청 가능한 유닉스 타임스탬프 (0이면 즉시 가능)
     */
    function nextClaimTime(address user) external view returns (uint256) {
        uint256 lastClaim = lastClaimTime[user];
        if (lastClaim == 0) return 0; // 한 번도 요청하지 않은 경우
        return lastClaim + cooldownTime;
    }
}
