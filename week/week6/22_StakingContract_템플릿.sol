// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingContract (학생 템플릿)
 * @notice 본인이 만든 ERC20을 담보로 스테이킹하고, 초당 정률 보상을 적립·청구한다.
 *
 * 보상 수식:
 *   Δaccrued = amount × rewardRatePerSecond × Δt / 1e18
 *   (amount: 스테이킹 수량, Δt: 경과 초, rate는 1e18 스케일된 "토큰/초 per 스테이킹 1토큰")
 *
 * ⚠️ 학생 과제: 아래 TODO 네 군데를 직접 채워라.
 *   1) _updateReward — 수식 본체
 *   2) stake       — transferFrom 호출 타이밍 (CEI 순서)
 *   3) claimReward — nonReentrant + CEI
 *   4) pendingReward — 저장된 accrued + 미반영 구간
 *
 * 사전 조건:
 *   - 배포 후 owner(조교 또는 학생 자신)가 리워드 예치를 위해
 *     token.transfer(staking, rewardReserve) 를 먼저 해둬야 실제 지급이 가능하다.
 */
contract StakingContract is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public immutable rewardRatePerSecond; // 1e18 스케일
    uint256 public totalStaked;

    struct UserInfo {
        uint256 amount;      // 현재 스테이킹된 토큰량
        uint256 lastUpdate;  // 마지막 accrued 갱신 시각
        uint256 accrued;     // 아직 청구하지 않은 누적 보상
    }

    mapping(address => UserInfo) public users;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);

    constructor(address token_, uint256 rewardRatePerSecond_) Ownable(msg.sender) {
        require(token_ != address(0), "token=0");
        token = IERC20(token_);
        rewardRatePerSecond = rewardRatePerSecond_;
    }

    // ---------------------------------------------------------------
    // 내부: 시점 보상 반영
    // ---------------------------------------------------------------
    function _updateReward(address user) internal {
        UserInfo storage u = users[user];
        // TODO(1): u.amount > 0 이면 accrued 에
        //          amount * rewardRatePerSecond * (block.timestamp - u.lastUpdate) / 1e18
        //          만큼 더한다. 항상 마지막에 lastUpdate = block.timestamp 갱신.
        //
        // if (u.amount > 0) {
        //     uint256 delta = block.timestamp - u.lastUpdate;
        //     u.accrued += (u.amount * rewardRatePerSecond * delta) / 1e18;
        // }
        // u.lastUpdate = block.timestamp;
    }

    // ---------------------------------------------------------------
    // 외부 상태변경 함수
    // ---------------------------------------------------------------
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        _updateReward(msg.sender);

        // TODO(2): Checks-Effects-Interactions 순서로
        //   1) users[msg.sender].amount += amount;
        //   2) totalStaked += amount;
        //   3) token.transferFrom(msg.sender, address(this), amount) 호출.
        //   transferFrom 전 반드시 학생이 approve 해두었어야 한다.

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        UserInfo storage u = users[msg.sender];
        require(amount > 0 && amount <= u.amount, "bad amount");
        _updateReward(msg.sender);

        u.amount -= amount;
        totalStaked -= amount;
        require(token.transfer(msg.sender, amount), "transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        // TODO(3): _updateReward 호출 → reward 값 캐시 →
        //          accrued 0으로 리셋 (Effects) → token.transfer (Interactions).
        //          reward == 0 이면 revert.
        //
        // _updateReward(msg.sender);
        // uint256 reward = users[msg.sender].accrued;
        // require(reward > 0, "nothing to claim");
        // users[msg.sender].accrued = 0;
        // require(token.transfer(msg.sender, reward), "reward transfer failed");
        // emit RewardPaid(msg.sender, reward);
    }

    // ---------------------------------------------------------------
    // view
    // ---------------------------------------------------------------
    function pendingReward(address user) external view returns (uint256) {
        // TODO(4): 저장된 accrued + 아직 반영 안 된 구간 보상을 합쳐 반환.
        //
        // UserInfo memory u = users[user];
        // uint256 pending = u.accrued;
        // if (u.amount > 0) {
        //     uint256 delta = block.timestamp - u.lastUpdate;
        //     pending += (u.amount * rewardRatePerSecond * delta) / 1e18;
        // }
        // return pending;
        return 0;
    }

    // ---------------------------------------------------------------
    // 조교/학생 유틸: 리워드 예치 회수 (실습 끝난 뒤 정리용)
    // ---------------------------------------------------------------
    function rescueRewardReserve(uint256 amount) external onlyOwner {
        require(
            token.balanceOf(address(this)) - totalStaked >= amount,
            "would break stakers"
        );
        require(token.transfer(msg.sender, amount), "transfer failed");
    }
}
