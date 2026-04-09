/**
 * Web3Engine - 이더리움 DApp Web3 연결 엔진
 * ethers.js v6 (CDN) 기반으로 MetaMask 연결 및 ERC20 토큰 상호작용을 처리합니다.
 * Sepolia 테스트넷 전용
 */

// ERC20 표준 ABI - 토큰 정보 조회 및 전송 기능
const ERC20_ABI = [
  // 읽기 함수
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",

  // 쓰기 함수
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",

  // 이벤트
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Mintable/Burnable 확장 ABI - mint, burn 기능 (MyTokenExtended용)
const MINTABLE_ABI = [
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function owner() view returns (address)",
];

// Faucet 컨트랙트 ABI - 테스트 토큰 지급 기능
const FAUCET_ABI = [
  // 읽기 함수
  "function faucetBalance() view returns (uint256)",
  "function claimAmount() view returns (uint256)",
  "function cooldownTime() view returns (uint256)",
  "function nextClaimTime(address account) view returns (uint256)",

  // 쓰기 함수
  "function claim() returns (bool)",

  // 이벤트
  "event TokensClaimed(address indexed claimant, uint256 amount, uint256 timestamp)",
];

// Sepolia 테스트넷 체인 ID
const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

const Web3Engine = {
  // ===== 상태 =====
  provider: null,
  signer: null,
  account: null,
  chainId: null,

  // UI 업데이트용 콜백 (외부에서 주입)
  onAccountChanged: null,
  onChainChanged: null,
  onConnectionChanged: null,

  // 연결 상태 확인
  isConnected() {
    return !!(this.signer && this.account);
  },

  // 현재 상태 객체 반환 (UI 업데이트용)
  getState() {
    return {
      connected: this.isConnected(),
      address: this.account,
      network: this.chainId === SEPOLIA_CHAIN_ID ? "sepolia" : "unknown",
      chainId: this.chainId,
    };
  },

  // ===== 내부 헬퍼 =====

  /**
   * ethers 글로벌 객체를 반환합니다. (CDN 로드 확인)
   */
  _getEthers() {
    if (typeof window.ethers === "undefined") {
      throw new Error("ethers.js가 로드되지 않았습니다. CDN 스크립트를 확인하세요.");
    }
    return window.ethers;
  },

  /**
   * MetaMask(window.ethereum)가 설치되어 있는지 확인합니다.
   */
  _checkMetaMask() {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask가 설치되어 있지 않습니다. MetaMask를 설치 후 다시 시도하세요.");
    }
  },

  /**
   * 연결 상태를 확인합니다. 연결되지 않으면 에러를 던집니다.
   */
  _checkConnection() {
    if (!this.signer || !this.account) {
      throw new Error("지갑이 연결되어 있지 않습니다. 먼저 지갑을 연결하세요.");
    }
  },

  // ===== 연결 관련 =====

  /**
   * MetaMask 지갑을 연결합니다.
   * @returns {Promise<string>} 연결된 계정 주소
   */
  async connect() {
    try {
      this._checkMetaMask();
      const ethers = this._getEthers();

      // BrowserProvider로 MetaMask 연결
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // 계정 접근 권한 요청
      const accounts = await this.provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("MetaMask에서 계정 접근이 거부되었습니다.");
      }

      this.signer = await this.provider.getSigner();
      this.account = await this.signer.getAddress();

      // 현재 체인 ID 조회
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      // MetaMask 이벤트 리스너 등록
      this._registerEventListeners();

      // 연결 상태 콜백 호출
      if (typeof this.onConnectionChanged === "function") {
        this.onConnectionChanged(this.getState());
      }

      return this.account;
    } catch (error) {
      // 사용자가 직접 거부한 경우
      if (error.code === 4001) {
        throw new Error("사용자가 MetaMask 연결 요청을 거부했습니다.");
      }
      throw new Error(`지갑 연결 실패: ${error.message}`);
    }
  },

  /**
   * 지갑 연결을 해제합니다. (상태 초기화)
   */
  async disconnect() {
    try {
      // 이벤트 리스너 제거
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", this._handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", this._handleChainChanged);
      }

      // 상태 초기화
      this.provider = null;
      this.signer = null;
      this.account = null;
      this.chainId = null;

      // 연결 해제 콜백 호출
      if (typeof this.onConnectionChanged === "function") {
        this.onConnectionChanged(this.getState());
      }
    } catch (error) {
      throw new Error(`연결 해제 실패: ${error.message}`);
    }
  },

  /**
   * Sepolia 테스트넷으로 네트워크를 전환합니다.
   */
  async switchToSepolia() {
    try {
      this._checkMetaMask();

      try {
        // 기존 네트워크로 전환 시도
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
        });
      } catch (switchError) {
        // 네트워크가 MetaMask에 등록되지 않은 경우 추가
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("사용자가 네트워크 전환을 거부했습니다.");
      }
      throw new Error(`Sepolia 네트워크 전환 실패: ${error.message}`);
    }
  },

  /**
   * 현재 네트워크가 Sepolia인지 확인합니다.
   * @returns {boolean}
   */
  isCorrectNetwork() {
    return this.chainId === SEPOLIA_CHAIN_ID;
  },

  // ===== ERC20 읽기 함수 (가스비 없음) =====

  /**
   * ERC20 토큰의 기본 정보를 조회합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @returns {Promise<{name: string, symbol: string, decimals: number, totalSupply: string}>}
   */
  async getTokenInfo(tokenAddress) {
    try {
      if (!this.provider) {
        throw new Error("프로바이더가 연결되어 있지 않습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      // 병렬로 토큰 정보 조회
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
      };
    } catch (error) {
      throw new Error(`토큰 정보 조회 실패 (${tokenAddress}): ${error.message}`);
    }
  },

  /**
   * 특정 계정의 ERC20 토큰 잔액을 조회합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {string} account - 조회할 계정 주소
   * @returns {Promise<string>} 포맷된 잔액 문자열
   */
  async getBalance(tokenAddress, account) {
    try {
      if (!this.provider) {
        throw new Error("프로바이더가 연결되어 있지 않습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      const [balance, decimals] = await Promise.all([
        contract.balanceOf(account),
        contract.decimals(),
      ]);

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new Error(`토큰 잔액 조회 실패: ${error.message}`);
    }
  },

  /**
   * ERC20 토큰의 위임 허용량(allowance)을 조회합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {string} owner - 토큰 소유자 주소
   * @param {string} spender - 위임받은 지출자 주소
   * @returns {Promise<string>} 포맷된 허용량 문자열
   */
  async getAllowance(tokenAddress, owner, spender) {
    try {
      if (!this.provider) {
        throw new Error("프로바이더가 연결되어 있지 않습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      const [allowance, decimals] = await Promise.all([
        contract.allowance(owner, spender),
        contract.decimals(),
      ]);

      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      throw new Error(`허용량 조회 실패: ${error.message}`);
    }
  },

  // ===== ERC20 쓰기 함수 (가스비 필요) =====

  /**
   * ERC20 토큰을 전송합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {string} to - 수신자 주소
   * @param {string} amount - 전송할 수량 (사람이 읽을 수 있는 단위)
   * @param {number} decimals - 토큰의 소수점 자릿수
   * @returns {Promise<{hash: string, wait: Function}>} 트랜잭션 객체
   */
  async transfer(tokenAddress, to, amount, decimals) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 트랜잭션을 실행할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);

      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.transfer(to, parsedAmount);

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("사용자가 트랜잭션을 거부했습니다.");
      }
      throw new Error(`토큰 전송 실패: ${error.message}`);
    }
  },

  /**
   * ERC20 토큰 지출 권한을 위임합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {string} spender - 지출 권한을 받을 주소
   * @param {string} amount - 허용할 수량 (사람이 읽을 수 있는 단위)
   * @param {number} decimals - 토큰의 소수점 자릿수
   * @returns {Promise<{hash: string, wait: Function}>} 트랜잭션 객체
   */
  async approve(tokenAddress, spender, amount, decimals) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 트랜잭션을 실행할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);

      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.approve(spender, parsedAmount);

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("사용자가 트랜잭션을 거부했습니다.");
      }
      throw new Error(`토큰 승인(approve) 실패: ${error.message}`);
    }
  },

  /**
   * 위임된 권한으로 ERC20 토큰을 전송합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {string} from - 토큰 출처 주소 (approve한 주소)
   * @param {string} to - 수신자 주소
   * @param {string} amount - 전송할 수량 (사람이 읽을 수 있는 단위)
   * @param {number} decimals - 토큰의 소수점 자릿수
   * @returns {Promise<{hash: string, wait: Function}>} 트랜잭션 객체
   */
  async transferFrom(tokenAddress, from, to, amount, decimals) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 트랜잭션을 실행할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);

      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.transferFrom(from, to, parsedAmount);

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("사용자가 트랜잭션을 거부했습니다.");
      }
      throw new Error(`위임 전송(transferFrom) 실패: ${error.message}`);
    }
  },

  // ===== Mintable/Burnable 확장 기능 =====

  async mint(tokenAddress, to, amount, decimals) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 트랜잭션을 실행할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, [...ERC20_ABI, ...MINTABLE_ABI], this.signer);
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.mint(to, parsedAmount);
      return { hash: tx.hash, wait: () => tx.wait() };
    } catch (error) {
      if (error.code === 4001) throw new Error("사용자가 트랜잭션을 거부했습니다.");
      throw new Error(`토큰 발행(mint) 실패: ${error.message}`);
    }
  },

  async burn(tokenAddress, amount, decimals) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 트랜잭션을 실행할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, [...ERC20_ABI, ...MINTABLE_ABI], this.signer);
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.burn(parsedAmount);
      return { hash: tx.hash, wait: () => tx.wait() };
    } catch (error) {
      if (error.code === 4001) throw new Error("사용자가 트랜잭션을 거부했습니다.");
      throw new Error(`토큰 소각(burn) 실패: ${error.message}`);
    }
  },

  // ===== 퍼셋 (Faucet) 관련 =====

  /**
   * 퍼셋 컨트랙트의 현재 상태를 조회합니다.
   * @param {string} faucetAddress - 퍼셋 컨트랙트 주소
   * @returns {Promise<{balance: string, claimAmount: string, cooldownTime: number, nextClaimTime: number}>}
   */
  async getFaucetStatus(faucetAddress) {
    try {
      if (!this.provider) {
        throw new Error("프로바이더가 연결되어 있지 않습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(faucetAddress, FAUCET_ABI, this.provider);

      // 병렬로 퍼셋 상태 조회
      const [balance, claimAmount, cooldownTime] = await Promise.all([
        contract.faucetBalance(),
        contract.claimAmount(),
        contract.cooldownTime(),
      ]);

      // 연결된 계정이 있으면 다음 클레임 가능 시간도 조회
      let nextClaimTime = 0;
      if (this.account) {
        try {
          nextClaimTime = Number(await contract.nextClaimTime(this.account));
        } catch {
          // nextClaimTime 조회 실패 시 0으로 유지
          nextClaimTime = 0;
        }
      }

      return {
        // 퍼셋 잔액 (18 decimals 기준)
        balance: ethers.formatUnits(balance, 18),
        // 1회 지급량
        claimAmount: ethers.formatUnits(claimAmount, 18),
        // 쿨다운 시간 (초 단위)
        cooldownTime: Number(cooldownTime),
        // 다음 클레임 가능 시각 (Unix timestamp)
        nextClaimTime,
      };
    } catch (error) {
      throw new Error(`퍼셋 상태 조회 실패: ${error.message}`);
    }
  },

  /**
   * 퍼셋에서 테스트 토큰을 클레임합니다.
   * @param {string} faucetAddress - 퍼셋 컨트랙트 주소
   * @returns {Promise<{hash: string, wait: Function}>} 트랜잭션 객체
   */
  async claimFaucet(faucetAddress) {
    try {
      this._checkConnection();
      if (!this.isCorrectNetwork()) {
        throw new Error("Sepolia 네트워크에서만 퍼셋을 사용할 수 있습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(faucetAddress, FAUCET_ABI, this.signer);

      const tx = await contract.claim();

      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("사용자가 트랜잭션을 거부했습니다.");
      }
      throw new Error(`퍼셋 클레임 실패: ${error.message}`);
    }
  },

  // ===== 이벤트 로그 =====

  /**
   * ERC20 Transfer 이벤트 로그를 조회합니다.
   * @param {string} tokenAddress - 토큰 컨트랙트 주소
   * @param {number|string} fromBlock - 조회 시작 블록 번호 (기본값: 'latest'로부터 최근 1000블록)
   * @returns {Promise<Array<{from: string, to: string, value: string, blockNumber: number, txHash: string}>>}
   */
  async getTransferEvents(tokenAddress, fromBlock) {
    try {
      if (!this.provider) {
        throw new Error("프로바이더가 연결되어 있지 않습니다.");
      }
      const ethers = this._getEthers();
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

      // fromBlock이 지정되지 않으면 최근 1000블록 조회
      let startBlock = fromBlock;
      if (startBlock === undefined || startBlock === null) {
        const latestBlock = await this.provider.getBlockNumber();
        startBlock = Math.max(0, latestBlock - 1000);
      }

      // decimals 조회 (포맷용)
      const decimals = await contract.decimals();

      // Transfer 이벤트 필터 생성 및 조회
      const filter = contract.filters.Transfer();
      const events = await contract.queryFilter(filter, startBlock, "latest");

      // 이벤트 데이터 정형화
      return events.map((event) => ({
        from: event.args[0],
        to: event.args[1],
        value: ethers.formatUnits(event.args[2], decimals),
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      }));
    } catch (error) {
      throw new Error(`Transfer 이벤트 조회 실패: ${error.message}`);
    }
  },

  // ===== 유틸리티 =====

  /**
   * 최소 단위(wei) 값을 사람이 읽을 수 있는 단위로 변환합니다.
   * @param {bigint|string} value - 변환할 값
   * @param {number} decimals - 소수점 자릿수
   * @returns {string}
   */
  formatUnits(value, decimals) {
    try {
      const ethers = this._getEthers();
      return ethers.formatUnits(value, decimals);
    } catch (error) {
      throw new Error(`단위 변환(formatUnits) 실패: ${error.message}`);
    }
  },

  /**
   * 사람이 읽을 수 있는 단위를 최소 단위(wei)로 변환합니다.
   * @param {string|number} value - 변환할 값
   * @param {number} decimals - 소수점 자릿수
   * @returns {bigint}
   */
  parseUnits(value, decimals) {
    try {
      const ethers = this._getEthers();
      return ethers.parseUnits(value.toString(), decimals);
    } catch (error) {
      throw new Error(`단위 변환(parseUnits) 실패: ${error.message}`);
    }
  },

  /**
   * 이더리움 주소를 단축 형태로 표시합니다.
   * @param {string} addr - 이더리움 주소 (0x...)
   * @returns {string} 예: 0x1234...5678
   */
  shortenAddress(addr) {
    if (!addr || addr.length < 10) return addr || "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  },

  /**
   * Sepolia Etherscan 트랜잭션 URL을 생성합니다.
   * @param {string} hash - 트랜잭션 해시
   * @returns {string} Etherscan URL
   */
  getEtherscanTxUrl(hash) {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  },

  // ===== 내부 이벤트 핸들러 =====

  /**
   * MetaMask 계정 변경 이벤트 핸들러
   * @param {string[]} accounts - 변경된 계정 목록
   */
  _handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // 모든 계정 연결 해제됨
      Web3Engine.account = null;
      Web3Engine.signer = null;

      if (typeof Web3Engine.onConnectionChanged === "function") {
        Web3Engine.onConnectionChanged(Web3Engine.getState());
      }
    } else {
      // 계정이 변경됨
      Web3Engine.account = accounts[0];

      // signer 갱신
      if (Web3Engine.provider) {
        Web3Engine.provider.getSigner().then((signer) => {
          Web3Engine.signer = signer;
        });
      }

      if (typeof Web3Engine.onAccountChanged === "function") {
        Web3Engine.onAccountChanged(accounts[0]);
      }
    }
  },

  /**
   * MetaMask 체인 변경 이벤트 핸들러
   * @param {string} chainIdHex - 16진수 체인 ID 문자열
   */
  _handleChainChanged(chainIdHex) {
    Web3Engine.chainId = parseInt(chainIdHex, 16);

    // provider 갱신
    if (window.ethereum) {
      const ethers = window.ethers;
      if (ethers) {
        Web3Engine.provider = new ethers.BrowserProvider(window.ethereum);
        Web3Engine.provider.getSigner().then((signer) => {
          Web3Engine.signer = signer;
        });
      }
    }

    if (typeof Web3Engine.onChainChanged === "function") {
      Web3Engine.onChainChanged(Web3Engine.chainId);
    }
  },

  /**
   * MetaMask 이벤트 리스너를 등록합니다.
   */
  _registerEventListeners() {
    if (!window.ethereum) return;

    // 중복 등록 방지를 위해 기존 리스너 제거 후 재등록
    window.ethereum.removeListener("accountsChanged", this._handleAccountsChanged);
    window.ethereum.removeListener("chainChanged", this._handleChainChanged);

    window.ethereum.on("accountsChanged", this._handleAccountsChanged);
    window.ethereum.on("chainChanged", this._handleChainChanged);
  },
};
