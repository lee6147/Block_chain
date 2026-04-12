// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ExampleToken (HNL 호환 예제)
 * @notice Week5 복습용 ERC20. 학생은 이 파일을 참고해 본인만의 토큰을 만든다.
 * @dev decimals는 ERC20 기본값(18) 사용. 생성자에서 owner에게 initialSupply를 mint.
 */
contract ExampleToken is ERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /// @notice owner 전용 추가 발행. 테스트 편의 기능이며, 실운영 토큰에서는 제거 권장.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
