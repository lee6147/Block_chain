// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyTokenMintable - 확장 ERC20 토큰 (민팅 + 소각 기능)
 * @notice 소유자(owner)만 추가 민팅이 가능한 확장 버전입니다.
 * @dev Ownable을 상속받아 소유자 권한 관리를 합니다.
 *
 * 추가 기능:
 * - mint(): 소유자만 새로운 토큰 발행 가능
 * - burn(): 누구나 자신의 토큰 소각 가능
 */
contract MyTokenMintable is ERC20, Ownable {
    /**
     * @notice 토큰 생성자
     * @param initialSupply 초기 발행량
     * @dev 배포자가 owner이자 초기 토큰 보유자가 됩니다.
     */
    constructor(uint256 initialSupply)
        ERC20("My Token Mintable", "MTKM")
        Ownable(msg.sender) // msg.sender를 owner로 설정
    {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @notice 새로운 토큰 민팅 (소유자 전용)
     * @param to 토큰을 받을 주소
     * @param amount 민팅할 수량 (wei 단위)
     * @dev onlyOwner 제한자: owner만 호출 가능
     *
     * 사용 예시:
     * - 퍼셋에 토큰 충전할 때
     * - 보상으로 토큰을 추가 발행할 때
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice 토큰 소각 (누구나 자신의 토큰만)
     * @param amount 소각할 수량 (wei 단위)
     * @dev 호출자(msg.sender)의 잔액에서 차감됩니다.
     *
     * 소각 = 영구 제거 (totalSupply 감소)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
