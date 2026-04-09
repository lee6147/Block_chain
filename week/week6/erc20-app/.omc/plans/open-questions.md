# Open Questions

## erc20-tutorial-dapp - 2026-04-09

- [ ] Web3 라이브러리 선택: viem+wagmi vs ethers.js — wagmi가 React 훅 패턴에 적합하고 타입 안전성이 높아 권장하지만, 학생들이 ethers.js 예제를 더 많이 접했을 수 있음. 교수님 또는 학생 선호도 확인 필요
- [ ] RPC Provider 선택: Alchemy vs Infura vs Public RPC — 수업 중 30명+ 동시 접속 시 rate limit 문제. 교수님이 Alchemy/Infura 교육용 API키를 보유하고 있는지 확인 필요
- [ ] 컨트랙트 주소 공유 방식: 학생 각자 배포 vs TA가 미리 배포한 공용 컨트랙트 — 교수님이 "자체 퍼셋을 만들어" 배포하길 원하므로 각자 배포가 기본이나, 대시보드 시연용 공용 컨트랙트도 필요할 수 있음
- [ ] OpenZeppelin 버전: Remix에서 import 시 GitHub URL 사용 vs @openzeppelin/contracts npm — Remix IDE에서는 GitHub import가 기본이므로 별도 설정 불필요하나, 버전 고정 필요 (v5.x)
- [ ] 배포 가이드 스크린샷: 직접 촬영 필요 vs 텍스트+다이어그램으로 대체 — Remix IDE UI가 자주 변경되므로 스크린샷 의존도를 낮추고 텍스트 중심이 안전할 수 있음
- [ ] 수업 시간 배분: 1회차에 전부 진행 vs 2회차 분할 — 배포+실습+시각화까지 한 수업(3시간)에 가능한지 교수님과 확인 필요
- [ ] 과제 제출 형식: 대시보드 스크린샷 vs 라이브 시연 vs 보고서 — 과제 4번(그래프 시각화)의 제출 형식 확인 필요
