/**
 * interactive-logic.js
 * 인터랙티브 섹션 로직: 토큰 상호작용 / 퍼셋 / 퀴즈
 * Web3Engine 전역 객체를 사용합니다.
 */

// ============================================================
// 탭 전환 유틸리티
// ============================================================
const InteractiveTab = {
  /**
   * 최상위 탭 전환 (interact / faucet / quiz)
   * @param {string} tabName - 전환할 탭 이름
   */
  switchTab(tabName) {
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach((panel) => panel.classList.add('hidden'));

    const buttons = ['interact', 'faucet', 'quiz'];
    buttons.forEach((name) => {
      const btn = document.getElementById(`tab-btn-${name}`);
      if (!btn) return;
      if (name === tabName) {
        btn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
        btn.classList.remove('text-gray-600', 'hover:text-gray-900');
      } else {
        btn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
        btn.classList.add('text-gray-600', 'hover:text-gray-900');
      }
    });

    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.remove('hidden');

    // 퀴즈 탭 진입 시 아직 시작 안 됐으면 자동 시작
    if (tabName === 'quiz' && QuizUI.currentIndex === 0 && QuizUI.answers.length === 0) {
      QuizUI.start();
    }
  },
};

// ============================================================
// localStorage 헬퍼 - 컨트랙트 주소 저장
// ============================================================
const ContractStorage = {
  KEY: 'erc20-tutorial-contracts',

  /** @returns {{ token: string, faucet: string }} */
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch {
      return {};
    }
  },

  /**
   * 특정 키의 주소를 저장합니다.
   * @param {'token'|'faucet'} key
   * @param {string} address
   */
  save(key, address) {
    const data = this.load();
    data[key] = address;
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },
};

// ============================================================
// A. 토큰 상호작용 모듈
// ============================================================
const InteractUI = {
  tokenAddress: '',
  tokenDecimals: 18,
  tokenSymbol: '',

  /**
   * 주소 적용: localStorage 저장 + 토큰 정보 조회 + 카드 업데이트
   */
  async applyAddress() {
    const input = document.getElementById('interact-token-address');
    const errorEl = document.getElementById('interact-address-error');

    const address = (input?.value || '').trim();

    // 오류 초기화
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    if (!address) {
      this._showError(errorEl, '컨트랙트 주소를 입력하세요.');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      this._showError(errorEl, '올바른 이더리움 주소 형식이 아닙니다. (0x로 시작하는 42자리)');
      return;
    }

    try {
      ContractStorage.save('token', address);
      this.tokenAddress = address;

      const info = await Web3Engine.getTokenInfo(address);
      this.tokenDecimals = info.decimals;
      this.tokenSymbol = info.symbol;

      this._updateInfoCard(address, info);
    } catch (err) {
      this._showError(errorEl, `토큰 정보 조회 실패: ${err.message}`);
    }
  },

  /**
   * 서브탭 전환 (transfer / approve / allowance)
   * @param {'transfer'|'approve'|'allowance'} tab
   */
  switchSubTab(tab) {
    const tabs = ['transfer', 'approve', 'allowance', 'balance', 'transferFrom', 'mint', 'burn'];
    tabs.forEach((name) => {
      const panel = document.getElementById(`subtab-${name}`);
      const btn = document.getElementById(`subtab-btn-${name}`);
      if (!panel || !btn) return;

      if (name === tab) {
        panel.classList.remove('hidden');
        btn.classList.add('bg-indigo-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
      } else {
        panel.classList.add('hidden');
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
      }
    });
  },

  /**
   * 토큰 전송 트랜잭션 실행
   */
  async transfer() {
    const to = (document.getElementById('transfer-to')?.value || '').trim();
    const amount = (document.getElementById('transfer-amount')?.value || '').trim();
    const statusId = 'transfer-tx-status';

    if (!this._validateTxPreconditions(statusId)) return;
    if (!to || !amount) {
      this.showTxStatus(statusId, 'error', null, '받는 주소와 수량을 모두 입력하세요.');
      return;
    }

    this.showTxStatus(statusId, 'pending');
    try {
      const tx = await Web3Engine.transfer(this.tokenAddress, to, amount, this.tokenDecimals);
      this.showTxStatus(statusId, 'confirming', tx.hash);
      await tx.wait();
      this.showTxStatus(statusId, 'success', tx.hash);
    } catch (err) {
      this.showTxStatus(statusId, 'error', null, err.message);
    }
  },

  /**
   * 토큰 승인(approve) 트랜잭션 실행
   */
  async approve() {
    const spender = (document.getElementById('approve-spender')?.value || '').trim();
    const amount = (document.getElementById('approve-amount')?.value || '').trim();
    const statusId = 'approve-tx-status';

    if (!this._validateTxPreconditions(statusId)) return;
    if (!spender || !amount) {
      this.showTxStatus(statusId, 'error', null, '위임할 주소와 수량을 모두 입력하세요.');
      return;
    }

    this.showTxStatus(statusId, 'pending');
    try {
      const tx = await Web3Engine.approve(this.tokenAddress, spender, amount, this.tokenDecimals);
      this.showTxStatus(statusId, 'confirming', tx.hash);
      await tx.wait();
      this.showTxStatus(statusId, 'success', tx.hash);
    } catch (err) {
      this.showTxStatus(statusId, 'error', null, err.message);
    }
  },

  /**
   * 허용량(allowance) 조회
   */
  async checkAllowance() {
    const owner = (document.getElementById('allowance-owner')?.value || '').trim();
    const spender = (document.getElementById('allowance-spender')?.value || '').trim();
    const resultEl = document.getElementById('allowance-result');
    const valueEl = document.getElementById('allowance-result-value');
    const symbolEl = document.getElementById('allowance-result-symbol');

    if (!this.tokenAddress) {
      alert('먼저 토큰 주소를 적용하세요.');
      return;
    }
    if (!owner || !spender) {
      alert('소유자 주소와 위임자 주소를 모두 입력하세요.');
      return;
    }

    try {
      const allowance = await Web3Engine.getAllowance(this.tokenAddress, owner, spender);
      if (resultEl) resultEl.classList.remove('hidden');
      if (valueEl) valueEl.textContent = Number(allowance).toLocaleString('ko-KR', { maximumFractionDigits: 6 });
      if (symbolEl) symbolEl.textContent = this.tokenSymbol || '';
    } catch (err) {
      if (resultEl) resultEl.classList.remove('hidden');
      if (valueEl) valueEl.textContent = '조회 실패';
      if (symbolEl) symbolEl.textContent = err.message;
    }
  },

  /**
   * 잔액 조회: balanceOf(address)
   */
  async checkBalance() {
    const addressInput = (document.getElementById('balance-address')?.value || '').trim();
    const resultEl = document.getElementById('balance-result');
    const valueEl = document.getElementById('balance-result-value');
    const symbolEl = document.getElementById('balance-result-symbol');

    if (!this.tokenAddress) {
      alert('먼저 토큰 주소를 적용하세요.');
      return;
    }

    // 빈칸이면 내 주소 사용
    const target = addressInput || Web3Engine.account;
    if (!target) {
      alert('조회할 주소를 입력하거나 지갑을 연결하세요.');
      return;
    }

    try {
      const balance = await Web3Engine.getBalance(this.tokenAddress, target);
      if (resultEl) resultEl.classList.remove('hidden');
      if (valueEl) valueEl.textContent = Number(balance).toLocaleString('ko-KR', { maximumFractionDigits: 6 });
      if (symbolEl) symbolEl.textContent = this.tokenSymbol || '';
    } catch (err) {
      if (resultEl) resultEl.classList.remove('hidden');
      if (valueEl) valueEl.textContent = '조회 실패';
      if (symbolEl) symbolEl.textContent = err.message;
    }
  },

  /**
   * 위임 전송: transferFrom(from, to, amount)
   */
  async transferFrom() {
    const from = (document.getElementById('transferFrom-from')?.value || '').trim();
    const to = (document.getElementById('transferFrom-to')?.value || '').trim();
    const amount = (document.getElementById('transferFrom-amount')?.value || '').trim();
    const statusId = 'transferFrom-tx-status';

    if (!this._validateTxPreconditions(statusId)) return;
    if (!from || !to || !amount) {
      this.showTxStatus(statusId, 'error', null, '보내는 주소, 받는 주소, 수량을 모두 입력하세요.');
      return;
    }

    this.showTxStatus(statusId, 'pending');
    try {
      const tx = await Web3Engine.transferFrom(this.tokenAddress, from, to, amount, this.tokenDecimals);
      this.showTxStatus(statusId, 'confirming', tx.hash);
      await tx.wait();
      this.showTxStatus(statusId, 'success', tx.hash);
    } catch (err) {
      this.showTxStatus(statusId, 'error', null, err.message);
    }
  },

  /**
   * 토큰 발행: mint(to, amount) - MyTokenExtended 전용
   */
  async mint() {
    const to = (document.getElementById('mint-to')?.value || '').trim();
    const amount = (document.getElementById('mint-amount')?.value || '').trim();
    const statusId = 'mint-tx-status';

    if (!this._validateTxPreconditions(statusId)) return;
    if (!to || !amount) {
      this.showTxStatus(statusId, 'error', null, '받는 주소와 발행 수량을 모두 입력하세요.');
      return;
    }

    this.showTxStatus(statusId, 'pending');
    try {
      const tx = await Web3Engine.mint(this.tokenAddress, to, amount, this.tokenDecimals);
      this.showTxStatus(statusId, 'confirming', tx.hash);
      await tx.wait();
      this.showTxStatus(statusId, 'success', tx.hash);
    } catch (err) {
      this.showTxStatus(statusId, 'error', null, err.message);
    }
  },

  /**
   * 토큰 소각: burn(amount) - ERC20Burnable 확장 필요
   */
  async burn() {
    const amount = (document.getElementById('burn-amount')?.value || '').trim();
    const statusId = 'burn-tx-status';

    if (!this._validateTxPreconditions(statusId)) return;
    if (!amount) {
      this.showTxStatus(statusId, 'error', null, '소각 수량을 입력하세요.');
      return;
    }

    this.showTxStatus(statusId, 'pending');
    try {
      const tx = await Web3Engine.burn(this.tokenAddress, amount, this.tokenDecimals);
      this.showTxStatus(statusId, 'confirming', tx.hash);
      await tx.wait();
      this.showTxStatus(statusId, 'success', tx.hash);
    } catch (err) {
      this.showTxStatus(statusId, 'error', null, err.message);
    }
  },

  /**
   * 트랜잭션 상태 표시
   * @param {string} containerId - 상태를 표시할 컨테이너 ID
   * @param {'pending'|'confirming'|'success'|'error'} status
   * @param {string|null} hash - 트랜잭션 해시
   * @param {string} [message] - 추가 메시지 (오류 설명 등)
   */
  showTxStatus(containerId, status, hash = null, message = '') {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.classList.remove('hidden');

    const configs = {
      pending: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        icon: '⏳',
        msg: '트랜잭션 전송 중...',
      },
      confirming: {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        icon: '🔄',
        msg: '블록 확인 중...',
      },
      success: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        icon: '✅',
        msg: '성공!',
      },
      error: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        icon: '❌',
        msg: message || '트랜잭션 실패',
      },
    };

    const cfg = configs[status] || configs.error;
    const hashLink =
      hash
        ? `<a href="${Web3Engine.getEtherscanTxUrl(hash)}" target="_blank" rel="noopener noreferrer"
             class="block mt-1 text-xs underline opacity-75 break-all">${hash}</a>`
        : '';

    el.innerHTML = `
      <div class="border rounded-lg p-3 ${cfg.bg}">
        <p class="${cfg.text} text-sm font-medium">${cfg.icon} ${cfg.msg}</p>
        ${hashLink}
      </div>
    `;
  },

  // ---- 내부 헬퍼 ----

  /**
   * 토큰 정보 카드를 업데이트합니다.
   * @param {string} address
   * @param {{ name: string, symbol: string, decimals: number, totalSupply: string }} info
   */
  _updateInfoCard(address, info) {
    const card = document.getElementById('token-info-card');
    if (!card) return;

    card.classList.remove('hidden');

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('token-symbol-icon', info.symbol.slice(0, 3).toUpperCase());
    set('token-info-name', `${info.name} (${info.symbol})`);
    set('token-info-address-short', Web3Engine.shortenAddress(address));
    set('token-info-name-val', info.name);
    set('token-info-symbol', info.symbol);
    set('token-info-decimals', info.decimals);
    set('token-info-supply', Number(info.totalSupply).toLocaleString('ko-KR', { maximumFractionDigits: 2 }));
  },

  /**
   * 트랜잭션 실행 전 공통 사전 조건 검사
   * @param {string} statusId
   * @returns {boolean}
   */
  _validateTxPreconditions(statusId) {
    if (!this.tokenAddress) {
      this.showTxStatus(statusId, 'error', null, '먼저 토큰 주소를 적용하세요.');
      return false;
    }
    if (!Web3Engine.account) {
      this.showTxStatus(statusId, 'error', null, '지갑이 연결되어 있지 않습니다. 먼저 지갑을 연결하세요.');
      return false;
    }
    return true;
  },

  /**
   * 오류 메시지를 표시합니다.
   * @param {HTMLElement|null} el
   * @param {string} msg
   */
  _showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },
};

// ============================================================
// B. 퍼셋(Faucet) 모듈
// ============================================================
const FaucetUI = {
  faucetAddress: '',
  cooldownInterval: null,

  /**
   * 퍼셋 주소 적용: localStorage 저장 + 상태 조회 + 카드 업데이트
   */
  async applyAddress() {
    const input = document.getElementById('faucet-address-input');
    const errorEl = document.getElementById('faucet-address-error');

    const address = (input?.value || '').trim();

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    if (!address) {
      this._showError(errorEl, '퍼셋 컨트랙트 주소를 입력하세요.');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      this._showError(errorEl, '올바른 이더리움 주소 형식이 아닙니다. (0x로 시작하는 42자리)');
      return;
    }

    ContractStorage.save('faucet', address);
    this.faucetAddress = address;

    await this.refreshStatus();
  },

  /**
   * 퍼셋 클레임 트랜잭션 실행
   */
  async claim() {
    const statusEl = document.getElementById('claim-status');
    const claimBtn = document.getElementById('claim-btn');

    if (!this.faucetAddress) {
      alert('먼저 퍼셋 주소를 적용하세요.');
      return;
    }
    if (!Web3Engine.account) {
      alert('지갑이 연결되어 있지 않습니다. 먼저 지갑을 연결하세요.');
      return;
    }

    if (claimBtn) claimBtn.disabled = true;
    this._showTxStatus(statusEl, 'pending');

    try {
      const tx = await Web3Engine.claimFaucet(this.faucetAddress);
      this._showTxStatus(statusEl, 'confirming', tx.hash);
      await tx.wait();
      this._showTxStatus(statusEl, 'success', tx.hash);

      // 클레임 성공 후 상태 갱신
      await this.refreshStatus();
    } catch (err) {
      this._showTxStatus(statusEl, 'error', null, err.message);
      if (claimBtn) claimBtn.disabled = false;
    }
  },

  /**
   * 퍼셋 상태 새로고침
   */
  async refreshStatus() {
    if (!this.faucetAddress) return;

    try {
      const status = await Web3Engine.getFaucetStatus(this.faucetAddress);

      // 상태 카드 표시
      const statusCard = document.getElementById('faucet-status-card');
      const claimSection = document.getElementById('faucet-claim-section');
      if (statusCard) statusCard.classList.remove('hidden');
      if (claimSection) claimSection.classList.remove('hidden');

      // 값 업데이트
      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      const balanceNum = Number(status.balance);
      const claimAmountNum = Number(status.claimAmount);
      const cooldownHours = Math.round(status.cooldownTime / 3600);

      setEl('faucet-balance', balanceNum.toLocaleString('ko-KR', { maximumFractionDigits: 2 }));
      setEl('faucet-claim-amount', claimAmountNum.toLocaleString('ko-KR', { maximumFractionDigits: 2 }));
      setEl('faucet-cooldown', cooldownHours >= 1 ? `${cooldownHours}시간` : `${status.cooldownTime}초`);

      // 쿨다운 처리
      const now = Math.floor(Date.now() / 1000);
      const remaining = status.nextClaimTime - now;

      const claimBtn = document.getElementById('claim-btn');

      if (remaining > 0) {
        // 쿨다운 중
        if (claimBtn) claimBtn.disabled = true;
        this.startCooldownTimer(remaining);
      } else {
        // 클레임 가능
        if (claimBtn) claimBtn.disabled = false;
        this.stopCooldownTimer();
      }
    } catch (err) {
      console.error('퍼셋 상태 조회 오류:', err.message);
    }
  },

  /**
   * 쿨다운 타이머 시작 (1초마다 HH:MM:SS 갱신)
   * @param {number} remainingSeconds - 남은 초
   */
  startCooldownTimer(remainingSeconds) {
    this.stopCooldownTimer();

    const timerEl = document.getElementById('cooldown-timer');
    const displayEl = document.getElementById('cooldown-display');
    const claimBtn = document.getElementById('claim-btn');

    if (timerEl) timerEl.classList.remove('hidden');

    let seconds = remainingSeconds;

    const update = () => {
      if (seconds <= 0) {
        this.stopCooldownTimer();
        if (timerEl) timerEl.classList.add('hidden');
        if (claimBtn) claimBtn.disabled = false;
        return;
      }

      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      const formatted = [
        String(h).padStart(2, '0'),
        String(m).padStart(2, '0'),
        String(s).padStart(2, '0'),
      ].join(':');

      if (displayEl) displayEl.textContent = formatted;
      seconds--;
    };

    update();
    this.cooldownInterval = setInterval(update, 1000);
  },

  /**
   * 쿨다운 타이머 정지
   */
  stopCooldownTimer() {
    if (this.cooldownInterval !== null) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = null;
    }
  },

  // ---- 내부 헬퍼 ----

  /**
   * 퍼셋 트랜잭션 상태 표시
   * @param {HTMLElement|null} el
   * @param {'pending'|'confirming'|'success'|'error'} status
   * @param {string|null} hash
   * @param {string} [message]
   */
  _showTxStatus(el, status, hash = null, message = '') {
    if (!el) return;
    el.classList.remove('hidden');

    const configs = {
      pending: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: '⏳', msg: '트랜잭션 전송 중...' },
      confirming: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon: '🔄', msg: '블록 확인 중...' },
      success: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: '✅', msg: '토큰 수령 성공!' },
      error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: '❌', msg: message || '트랜잭션 실패' },
    };

    const cfg = configs[status] || configs.error;
    const hashLink = hash
      ? `<a href="${Web3Engine.getEtherscanTxUrl(hash)}" target="_blank" rel="noopener noreferrer"
           class="block mt-1 text-xs underline opacity-75 break-all">${hash}</a>`
      : '';

    el.innerHTML = `
      <div class="border rounded-lg p-3 ${cfg.bg}">
        <p class="${cfg.text} text-sm font-medium">${cfg.icon} ${cfg.msg}</p>
        ${hashLink}
      </div>
    `;
  },

  _showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  },
};

// ============================================================
// C. 퀴즈 데이터 (12문제)
// ============================================================
const QUIZ_DATA = [
  // ----- 개념 (Concept) 4문제 -----
  {
    id: 1,
    category: 'concept',
    question: 'ERC20 표준이 필요한 가장 큰 이유는 무엇인가요?',
    options: [
      '토큰을 더 빠르게 전송하기 위해',
      '지갑과 거래소가 동일한 방식으로 토큰을 처리하기 위해',
      '가스비를 절약하기 위해',
      '스마트 컨트랙트 배포 비용을 낮추기 위해',
    ],
    correctAnswer: 1,
    explanation:
      'ERC20은 토큰이 따라야 할 인터페이스 표준입니다. 모든 ERC20 토큰이 동일한 함수 이름과 동작을 갖기 때문에, 지갑·거래소·DApp이 별도의 커스텀 코드 없이 어떤 토큰이든 동일한 방식으로 처리할 수 있습니다.',
  },
  {
    id: 2,
    category: 'concept',
    question: '코인(Coin)과 토큰(Token)의 가장 큰 차이점은 무엇인가요?',
    options: [
      '코인은 스마트 컨트랙트를 사용하지만 토큰은 사용하지 않는다',
      '코인이 항상 가치가 더 높다',
      '코인은 자체 블록체인이 있고, 토큰은 기존 블록체인 위에서 동작한다',
      '토큰은 탈중앙화되어 있지 않다',
    ],
    correctAnswer: 2,
    explanation:
      '코인(ETH, BTC 등)은 자체 블록체인 네트워크의 네이티브 화폐입니다. 반면 토큰은 독자적인 블록체인 없이 이더리움 같은 기존 블록체인 위에서 스마트 컨트랙트로 구현됩니다.',
  },
  {
    id: 3,
    category: 'concept',
    question: 'ERC20 토큰에서 decimals = 18이 의미하는 것은?',
    options: [
      '최대 18개의 토큰만 발행 가능하다',
      '토큰의 최소 단위가 10⁻¹⁸ (소수점 18자리까지 쪼갤 수 있다)',
      '18시간마다 토큰이 생성된다',
      '컨트랙트 배포에 18 ETH가 필요하다',
    ],
    correctAnswer: 1,
    explanation:
      'decimals = 18은 1 토큰을 10¹⁸개의 최소 단위로 나눌 수 있다는 의미입니다. 이더리움의 wei와 동일한 방식으로, 컨트랙트 내부적으로는 정수로 저장하고 프론트엔드에서 소수점을 표시합니다.',
  },
  {
    id: 4,
    category: 'concept',
    question: 'ERC20의 Transfer 이벤트가 하는 역할은?',
    options: [
      '전송을 실제로 실행하는 함수이다',
      '블록체인에 거래 기록을 남겨 프론트엔드와 외부 서비스가 감지할 수 있게 한다',
      '가스비를 자동으로 계산한다',
      '수신자의 잔액이 충분한지 검증한다',
    ],
    correctAnswer: 1,
    explanation:
      '이벤트(Event)는 트랜잭션이 실행될 때 블록체인 로그에 기록됩니다. 프론트엔드, 인덱서, 거래소 등이 이 이벤트를 구독하여 토큰 이동을 실시간으로 감지하고 UI를 업데이트하거나 데이터를 저장합니다.',
  },

  // ----- 코드 (Code) 4문제 -----
  {
    id: 5,
    category: 'code',
    question: 'ERC20의 transfer() 함수 내부에서 msg.sender가 가리키는 것은?',
    options: [
      '컨트랙트 소유자의 주소',
      '토큰을 수신하는 주소',
      '함수를 호출한 사람의 지갑 주소',
      '컨트랙트 자신의 주소',
    ],
    correctAnswer: 2,
    explanation:
      'msg.sender는 Solidity의 전역 변수로, 현재 트랜잭션에서 해당 함수를 직접 호출한 외부 계정(EOA) 또는 컨트랙트의 주소입니다. transfer()에서 msg.sender가 보내는 사람이 됩니다.',
  },
  {
    id: 6,
    category: 'code',
    question: 'approve() + transferFrom() 패턴이 필요한 이유는 무엇인가요?',
    options: [
      '전송 속도를 높이기 위해',
      '스마트 컨트랙트가 사용자를 대신하여 토큰을 이동시키려면 사전 허가가 필요하기 때문',
      '멀티시그 지갑을 지원하기 위해',
      'ERC20 표준 규격을 맞추기 위한 형식적인 요건',
    ],
    correctAnswer: 1,
    explanation:
      '스마트 컨트랙트(예: DEX, 대출 프로토콜)가 사용자 토큰을 이동하려면 먼저 approve()로 허가를 받아야 합니다. 이후 컨트랙트가 transferFrom()을 호출해 허가된 범위 안에서 토큰을 가져갑니다. 이 패턴은 사용자가 통제권을 유지하면서 DeFi 프로토콜을 사용할 수 있게 합니다.',
  },
  {
    id: 7,
    category: 'code',
    question: 'OpenZeppelin의 _mint() 함수가 하는 일은?',
    options: [
      '토큰을 소각(burn)하여 총 발행량을 줄인다',
      '새로운 토큰을 생성하여 지정한 주소의 잔액과 totalSupply를 늘린다',
      '토큰의 소수점 단위를 변경한다',
      '컨트랙트 소유권을 이전한다',
    ],
    correctAnswer: 1,
    explanation:
      '_mint(address, amount)는 새로운 토큰을 만들어 지정된 주소에 배정합니다. 내부적으로 해당 주소의 _balances를 증가시키고 _totalSupply도 동일한 양만큼 늘립니다. Transfer 이벤트도 address(0) → 수신자로 발행됩니다.',
  },
  {
    id: 8,
    category: 'code',
    question: 'Solidity에서 require()의 역할은?',
    options: [
      '외부 라이브러리를 가져온다',
      '함수 실행 후 결과를 검증한다',
      '조건이 거짓이면 트랜잭션을 즉시 취소하고 남은 가스를 환불한다',
      '변수의 타입을 강제 변환한다',
    ],
    correctAnswer: 2,
    explanation:
      'require(condition, message)는 조건이 false이면 트랜잭션을 revert합니다. revert 시 아직 소비되지 않은 가스는 호출자에게 돌아가며, 모든 상태 변경이 롤백됩니다. 입력 검증, 잔액 확인 등 선행 조건 검사에 주로 사용됩니다.',
  },

  // ----- 실습 (Practice) 4문제 -----
  {
    id: 9,
    category: 'practice',
    question: 'Remix IDE에서 MetaMask 지갑으로 컨트랙트를 배포할 때 설정해야 하는 Environment는?',
    options: [
      'Remix VM (Shanghai)',
      'Hardhat Provider',
      'Injected Provider - MetaMask',
      'Web3 Provider',
    ],
    correctAnswer: 2,
    explanation:
      '"Injected Provider - MetaMask"를 선택하면 Remix가 브라우저에 설치된 MetaMask와 연동됩니다. 실제 테스트넷(Sepolia 등)에 배포하거나 트랜잭션을 보낼 때 이 설정이 필요합니다.',
  },
  {
    id: 10,
    category: 'practice',
    question: 'MetaMask에서 배포한 ERC20 토큰을 자산 목록에 추가하는 방법은?',
    options: [
      'MetaMask 설정 → 네트워크 → 토큰 추가',
      '자산 탭에서 "토큰 가져오기" 클릭 후 컨트랙트 주소 입력',
      '트랜잭션 내역에서 해당 토큰 클릭',
      'Etherscan에서 Import Token 버튼 클릭',
    ],
    correctAnswer: 1,
    explanation:
      'MetaMask에서 커스텀 토큰을 보려면 "자산" 탭 하단의 "토큰 가져오기"를 클릭하고 컨트랙트 주소를 입력합니다. 심볼과 소수점은 자동으로 불러와집니다.',
  },
  {
    id: 11,
    category: 'practice',
    question: '퍼셋(Faucet)에 쿨다운 시간을 두는 목적은?',
    options: [
      '블록체인 네트워크의 부하를 줄이기 위해',
      '한 사람이 반복 클레임으로 모든 토큰을 독점하는 것을 방지하기 위해',
      '가스비를 안정적으로 유지하기 위해',
      '컨트랙트 코드의 보안 취약점을 막기 위해',
    ],
    correctAnswer: 1,
    explanation:
      '쿨다운이 없으면 한 계정이 반복해서 클레임하여 퍼셋의 모든 토큰을 가져갈 수 있습니다. 쿨다운 시간은 사용자당 최소 대기 시간을 강제함으로써 더 많은 사람이 공평하게 테스트 토큰을 받을 수 있게 합니다.',
  },
  {
    id: 12,
    category: 'practice',
    question: 'Remix IDE에서 컨트랙트 배포 후 컨트랙트 주소를 확인하는 위치는?',
    options: [
      '파일 탐색기 패널',
      'Solidity 컴파일러 탭',
      'Remix 하단 콘솔 또는 MetaMask 활동 탭',
      'GitHub 연동 탭',
    ],
    correctAnswer: 2,
    explanation:
      '배포 트랜잭션이 성공하면 Remix 하단 콘솔에 생성된 컨트랙트 주소가 표시됩니다. MetaMask의 "활동" 탭에서도 해당 배포 트랜잭션을 클릭하면 컨트랙트 주소를 확인할 수 있습니다.',
  },
];

// ============================================================
// D. 퀴즈 UI 모듈
// ============================================================
const QuizUI = {
  currentIndex: 0,
  score: 0,
  /** @type {Array<{questionId: number, selected: number, correct: boolean}>} */
  answers: [],

  /** 카테고리 한국어 레이블 맵 */
  _categoryLabel: {
    concept: '개념',
    code: '코드',
    practice: '실습',
  },

  /** 카테고리 배지 색상 맵 */
  _categoryColor: {
    concept: 'bg-blue-100 text-blue-700',
    code: 'bg-purple-100 text-purple-700',
    practice: 'bg-green-100 text-green-700',
  },

  /**
   * 퀴즈 초기화 및 첫 문제 표시
   */
  start() {
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];

    // 결과 화면 숨기고 퀴즈 화면 표시
    const quizScreen = document.getElementById('quiz-screen');
    const quizResult = document.getElementById('quiz-result');
    if (quizScreen) quizScreen.classList.remove('hidden');
    if (quizResult) quizResult.classList.add('hidden');

    this.renderQuestion();
  },

  /**
   * 현재 문제를 렌더링합니다.
   */
  renderQuestion() {
    const q = QUIZ_DATA[this.currentIndex];
    if (!q) return;

    const total = QUIZ_DATA.length;

    // 진행률 업데이트
    const progressBar = document.getElementById('quiz-progress-bar');
    const currentNum = document.getElementById('quiz-current-num');
    const totalNum = document.getElementById('quiz-total-num');
    const currentScore = document.getElementById('quiz-current-score');

    if (progressBar) progressBar.style.width = `${(this.currentIndex / total) * 100}%`;
    if (currentNum) currentNum.textContent = String(this.currentIndex + 1);
    if (totalNum) totalNum.textContent = String(total);
    if (currentScore) currentScore.textContent = String(this.score);

    // 카테고리 뱃지
    const badge = document.getElementById('quiz-category-badge');
    if (badge) {
      badge.textContent = this._categoryLabel[q.category] || q.category;
      badge.className = `px-2.5 py-1 text-xs font-semibold rounded-full ${this._categoryColor[q.category] || 'bg-gray-100 text-gray-600'}`;
    }

    // 문제 텍스트
    const questionEl = document.getElementById('quiz-question');
    if (questionEl) questionEl.textContent = q.question;

    // 선택지 렌더링
    const optionsEl = document.getElementById('quiz-options');
    if (optionsEl) {
      optionsEl.innerHTML = q.options
        .map(
          (opt, idx) => `
          <button
            onclick="QuizUI.selectAnswer(${idx})"
            class="quiz-option w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-150"
            data-index="${idx}"
          >
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current text-xs font-bold mr-2 flex-shrink-0">
              ${['A', 'B', 'C', 'D'][idx]}
            </span>
            ${opt}
          </button>
        `
        )
        .join('');
    }

    // 피드백 및 다음 버튼 초기화
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next-btn');
    if (feedback) feedback.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
  },

  /**
   * 선택지 클릭 처리 - 정답/오답 피드백 표시
   * @param {number} selectedIndex - 선택한 선택지 인덱스
   */
  selectAnswer(selectedIndex) {
    const q = QUIZ_DATA[this.currentIndex];
    if (!q) return;

    const isCorrect = selectedIndex === q.correctAnswer;
    if (isCorrect) this.score++;

    this.answers.push({
      questionId: q.id,
      selected: selectedIndex,
      correct: isCorrect,
    });

    // 모든 선택지 버튼 비활성화 + 시각적 표시
    const optionBtns = document.querySelectorAll('.quiz-option');
    optionBtns.forEach((btn) => {
      btn.disabled = true;
      const btnIdx = Number(btn.dataset.index);

      if (btnIdx === q.correctAnswer) {
        // 정답 강조
        btn.classList.add('border-green-500', 'bg-green-50', 'text-green-800');
        btn.classList.remove('border-gray-200', 'hover:border-indigo-300', 'hover:bg-indigo-50');
      } else if (btnIdx === selectedIndex && !isCorrect) {
        // 선택한 오답 강조
        btn.classList.add('border-red-400', 'bg-red-50', 'text-red-800');
        btn.classList.remove('border-gray-200', 'hover:border-indigo-300', 'hover:bg-indigo-50');
      }
    });

    // 피드백 표시
    const feedback = document.getElementById('quiz-feedback');
    const feedbackTitle = document.getElementById('quiz-feedback-title');
    const feedbackExplanation = document.getElementById('quiz-feedback-explanation');

    if (feedback && feedbackTitle && feedbackExplanation) {
      feedback.classList.remove('hidden');
      feedback.className = feedback.className.replace(/bg-\S+|border-\S+/g, '').trim();

      if (isCorrect) {
        feedback.className = 'mt-4 p-4 rounded-lg bg-green-50 border border-green-200';
        feedbackTitle.textContent = '정답입니다!';
        feedbackTitle.className = 'text-sm font-semibold mb-1 text-green-700';
      } else {
        feedback.className = 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200';
        feedbackTitle.textContent = `오답입니다. 정답: ${['A', 'B', 'C', 'D'][q.correctAnswer]}`;
        feedbackTitle.className = 'text-sm font-semibold mb-1 text-red-700';
      }

      feedbackExplanation.textContent = q.explanation;
    }

    // 다음 문제 버튼 표시
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      const isLast = this.currentIndex === QUIZ_DATA.length - 1;
      nextBtn.textContent = isLast ? '결과 보기' : '다음 문제 →';
    }
  },

  /**
   * 다음 문제로 이동하거나 결과 화면 표시
   */
  next() {
    this.currentIndex++;

    if (this.currentIndex >= QUIZ_DATA.length) {
      this.showResult();
    } else {
      this.renderQuestion();
    }
  },

  /**
   * 결과 화면 표시: 점수, 등급, 카테고리별 성적, 틀린 문제 목록
   */
  showResult() {
    // 최고 점수 localStorage 저장
    try {
      const bestKey = 'erc20-tutorial-quiz-best';
      const prevBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (this.score > prevBest) {
        localStorage.setItem(bestKey, String(this.score));
      }
    } catch {}

    // 화면 전환
    const quizScreen = document.getElementById('quiz-screen');
    const quizResult = document.getElementById('quiz-result');
    if (quizScreen) quizScreen.classList.add('hidden');
    if (quizResult) quizResult.classList.remove('hidden');

    // 점수 표시
    const scoreEl = document.getElementById('result-score');
    if (scoreEl) scoreEl.textContent = String(this.score);

    // 등급 결정
    const gradeBadge = document.getElementById('result-grade-badge');
    const gradeMsg = document.getElementById('result-grade-msg');
    const { label, color, msg } = this._getGrade(this.score);

    if (gradeBadge) {
      gradeBadge.textContent = label;
      gradeBadge.className = `px-4 py-1.5 text-sm font-bold rounded-full ${color}`;
    }
    if (gradeMsg) gradeMsg.textContent = msg;

    // 카테고리별 성적 계산
    const categories = ['concept', 'code', 'practice'];
    const catResults = {};
    categories.forEach((cat) => {
      catResults[cat] = { correct: 0, total: 0 };
    });

    QUIZ_DATA.forEach((q, idx) => {
      catResults[q.category].total++;
      if (this.answers[idx]?.correct) {
        catResults[q.category].correct++;
      }
    });

    categories.forEach((cat) => {
      const { correct, total } = catResults[cat];
      const scoreEl2 = document.getElementById(`cat-${cat}-score`);
      const barEl = document.getElementById(`cat-${cat}-bar`);
      if (scoreEl2) scoreEl2.textContent = `${correct}/${total}`;
      if (barEl) barEl.style.width = `${total > 0 ? (correct / total) * 100 : 0}%`;
    });

    // 틀린 문제 목록
    const wrongList = document.getElementById('wrong-answers-list');
    const wrongSection = document.getElementById('wrong-answers-section');
    const wrongAnswers = this.answers.filter((a) => !a.correct);

    if (wrongList) {
      if (wrongAnswers.length === 0) {
        if (wrongSection) wrongSection.classList.add('hidden');
      } else {
        if (wrongSection) wrongSection.classList.remove('hidden');
        wrongList.innerHTML = wrongAnswers
          .map((a) => {
            const q = QUIZ_DATA.find((d) => d.id === a.questionId);
            if (!q) return '';
            const correctOpt = q.options[q.correctAnswer];
            const selectedOpt = q.options[a.selected];
            return `
              <div class="border border-red-100 rounded-lg p-4 bg-red-50">
                <div class="flex items-start gap-2 mb-2">
                  <span class="text-xs px-2 py-0.5 rounded-full ${this._categoryColor[q.category] || ''} flex-shrink-0 mt-0.5">
                    ${this._categoryLabel[q.category] || q.category}
                  </span>
                  <p class="text-sm font-medium text-gray-900">${q.question}</p>
                </div>
                <p class="text-xs text-red-600 mb-1">내 답: ${selectedOpt}</p>
                <p class="text-xs text-green-700">정답: ${correctOpt}</p>
                <p class="text-xs text-gray-500 mt-2 leading-relaxed">${q.explanation}</p>
              </div>
            `;
          })
          .join('');
      }
    }

    // 진행률 바 100%로 완성
    const progressBar = document.getElementById('quiz-progress-bar');
    if (progressBar) progressBar.style.width = '100%';
    const currentScore = document.getElementById('quiz-current-score');
    if (currentScore) currentScore.textContent = String(this.score);
  },

  /**
   * 퀴즈 다시 시작
   */
  reset() {
    this.start();
  },

  // ---- 내부 헬퍼 ----

  /**
   * 점수에 따른 등급 정보를 반환합니다.
   * @param {number} score
   * @returns {{ label: string, color: string, msg: string }}
   */
  _getGrade(score) {
    if (score >= 10) {
      return {
        label: 'ERC20 마스터',
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        msg: '훌륭합니다! ERC20 토큰의 핵심 개념을 완벽하게 이해하고 있습니다.',
      };
    }
    if (score >= 7) {
      return {
        label: '잘 하고 있어요',
        color: 'bg-blue-100 text-blue-800 border border-blue-300',
        msg: '좋은 결과입니다! 조금만 더 학습하면 완벽해질 수 있어요.',
      };
    }
    if (score >= 4) {
      return {
        label: '복습이 필요해요',
        color: 'bg-orange-100 text-orange-800 border border-orange-300',
        msg: '기초는 이해했지만 몇 가지 개념을 다시 살펴보세요.',
      };
    }
    return {
      label: '튜토리얼을 다시 보세요',
      color: 'bg-red-100 text-red-800 border border-red-300',
      msg: '처음부터 차근차근 다시 학습해 보세요. 화이팅!',
    };
  },
};

// ============================================================
// 페이지 초기화 - localStorage에서 저장된 주소 복원
// ============================================================
(function initInteractive() {
  const saved = ContractStorage.load();

  // 저장된 토큰 주소 복원
  if (saved.token) {
    const tokenInput = document.getElementById('interact-token-address');
    if (tokenInput) tokenInput.value = saved.token;
  }

  // 저장된 퍼셋 주소 복원
  if (saved.faucet) {
    const faucetInput = document.getElementById('faucet-address-input');
    if (faucetInput) faucetInput.value = saved.faucet;
  }
})();
