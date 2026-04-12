// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Faucet
 * @notice 조교가 배포하는 실습용 토큰 분배 컨트랙트.
 * @dev 조교가 ExampleToken을 별도로 배포하고 Faucet에 대량 transfer 해두면,
 *      학생은 cooldown 간격으로 requestTokens()를 호출해 실습 토큰을 수령한다.
 */
contract Faucet is Ownable {
    IERC20 public immutable token;
    uint256 public amountPerRequest;
    uint256 public cooldown;

    mapping(address => uint256) public lastRequest;

    event TokensRequested(address indexed user, uint256 amount);
    event ParamsUpdated(uint256 amountPerRequest, uint256 cooldown);

    constructor(
        address token_,
        uint256 amountPerRequest_,
        uint256 cooldown_
    ) Ownable(msg.sender) {
        require(token_ != address(0), "token=0");
        token = IERC20(token_);
        amountPerRequest = amountPerRequest_;
        cooldown = cooldown_;
    }

    /// @notice cooldown이 지났을 때 한 번에 amountPerRequest 만큼 수령.
    function requestTokens() external {
        require(
            block.timestamp >= lastRequest[msg.sender] + cooldown,
            "cooldown not passed"
        );
        require(
            token.balanceOf(address(this)) >= amountPerRequest,
            "faucet empty"
        );
        lastRequest[msg.sender] = block.timestamp;
        require(token.transfer(msg.sender, amountPerRequest), "transfer failed");
        emit TokensRequested(msg.sender, amountPerRequest);
    }

    /// @notice 조교가 Faucet에 토큰 충전. 사전에 approve 필요.
    function refill(uint256 amount) external onlyOwner {
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "transferFrom failed"
        );
    }

    /// @notice 조교가 Faucet 잔량 회수.
    function withdrawAll() external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        require(token.transfer(msg.sender, bal), "transfer failed");
    }

    /// @notice 파라미터 조정.
    function setParams(uint256 amountPerRequest_, uint256 cooldown_) external onlyOwner {
        amountPerRequest = amountPerRequest_;
        cooldown = cooldown_;
        emit ParamsUpdated(amountPerRequest_, cooldown_);
    }

    /// @notice 다음 수령 가능 시각 (UNIX). 0이면 바로 가능.
    function nextAvailable(address user) external view returns (uint256) {
        uint256 next = lastRequest[user] + cooldown;
        return next <= block.timestamp ? 0 : next;
    }
}
