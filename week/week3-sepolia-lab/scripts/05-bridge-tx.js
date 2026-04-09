// ============================================================
//  5단계: 브리지 트랜잭션 분석
//  사용법: node scripts/05-bridge-tx.js <TX_HASH> [network]
//  예시:   node scripts/05-bridge-tx.js 0xabc...123
//          node scripts/05-bridge-tx.js 0xabc...123 sepolia
//          node scripts/05-bridge-tx.js 0xabc...123 base
//          node scripts/05-bridge-tx.js 0xabc...123 giwa
//  네트워크: 두 번째 인수 또는 .env의 NETWORK 값으로 선택
// ============================================================

var dotenv = require('dotenv');
var ethers = require('ethers');
dotenv.config();

var networks = require('../networks');
var getNetwork = networks.getNetwork;
var NETWORKS = networks.NETWORKS;

async function main() {
  console.log('');
  console.log('  ============================================');
  console.log('   5단계: 브리지 트랜잭션 분석');
  console.log('  ============================================');
  console.log('');

  // CLI 인수: 트랜잭션 해시
  var txHash = process.argv[2];
  if (!txHash) {
    console.log('  사용법: node scripts/05-bridge-tx.js <TX_HASH> [network]');
    console.log('  예시:   node scripts/05-bridge-tx.js 0xabc...123');
    console.log('          node scripts/05-bridge-tx.js 0xabc...123 sepolia');
    console.log('          node scripts/05-bridge-tx.js 0xabc...123 base');
    console.log('          node scripts/05-bridge-tx.js 0xabc...123 giwa');
    console.log('');
    console.log('  → 브리지 트랜잭션 해시를 입력하세요.');
    console.log('  → 네트워크는 선택 사항 (기본값: .env NETWORK 설정)');
    process.exit(1);
  }

  // CLI 인수: 네트워크 오버라이드 (선택)
  var networkOverride = process.argv[3];
  var NET;
  if (networkOverride) {
    var key = networkOverride.toLowerCase();
    if (!NETWORKS[key]) {
      console.log('  ❌ 오류: 알 수 없는 네트워크:', key);
      console.log('     지원 네트워크:', Object.keys(NETWORKS).join(', '));
      process.exit(1);
    }
    NET = NETWORKS[key];
    console.log('  네트워크 오버라이드:', NET.name);
  } else {
    NET = getNetwork();
    console.log('  네트워크 (.env):', NET.name);
  }
  console.log('');

  var provider = new ethers.JsonRpcProvider(NET.rpcUrl);

  // 네트워크 확인 (잘못된 RPC 설정으로 메인넷 접속 방지)
  var network = await provider.getNetwork();
  if (network.chainId !== NET.chainId) {
    console.log('  ❌ 오류:', NET.name, '테스트넷(chainId:', NET.chainId.toString() + ')이 아닙니다.');
    console.log('     현재 연결된 네트워크 chainId:', network.chainId.toString());
    console.log('     RPC URL을 확인하세요.');
    process.exit(1);
  }

  console.log('  조회 중:', txHash);
  console.log('');

  // ────────────────────────────────────────────
  //  트랜잭션 데이터 조회
  // ────────────────────────────────────────────
  var tx = await provider.getTransaction(txHash);
  if (!tx) {
    console.log('  ❌ 트랜잭션을 찾을 수 없습니다.');
    console.log('     - 해시가 올바른지 확인하세요');
    console.log('     -', NET.name, '네트워크의 트랜잭션인지 확인하세요');
    process.exit(1);
  }

  // 영수증 조회 (블록에 포함된 경우에만 존재)
  var receipt = await provider.getTransactionReceipt(txHash);

  // ────────────────────────────────────────────
  //  1. 트랜잭션 기본 정보 출력
  // ────────────────────────────────────────────
  console.log('  [트랜잭션 기본 정보]');
  console.log('  Hash      :', tx.hash);
  console.log('  From      :', tx.from);
  console.log('  To        :', tx.to || '(컨트랙트 생성)');
  console.log('  Value     :', ethers.formatEther(tx.value), 'ETH');
  console.log('  Nonce     :', tx.nonce);
  console.log('');

  // ────────────────────────────────────────────
  //  2. 가스 정보 출력
  // ────────────────────────────────────────────
  console.log('  [가스 정보]');
  console.log('  Gas Limit :', tx.gasLimit.toString());

  if (receipt) {
    var gasUsed = receipt.gasUsed;
    var gasPrice = receipt.gasPrice;
    var feeWei = gasUsed * gasPrice;
    var feeEth = ethers.formatEther(feeWei);
    var gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');

    console.log('  Gas Used  :', gasUsed.toString());
    console.log('  Gas Price :', gasPriceGwei, 'Gwei');
    console.log('  실제 수수료:', feeEth, 'ETH');
  } else {
    console.log('  Gas Used  : (pending - 아직 블록에 포함되지 않음)');
  }
  console.log('');

  // ────────────────────────────────────────────
  //  3. 서명 정보 (r, s, v) 출력
  // ────────────────────────────────────────────
  console.log('  [서명 정보]');
  console.log('  r :', tx.signature ? tx.signature.r : 'N/A');
  console.log('  s :', tx.signature ? tx.signature.s : 'N/A');
  console.log('  v :', tx.signature ? tx.signature.v : 'N/A');
  console.log('');

  // ────────────────────────────────────────────
  //  4. 브리지 트랜잭션 분석
  // ────────────────────────────────────────────
  console.log('  ============================================');
  console.log('   [브리지 트랜잭션 분석]');
  console.log('  ============================================');
  console.log('');

  var txData = tx.data || '0x';
  var hasData = txData !== '0x' && txData.length > 2;
  var isContractInteraction = hasData;

  // 브리지 컨트랙트 주소 목록 (Sepolia 테스트넷 기준)
  var knownBridgeAddresses = [
    '0x49048044D57e1C92A77f79988d21Fa8fAF36689e'.toLowerCase(),  // Base Sepolia L1 StandardBridge
    '0xFBb0621E0B23b5A62ADE060745e74e219C2aEdF5'.toLowerCase(),  // Base Sepolia OptimismPortal
    '0xfd0Bf71F60660E2f608ed56e1659C450eB113120'.toLowerCase(),  // Base Sepolia L1CrossDomainMessenger
    '0x4200000000000000000000000000000000000010'.toLowerCase(),  // L2 StandardBridge (OP Stack 공통)
    '0x4200000000000000000000000000000000000007'.toLowerCase(),  // L2 CrossDomainMessenger (OP Stack 공통)
    '0x4200000000000000000000000000000000000016'.toLowerCase(),  // L2ToL1MessagePasser (OP Stack 공통)
  ];

  var toAddress = tx.to ? tx.to.toLowerCase() : '';
  var isKnownBridge = knownBridgeAddresses.indexOf(toAddress) !== -1;

  if (isKnownBridge) {
    console.log('  판정: 브리지 트랜잭션 ✅');
    console.log('  → to 주소가 알려진 브리지 컨트랙트입니다.');
  } else if (isContractInteraction) {
    console.log('  판정: 컨트랙트 인터랙션 (브리지 가능성 있음) ⚠️');
    console.log('  → data 필드가 존재하므로 단순 ETH 전송이 아닙니다.');
    console.log('  → 브리지 컨트랙트일 수 있으나 알려진 주소 목록에는 없습니다.');
  } else {
    console.log('  판정: 단순 ETH 전송 (브리지 아님) ℹ️');
    console.log('  → data 필드가 비어 있고 단순 ETH 전송입니다.');
  }
  console.log('');

  // data 필드 정보
  console.log('  [Data 필드]');
  if (hasData) {
    console.log('  Data 길이 :', txData.length, '문자 (', Math.floor((txData.length - 2) / 2), '바이트)');
    console.log('  Selector   :', txData.substring(0, 10));
    console.log('  → 컨트랙트 함수 호출 데이터가 포함되어 있습니다.');
  } else {
    console.log('  Data       : (없음 - 단순 전송)');
  }
  console.log('');

  // ────────────────────────────────────────────
  //  5. L1/L2 방향 추정
  // ────────────────────────────────────────────
  console.log('  [브리지 방향 추정]');
  console.log('  현재 네트워크:', NET.name, '(' + NET.layer + ')');

  if (NET.layer === 'L1') {
    console.log('  → 이 트랜잭션은 L1에서 발생했습니다.');
    if (isKnownBridge || isContractInteraction) {
      console.log('  → L1 → L2 (Deposit) 방향으로 추정됩니다.');
      console.log('  → L1에서 ETH/토큰을 잠그고, L2에서 동일한 양이 발행(mint)됩니다.');
    }
  } else if (NET.layer === 'L2') {
    console.log('  → 이 트랜잭션은 L2에서 발생했습니다.');
    if (isKnownBridge || isContractInteraction) {
      console.log('  → L2 → L1 (Withdrawal) 방향으로 추정됩니다.');
      console.log('  → L2에서 소각(burn)하고, L1에서 잠긴 자산이 해제됩니다.');
    }
    if (NET.parentL1) {
      console.log('  → 상위 L1 네트워크:', NETWORKS[NET.parentL1].name);
    }
  }
  console.log('');

  // 브리지 정보
  if (NET.bridges && NET.bridges.length > 0) {
    console.log('  [이 네트워크의 브리지]');
    NET.bridges.forEach(function (bridge) {
      console.log('  -', bridge.name, ':', bridge.url);
      console.log('    방향:', bridge.direction);
    });
    console.log('');
  }

  // ────────────────────────────────────────────
  //  6. 교육용 설명: L1↔L2 브리지 개념
  // ────────────────────────────────────────────
  console.log('  ============================================');
  console.log('   [브리지(Bridge) 핵심 개념 설명]');
  console.log('  ============================================');
  console.log('');

  console.log('  1. 브리지란?');
  console.log('     → 서로 다른 블록체인 간에 자산을 이동시키는 프로토콜입니다.');
  console.log('     → L1(이더리움)과 L2(Base, GIWA 등) 사이의 자산 이동을 가능하게 합니다.');
  console.log('');

  console.log('  2. L1 → L2 (Deposit) 과정:');
  console.log('     → L1 브리지 컨트랙트에 ETH/토큰을 잠급니다 (Lock).');
  console.log('     → L2에서 동일한 양의 ETH/토큰이 발행(Mint)됩니다.');
  console.log('     → 보통 수 분 내에 완료됩니다.');
  console.log('');

  console.log('  3. L2 → L1 (Withdrawal) 과정:');
  console.log('     → L2에서 ETH/토큰을 소각(Burn)합니다.');
  console.log('     → L1에서 잠겨 있던 자산이 해제(Unlock)됩니다.');
  console.log('     → Optimistic Rollup의 경우 약 7일의 Challenge Period가 필요합니다.');
  console.log('');

  console.log('  4. 왜 브리지 TX에는 data 필드가 있는가?');
  console.log('     → 브리지 트랜잭션은 단순 ETH 전송이 아닙니다.');
  console.log('     → 브리지 컨트랙트의 함수를 호출해야 하므로 data 필드에');
  console.log('       함수 selector + 매개변수가 인코딩되어 포함됩니다.');
  console.log('     → 예: depositETH(), bridgeETHTo(), initiateWithdrawal() 등');
  console.log('');

  console.log('  5. 7일 출금 대기 기간 (Optimistic Rollup):');
  console.log('     → L2 → L1 출금 시 약 7일의 Challenge Period가 존재합니다.');
  console.log('     → 이 기간 동안 누구나 부정 트랜잭션에 대해 이의(Fraud Proof)를');
  console.log('       제기할 수 있습니다.');
  console.log('     → 7일이 지나면 이의가 없다는 것이 확인되어 출금이 완료됩니다.');
  console.log('     → 이것이 "Optimistic"의 의미: 일단 유효하다고 가정하고,');
  console.log('       문제가 있으면 나중에 이의를 제기합니다.');
  console.log('');

  // Explorer 링크
  console.log('  [' + NET.name + ' Explorer에서 확인]');
  console.log('  ' + NET.explorer + '/tx/' + tx.hash);
  console.log('');
}

main().catch(function (err) {
  console.error('');
  console.error('  ❌ 오류 발생:', err.message);
  console.error('');
  process.exit(1);
});
