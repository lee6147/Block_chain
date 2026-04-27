# Week3 테스트넷, Gas, Nonce, Signature

## 학습 목표

- 테스트넷 ETH를 받는 문제와 트랜잭션을 실행하는 문제를 분리해서 설명할 수 있다.
- `nonce`, `gas`, `signature`가 트랜잭션 실패 원인 분석에 어떻게 쓰이는지 이해한다.
- Sepolia L1, Base Sepolia L2, GIWA Sepolia L2의 실습 위치를 기존 Week3 자료와 연결한다.
- Explorer에서 트랜잭션 해시, 상태, gas 사용량, nonce, 서명 정보를 읽고 "무엇이 실패했는지"를 좁힐 수 있다.
- `insufficient funds`, `nonce too low`, `gas limit`, `execution reverted`, pending 상태를 도구 고장이 아니라 잔고, 네트워크, nonce, contract 조건, 서명 문제로 분해한다.

## 비유로 먼저 이해하기

Week3의 트랜잭션은 "등기 택배 접수"와 비슷하다.

| 블록체인 개념 | 택배 비유 | 핵심 의미 |
| --- | --- | --- |
| Faucet | 실습용 우표를 나눠주는 안내 데스크 | 실제 돈이 아니라 테스트넷에서 수수료를 낼 연료를 받는 곳 |
| 잔고 | 우표와 배송비가 들어 있는 지갑 | 보낼 금액과 수수료를 함께 감당해야 함 |
| Nonce | 택배 송장 일련번호 | 같은 택배가 두 번 접수되지 않게 하고 순서를 맞춤 |
| Gas limit | 배송에 쓸 수 있는 최대 예산 | 너무 낮으면 배송 중 중단됨 |
| Gas price/fee | 배송비 단가와 최종 배송비 | 네트워크가 트랜잭션 처리에 요구하는 비용 |
| Signature | 위조 불가능한 도장 | "이 접수는 내가 승인했다"는 증명 |
| Explorer | 택배 추적 페이지 | 접수, 이동, 완료, 실패 상태를 공개적으로 확인 |

중요한 점은 Faucet과 트랜잭션 실행이 같은 단계가 아니라는 것이다. Faucet에서 테스트 ETH를 받지 못한 것은 "우표를 못 받은 문제"이고, 이미 받은 뒤 송금이 실패하는 것은 "택배 접수서, 배송비, 송장 번호, 도장, 수신 조건 중 하나가 틀린 문제"다. 둘을 섞으면 학생은 "MetaMask가 이상하다" 또는 "네트워크가 고장났다"로만 기억하게 된다.

## 정석 개념 설명

테스트넷은 실제 메인넷 자산을 쓰지 않고 지갑, RPC, 트랜잭션, Explorer, 스마트 컨트랙트 호출을 연습하는 네트워크다. Week3 기존 자료 기준으로 실습은 Sepolia L1, Base Sepolia L2, GIWA Sepolia L2를 사용하며, 각 네트워크는 Chain ID, RPC URL, Explorer, Faucet이 다르다. 테스트넷 ETH는 채굴하는 것이 아니라 Faucet에서 정해진 조건에 따라 수령한다.

트랜잭션은 대략 다음 구조로 움직인다.

```text
사용자 요청
-> 지갑이 네트워크와 잔고 확인
-> nonce 결정
-> gas 추정
-> 개인키로 서명 생성
-> RPC 노드에 전송
-> 노드가 서명, nonce, 잔고, gas 조건 검증
-> 블록 포함
-> receipt와 Explorer에서 결과 확인
```

`nonce`는 계정별 트랜잭션 순번이다. 정의상 한 번만 쓰이는 번호이며, 같은 계정에서 보낸 트랜잭션은 nonce 순서대로 처리된다. 현재 nonce가 5라면 다음 정상 트랜잭션은 5번이어야 한다. 이미 4번까지 처리되었는데 3번을 다시 보내면 `nonce too low`가 되고, 7번을 먼저 보내면 5번과 6번이 처리되기 전까지 pending으로 남을 수 있다.

`gas`는 EVM이 트랜잭션을 처리하는 데 필요한 비용 단위다. 단순 ETH 전송은 보통 21,000 gas가 기본값이고, 스마트 컨트랙트 호출은 코드 실행량과 상태 변경량에 따라 더 많이 든다. 공식은 단순화하면 다음과 같다.

```text
실제 수수료 = gasUsed x gasPrice
필요 잔고 = 전송 금액 + 최대 지불 가능 수수료
```

이 공식은 초심자용 압축 표현이다. 실제 EIP-1559 기반 네트워크나 Explorer 화면에서는 `base fee`, `priority fee`, `max fee`, `effective gas price`처럼 더 나뉘어 표시될 수 있다. 지갑은 보통 사전 잔고 확인을 `전송 금액 + gasLimit * maxFeePerGas` 기준으로 보수적으로 보고, 실제 과금은 `gasUsed * effectiveGasPrice`에 가깝다. `effectiveGasPrice`는 대략 `min(maxFee, baseFee + priorityFee)`로 이해하되, 실제 priority fee는 `maxFee - baseFee`를 넘을 수 없어 잘릴 수 있다. 수업에서는 먼저 "실행량과 적용 단가가 곱해져 실제 비용이 된다"는 감각을 잡고, 낮은 fee 때문에 오래 pending되거나 더 높은 fee의 replacement transaction으로 바뀔 수 있다는 점을 보충한다.

`gas limit`은 내가 허용한 최대 실행량이고, `gas used`는 실제 사용량이다. gas limit이 너무 낮으면 실행 도중 멈추며, 이미 사용한 gas는 일반적으로 돌려받지 못한다. 반대로 gas limit이 충분해도 잔고가 전송 금액과 수수료를 함께 감당하지 못하면 `insufficient funds`가 난다.

`signature`는 개인키로 만든 디지털 서명이다. 이더리움 트랜잭션에는 `r`, `s`, `v` 서명 값이 포함되며, 노드는 이 값과 트랜잭션 내용을 사용해 보낸 주소를 복원한다. 복원된 주소가 `from` 주소와 같으면 "이 주소의 개인키 소유자가 승인했다"고 판단한다. 개인키는 네트워크에 전송되지 않고, 서명만 전송된다.

Faucet 수령 문제와 트랜잭션 실행 오류는 원인이 다르다.

| 구분 | 대표 증상 | 원인 후보 | 먼저 볼 것 |
| --- | --- | --- | --- |
| Faucet 수령 문제 | Faucet 페이지에서 실패, captcha 오류, 24시간 제한, 주소 입력 후 잔고 변화 없음 | Faucet 제한, captcha, 잘못된 네트워크, 잘못된 주소, Faucet 자체 대기열 | Faucet 화면 메시지, 입력 주소, 대상 네트워크, Explorer의 해당 주소 잔고 |
| 트랜잭션 실행 오류 | MetaMask 확인 후 실패, pending, `insufficient funds`, `nonce too low`, `execution reverted` | 잔고 부족, nonce 충돌, gas limit 부족, contract require 실패, 잘못된 네트워크, allowance/lock 같은 상태 조건 | 지갑 네트워크, 잔고, pending tx, Explorer receipt, 컨트랙트 호출 조건 |

Faucet에서 ETH를 받지 못했으면 아직 수수료를 낼 연료가 없는 것이다. 반면 Faucet 수령은 되었는데 송금이나 컨트랙트 호출이 실패했다면 트랜잭션 실행 단계의 조건을 봐야 한다.

## 개념 보강 블록

| 핵심 개념 | 비유 | 정석 정의 | 왜 중요한가 | 실습에서 어디에 보이나 | 자주 하는 오해 | 확인 질문 |
| --- | --- | --- | --- | --- | --- | --- |
| Faucet | 실습용 우표 배급소 | 테스트넷에서 gas용 native token을 받는 준비 단계 | Faucet 실패와 트랜잭션 실패를 분리해야 한다 | Faucet 화면, 주소 잔고 변화, Explorer balance | Faucet 실패는 이미 보낸 트랜잭션 실패다 | 아직 tx hash가 없다면 어느 단계 문제인가? |
| Nonce | 송장 일련번호 | 계정별 트랜잭션 순번 | 중복 실행을 막고 계정 트랜잭션 순서를 맞춘다 | `01-check-balance.js`, `03-track-tx.js`, Explorer nonce | nonce too low는 MetaMask 버그다 | 이미 사용된 nonce를 다시 보내면 어떤 오류가 나는가? |
| Gas | 실행 예산 | EVM 연산과 상태 변경에 필요한 비용 단위 | 잔고는 전송 금액뿐 아니라 수수료까지 감당해야 한다 | gas limit, gasUsed, fee, insufficient funds | gas limit을 높이면 모든 오류가 해결된다 | require 실패와 out of gas는 무엇이 다른가? |
| Signature | 위조 방지 도장 | 개인키로 만든 트랜잭션 승인 증명 | 개인키 없이도 서명자 주소를 검증할 수 있다 | `04-verify-sig.js`, `r/s/v`, recovered address | 서명은 개인키를 공개하는 것이다 | 서명 검증에서 비교하는 두 주소는 무엇인가? |

## 수업 실습과 연결

Week3 실습 폴더 `week/week3-sepolia-lab`은 이 개념을 CLI와 웹 UI 두 경로로 확인하게 만든다.

| 실습 위치 | 확인하는 개념 | 학생이 봐야 할 결과 |
| --- | --- | --- |
| `scripts/01-check-balance.js` | 잔고와 현재 nonce 조회 | 주소, 잔고, 다음 nonce |
| `scripts/02-send-eth.js` | 실제 송금, nonce 증가, gas 수수료 | 송금 전후 nonce 변화, tx hash, fee |
| `scripts/03-track-tx.js` | 트랜잭션 추적 | from, to, value, nonce, gas, receipt |
| `scripts/04-verify-sig.js` | 서명 검증 | ecrecover로 복원한 주소와 `tx.from` 비교 |
| `scripts/05-bridge-tx.js` | L1/L2 브릿지 트랜잭션 분석 | 단순 전송과 data가 있는 컨트랙트 호출 구분 |
| `html/index.html` | MetaMask 기반 웹 실습 | 지갑 연결, 네트워크 선택, 송금, 추적 |
| `html/guide.html` | 개념+실습 가이드 | Nonce, Gas, Signature를 화면과 연결 |

Nonce는 `latest/confirmed`와 `pending` 기준을 나눠 읽어야 한다. `tx nonce < latest nonce`이면 이미 확정된 순번을 다시 쓰는 `nonce too low`에 가깝다. `latest nonce <= tx nonce < pending nonce`이면 이미 같은 계정에 pending 트랜잭션이 있어 replacement 또는 speed up/cancel 후보일 수 있다. `tx nonce > pending nonce`이면 중간 nonce가 비어 뒤 트랜잭션이 기다릴 수 있다.

학생에게는 실행 순서를 이렇게 고정해서 안내하는 편이 좋다.

1. MetaMask 네트워크가 현재 실습 네트워크와 같은지 확인한다.
2. Faucet에서 해당 네트워크의 테스트 ETH를 받는다.
3. Explorer에서 내 주소 잔고가 실제로 증가했는지 확인한다.
4. `01-check-balance.js`로 CLI가 보는 잔고와 nonce를 확인한다.
5. 자기 자신에게 아주 작은 금액을 보내 `02-send-eth.js`가 정상 작동하는지 확인한다.
6. tx hash를 `03-track-tx.js`와 Explorer에서 열어 nonce, gas, receipt를 확인한다.
7. `04-verify-sig.js`로 "개인키를 공개하지 않아도 서명자를 검증한다"는 점을 확인한다.

설문 요약에서 학생들은 테스트넷 실행, MetaMask, Faucet, Etherscan/Explorer 확인은 기억에 많이 남았지만, 초반 용어와 오류 원인 구분이 어렵다고 응답했다. 따라서 Week3 보강 자료는 "어떤 버튼을 눌러라"보다 "오류가 어느 단계에서 생겼는지"를 먼저 묻게 해야 한다.

## 자주 헷갈리는 지점

| 헷갈리는 말 | 정확한 구분 |
| --- | --- |
| "Faucet이 안 되니 트랜잭션이 실패했다" | Faucet 실패는 수령 단계 문제다. 트랜잭션 실패는 이미 보낸 트랜잭션의 검증/실행 단계 문제다. |
| "테스트넷 ETH를 채굴한다" | Week3 자료 기준 실습용 ETH는 Faucet에서 수령한다. 채굴한다고 표현하지 않는다. |
| "잔고가 있는데 insufficient funds가 난다" | 전송 금액만 볼 것이 아니라 전송 금액 + gas까지 합쳐야 한다. 네트워크가 다르면 해당 네트워크 잔고도 별도다. |
| "`nonce too low`는 MetaMask 오류다" | 이미 사용된 nonce를 다시 쓰려는 것이다. pending 포함 nonce와 확정 nonce를 구분해야 한다. |
| "pending이면 무조건 실패다" | pending은 아직 블록에 포함되지 않았다는 뜻이다. 낮은 수수료, 빠진 nonce, RPC 지연 등 원인을 나눠 본다. |
| "`gas limit`을 높이면 항상 해결된다" | out of gas에는 도움이 될 수 있지만, `require` 실패나 잔고 부족, 잘못된 네트워크 문제는 해결하지 못한다. |
| "`execution reverted`는 gas 문제다" | 많은 경우 컨트랙트 내부 조건 실패다. `require`, allowance, lock, 권한, 입력값을 확인한다. |
| "서명은 개인키를 보내는 것이다" | 개인키는 보내지 않는다. 트랜잭션 내용에 대한 서명값 `r`, `s`, `v`만 공개된다. |
| "Explorer에 안 보이면 사라졌다" | tx hash, 네트워크 Explorer, RPC 전송 성공 여부를 먼저 확인한다. Sepolia tx를 GIWA Explorer에서 찾으면 안 보일 수 있다. |

대표 에러를 좁히는 순서는 다음과 같다.

| 메시지/상태 | 우선 의심 | 다음 확인 |
| --- | --- | --- |
| Faucet captcha/limit | Faucet 수령 제한 | 다른 Faucet, 24시간 제한, 주소 형식 |
| 잔고 0 | Faucet 미수령 또는 다른 네트워크 | Explorer 주소 잔고, MetaMask 네트워크 |
| `insufficient funds` | 전송 금액 + gas 부족 | value를 낮추거나 Faucet 수령 확인 |
| `nonce too low` | 이미 처리된 nonce 재사용 | pending nonce 조회, 지갑 활동 기록 |
| 오래 pending | 빠진 nonce 또는 낮은 fee | 같은 계정의 pending tx, replacement 가능 여부 |
| `intrinsic gas too low` | gas limit 하한 미달 | 단순 전송은 21,000 이상 |
| `execution reverted` | 컨트랙트 조건 실패 | `require`, 입력값, allowance, lock, 권한 |
| signature mismatch | 서명자 불일치 또는 잘못된 tx 재구성 | chainId, raw transaction, `tx.from` 비교 |

## HTML 시뮬레이터 설계

이 MD의 HTML 확장판은 새 HTML을 지금 만들지 않고, 다음 설계를 따라 제작한다.

시뮬레이터 이름: "트랜잭션 성공/실패 판별기"

목적: 학생이 잔고, 전송 금액, gas, nonce, pending 상태, 서명 상태를 조절하면 왜 성공하거나 실패하는지 즉시 확인한다.

필수 입력 컨트롤:

- 네트워크 선택: Sepolia L1, Base Sepolia L2, GIWA Sepolia L2
- Faucet 수령 상태: 미수령, 요청 중, 수령 완료, 제한/실패
- 지갑 잔고 입력: 예 `0`, `0.0005`, `0.01`
- 전송 금액 입력: 예 `0.001`
- gas limit 입력: 기본 `21000`, 낮은 값 선택 가능
- gas price 또는 예상 수수료 입력
- 현재 확정 nonce와 pending nonce 표시
- 보낼 트랜잭션 nonce 선택
- 서명 상태: 정상 서명, 다른 chainId 서명, 서명 없음
- 컨트랙트 호출 여부: 단순 전송, require 조건 있음
- 초기화 버튼

판정 로직:

```text
1. Faucet 상태가 수령 완료가 아니고 잔고가 0이면 "Faucet 수령 문제"로 분류
2. 네트워크가 맞지 않으면 "네트워크/Explorer 불일치"로 분류
3. 잔고 < 전송 금액 + 예상 최대 수수료이면 "insufficient funds"
4. tx nonce < latest/confirmed nonce이면 "nonce too low"
5. latest/confirmed nonce <= tx nonce < pending nonce이면 "같은 nonce pending 또는 replacement 후보"
6. tx nonce > pending nonce이면 "빠진 nonce 때문에 pending 가능"
7. gas limit < 필요한 gas이면 "intrinsic gas too low 또는 out of gas"
8. 서명 chainId가 현재 네트워크와 다르면 "signature/chainId 문제"
9. 컨트랙트 require 조건이 false이면 "execution reverted"
10. 모두 통과하면 "전송 가능, receipt에서 gasUsed 확인"
```

화면 구성:

- 왼쪽: 조건 입력 패널
- 가운데: 트랜잭션 생애주기 타임라인 `Faucet -> 잔고 -> nonce -> gas -> signature -> RPC -> block -> receipt`
- 오른쪽: 원인 분류 결과와 학생용 조치
- 하단: "Explorer에서 확인할 필드" 표

실습 연결 문구:

- Faucet 단계 결과는 `week/week3-sepolia-lab/screenshots/08-faucet-claim-request.png`, `10-captcha-error.png`, `11-balance-received.png`와 연결한다.
- 송금 성공 결과는 `scripts/02-send-eth.js`, `screenshots/15-send-success.png`와 연결한다.
- tx 추적과 서명 검증은 `scripts/03-track-tx.js`, `scripts/04-verify-sig.js`, `screenshots/16-tx-tracking.png`, `17-sig-verify-success.png`와 연결한다.

## 체크리스트

- [ ] 지금 보는 네트워크가 Sepolia, Base Sepolia, GIWA Sepolia 중 어느 것인지 말할 수 있다.
- [ ] Faucet 수령 실패와 트랜잭션 실행 실패를 다른 문제로 분리했다.
- [ ] Explorer에서 내 주소 잔고가 증가했는지 확인했다.
- [ ] 송금 전후 nonce가 +1 되는 것을 확인했다.
- [ ] `gasLimit`, `gasUsed`, `gasPrice`의 차이를 설명할 수 있다.
- [ ] `insufficient funds`를 전송 금액 부족이 아니라 전송 금액 + gas 부족으로 계산했다.
- [ ] `nonce too low`가 이미 사용된 순번 문제임을 설명할 수 있다.
- [ ] `execution reverted`가 컨트랙트 조건 실패일 수 있음을 확인했다.
- [ ] 서명값 `r`, `s`, `v`가 개인키 자체가 아님을 설명할 수 있다.
- [ ] CLI 지갑의 `.env` 개인키와 MetaMask 계정이 같은 주소인지 확인했다.

## 참고한 기존 자료

- `이론보강/START_HERE.md`
- `이론보강/00_HARNESS_CONTRACT.md`
- `이론보강/01_SOURCE_MANIFEST.md`
- `이론보강/03_EXISTING_HTML_REVIEW.md`
- `이론보강/tasks/agent-md-week3-4.md`
- `week/week3-sepolia-lab/README.md`
- `week/week3-sepolia-lab/CONCEPT-FLOW-GUIDE.md`
- `week/week3-sepolia-lab/concepts/02-중급-Nonce-Gas-Signature.md`
- `week/week3-sepolia-lab/concepts/04-실습-송금과-트랜잭션-추적.md`
- `week/week3-sepolia-lab/html/guide.html`
- `week/week3-sepolia-lab/html/index.html`
- `week/week3-sepolia-lab/scripts/01-check-balance.js`
- `week/week3-sepolia-lab/scripts/02-send-eth.js`
- `week/week3-sepolia-lab/scripts/03-track-tx.js`
- `week/week3-sepolia-lab/scripts/04-verify-sig.js`
- `week/week3-sepolia-lab/scripts/05-bridge-tx.js`
- `실습/03.31 강의자료.pdf`
- `실습/03.31 실습자료.pdf`
- `피드백/survey_priority_summary.md`
