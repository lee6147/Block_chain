// ============================================================
//  네트워크 설정 — Sepolia L1 / Base Sepolia / GIWA Sepolia
//  .env의 NETWORK 값으로 네트워크를 선택한다.
//  기본값: giwa (기존 동작 유지)
// ============================================================

const NETWORKS = {
  sepolia: {
    name: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    chainId: 11155111n,
    explorer: 'https://sepolia.etherscan.io',
    description: 'Ethereum Sepolia L1 테스트넷',
    faucets: [
      'https://www.alchemy.com/faucets/ethereum-sepolia',
      'https://faucets.chain.link/sepolia',
      'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    ],
    layer: 'L1',
    bridges: [],
  },
  base: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532n,
    explorer: 'https://sepolia.basescan.org',
    description: 'Base Sepolia 테스트넷 (OP Stack L2, by Coinbase)',
    faucets: [
      'https://www.alchemy.com/faucets/base-sepolia',
      'https://faucet.quicknode.com/base/sepolia',
    ],
    layer: 'L2',
    parentL1: 'sepolia',
    bridges: [
      { name: 'Superbridge', url: 'https://superbridge.app/base-sepolia', direction: 'Base Sepolia ↔ Sepolia' },
    ],
  },
  giwa: {
    name: 'GIWA Sepolia',
    rpcUrl: 'https://sepolia-rpc.giwa.io/',
    chainId: 91342n,
    explorer: 'https://sepolia-explorer.giwa.io',
    description: 'GIWA Sepolia 테스트넷 (OP Stack L2)',
    faucets: [
      'https://faucet.giwa.io/  (0.005 ETH / 24h)',
      'https://faucet.lambda256.io/giwa-sepolia  (0.01 ETH / 24h)',
    ],
    layer: 'L2',
    parentL1: 'sepolia',
    bridges: [
      { name: 'GIWA Bridge', url: 'https://bridge-giwa.vercel.app', direction: 'GIWA Sepolia ↔ Sepolia' },
    ],
  },
};

// .env의 NETWORK 값으로 네트워크 선택 (기본: giwa)
function getNetwork() {
  const key = (process.env.NETWORK || 'giwa').toLowerCase();
  const net = NETWORKS[key];
  if (!net) {
    console.error('');
    console.error('  ❌ 오류: 알 수 없는 네트워크:', key);
    console.error('     지원 네트워크:', Object.keys(NETWORKS).join(', '));
    console.error('     .env 파일의 NETWORK 값을 확인하세요.');
    console.error('');
    process.exit(1);
  }
  return net;
}

// 모든 네트워크 정보를 JSON 직렬화 가능 형태로 반환
function getAllNetworks() {
  var result = {};
  Object.keys(NETWORKS).forEach(function (key) {
    var n = NETWORKS[key];
    result[key] = {
      name: n.name,
      rpcUrl: n.rpcUrl,
      chainId: Number(n.chainId),
      chainIdHex: '0x' + n.chainId.toString(16),
      explorer: n.explorer,
      description: n.description,
      faucets: n.faucets,
      layer: n.layer,
      bridges: n.bridges,
    };
    if (n.parentL1) {
      result[key].parentL1 = n.parentL1;
    }
  });
  return result;
}

module.exports = { NETWORKS, getNetwork, getAllNetworks };
