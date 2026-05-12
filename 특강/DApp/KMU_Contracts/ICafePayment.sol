// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ICafePayment {
    function merchantWallet() external view returns (address);

    function isWhitelistedToken(address token) external view returns (bool);

    function setTokenWhitelist(address token, bool allowed) external;

    function pay(
        address token,
        uint256 amount,
        string calldata orderId
    ) external;

    event TokenWhitelistUpdated(address indexed token, bool allowed);

    event PaymentReceived(
        address indexed payer,
        address indexed token,
        uint256 amount,
        string orderId
    );
}