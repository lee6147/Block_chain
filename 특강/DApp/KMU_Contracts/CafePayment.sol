// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./IKUSDC.sol";
import "./ICafePayment.sol";

contract CafePayment is Ownable, ReentrancyGuard, ICafePayment {
    address public override merchantWallet;

    mapping(address => bool) private whitelistedTokens;

    constructor(address _merchantWallet) Ownable(msg.sender) {
        require(_merchantWallet != address(0), "Invalid merchant wallet");
        merchantWallet = _merchantWallet;
    }

    function isWhitelistedToken(address token) external view override returns (bool) {
        return whitelistedTokens[token];
    }

    function setTokenWhitelist(address token, bool allowed) external override onlyOwner {
        require(token != address(0), "Invalid token address");

        whitelistedTokens[token] = allowed;

        emit TokenWhitelistUpdated(token, allowed);
    }

    function pay(
        address token,
        uint256 amount,
        string calldata orderId
    ) external override nonReentrant {
        require(whitelistedTokens[token], "Token is not whitelisted");
        require(amount > 0, "Amount must be greater than zero");

        bool success = IKUSDC(token).transferFrom(
            msg.sender,
            merchantWallet,
            amount
        );

        require(success, "Payment failed");

        emit PaymentReceived(
            msg.sender,
            token,
            amount,
            orderId
        );
    }

    function updateMerchantWallet(address newMerchantWallet) external onlyOwner {
        require(newMerchantWallet != address(0), "Invalid merchant wallet");
        merchantWallet = newMerchantWallet;
    }
}