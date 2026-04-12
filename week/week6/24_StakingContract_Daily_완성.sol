// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakingContract (완성본 · Daily)
 * @notice Sepolia 제출용. rewardRatePerSecond ≈ 1e18 / 86400
 *         → 스테이크 1 토큰당 "하루에 약 1 토큰" 이자.
 *         교수님 시나리오 ("하루 지나면 이자 수령")에 대응.
 *
 * Fast 버전과 로직 완전 동일, 상수 값만 다름.
 */
contract StakingContract is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public immutable rewardRatePerSecond;
    uint256 public totalStaked;

    struct UserInfo {
        uint256 amount;
        uint256 lastUpdate;
        uint256 accrued;
    }

    mapping(address => UserInfo) public users;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);

    constructor(address token_) Ownable(msg.sender) {
        require(token_ != address(0), "token=0");
        token = IERC20(token_);
        // 1e18 / 86400 = 11574074074074 (floor)
        // → 1 토큰 스테이크 × 86400초 × 11574074074074 / 1e18 ≈ 0.9999999... 토큰/일
        rewardRatePerSecond = 11574074074074;
    }

    function _updateReward(address user) internal {
        UserInfo storage u = users[user];
        if (u.amount > 0) {
            uint256 delta = block.timestamp - u.lastUpdate;
            u.accrued += (u.amount * rewardRatePerSecond * delta) / 1e18;
        }
        u.lastUpdate = block.timestamp;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        _updateReward(msg.sender);

        users[msg.sender].amount += amount;
        totalStaked += amount;
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

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
        _updateReward(msg.sender);
        uint256 reward = users[msg.sender].accrued;
        require(reward > 0, "nothing to claim");
        users[msg.sender].accrued = 0;
        require(token.transfer(msg.sender, reward), "reward transfer failed");
        emit RewardPaid(msg.sender, reward);
    }

    function pendingReward(address user) external view returns (uint256) {
        UserInfo memory u = users[user];
        uint256 pending = u.accrued;
        if (u.amount > 0) {
            uint256 delta = block.timestamp - u.lastUpdate;
            pending += (u.amount * rewardRatePerSecond * delta) / 1e18;
        }
        return pending;
    }

    function rescueRewardReserve(uint256 amount) external onlyOwner {
        require(
            token.balanceOf(address(this)) - totalStaked >= amount,
            "would break stakers"
        );
        require(token.transfer(msg.sender, amount), "transfer failed");
    }
}
