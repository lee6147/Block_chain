// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MyToken - 기본 ERC20 토큰
 * @notice 이 컨트랙트는 ERC20 표준을 따르는 가장 기본적인 토큰입니다.
 * @dev OpenZeppelin의 ERC20 구현을 상속받아 사용합니다.
 *
 * ERC20 표준 함수:
 * - totalSupply(): 전체 발행량 조회
 * - balanceOf(address): 특정 주소의 잔액 조회
 * - transfer(to, amount): 토큰 전송
 * - approve(spender, amount): 제3자에게 사용 권한 부여
 * - allowance(owner, spender): 승인된 사용량 조회
 * - transferFrom(from, to, amount): 승인받은 토큰 전송
 */
contract MyToken is ERC20 {
    /**
     * @notice 토큰 생성자
     * @param initialSupply 초기 발행량 (단위: 토큰 개수, decimals 자동 적용)
     * @dev msg.sender에게 초기 발행량 전체를 민팅합니다.
     *
     * 예시: initialSupply = 1000 이면
     * 실제 발행량 = 1000 * 10^18 = 1000000000000000000000 (wei 단위)
     */
    constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
        // msg.sender = 컨트랙트를 배포하는 사람의 지갑 주소
        // decimals() = 18 (기본값)
        // initialSupply * 10 ** decimals() = 실제 토큰 수량 (wei 단위로 변환)
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
