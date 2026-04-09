/**
 * Dashboard - ERC20 거래 내역 대시보드 로직
 * Chart.js v4 + Web3Engine을 사용하여 전송 이벤트 시각화
 */

const Dashboard = {
  // Chart.js 인스턴스 (재렌더링 시 destroy 후 재생성)
  transferChart: null,
  holderChart: null,

  // 마지막으로 조회한 Transfer 이벤트 목록
  events: [],

  // 차트 색상 팔레트
  CHART_COLORS: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'],

  /**
   * 로딩 상태를 토글합니다.
   * @param {boolean} isLoading - 로딩 중 여부
   */
  _setLoading(isLoading) {
    const loadingEl = document.getElementById('dashboard-loading');
    const loadBtn = document.getElementById('dashboard-load-btn');
    if (loadingEl) loadingEl.classList.toggle('hidden', !isLoading);
    if (loadBtn) loadBtn.disabled = isLoading;
  },

  /**
   * 에러 메시지를 표시합니다.
   * @param {string} message - 에러 메시지 (빈 문자열이면 숨김)
   */
  _showError(message) {
    const errorEl = document.getElementById('dashboard-error');
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    } else {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  },

  /**
   * 데이터 불러오기 메인 함수
   * 컨트랙트 주소로 Transfer 이벤트를 조회하고 UI를 갱신합니다.
   */
  async loadData() {
    // 에러 초기화
    this._showError('');

    // 지갑 연결 여부 확인
    if (!Web3Engine.account) {
      this._showError('지갑을 먼저 연결해 주세요.');
      return;
    }

    // 컨트랙트 주소 유효성 확인
    const tokenAddress = document.getElementById('dashboard-token-address')?.value?.trim();
    if (!tokenAddress || !tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
      this._showError('컨트랙트 주소를 입력해 주세요.');
      return;
    }

    try {
      this._setLoading(true);

      // Transfer 이벤트 조회 (최근 1000블록)
      const events = await Web3Engine.getTransferEvents(tokenAddress);
      this.events = events;

      // 부분 히스토리 경고 표시 (항상 표시 - 최근 1000블록만 조회)
      const warningEl = document.getElementById('partial-history-warning');
      if (warningEl) warningEl.classList.remove('hidden');

      // 통계 카드 업데이트
      this.updateStats(events);

      // 차트 렌더링
      this.renderTransferChart(events);
      this.renderHolderChart(events);

      // 거래 내역 테이블 렌더링
      this.renderTable(events);

    } catch (error) {
      this._showError(`데이터 불러오기 실패: ${error.message}`);
    } finally {
      this._setLoading(false);
    }
  },

  /**
   * 통계 카드를 업데이트합니다.
   * - 총 전송 횟수
   * - 고유 주소 수 (from + to 합산)
   * - 총 전송량 합계
   * @param {Array} events - Transfer 이벤트 배열
   */
  updateStats(events) {
    // 총 전송 횟수
    const totalTransfers = events.length;

    // 고유 주소 수 (from, to 모두 포함)
    const addressSet = new Set();
    events.forEach(ev => {
      addressSet.add(ev.from.toLowerCase());
      addressSet.add(ev.to.toLowerCase());
    });
    const uniqueAddresses = addressSet.size;

    // 총 전송량 합계 (부동소수점 누적)
    let totalVolume = 0;
    events.forEach(ev => {
      totalVolume += parseFloat(ev.value) || 0;
    });

    // DOM 업데이트
    const transferEl = document.querySelector('#stat-transfers .stat-value');
    const addressEl = document.querySelector('#stat-addresses .stat-value');
    const volumeEl = document.querySelector('#stat-volume .stat-value');

    if (transferEl) transferEl.textContent = totalTransfers.toLocaleString('ko-KR');
    if (addressEl) addressEl.textContent = uniqueAddresses.toLocaleString('ko-KR');
    if (volumeEl) {
      // 소수점 4자리까지 표시, 큰 수는 축약
      volumeEl.textContent = totalVolume >= 1_000_000
        ? `${(totalVolume / 1_000_000).toFixed(2)}M`
        : totalVolume.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    }
  },

  /**
   * 전송량 추이 바 차트를 렌더링합니다.
   * 블록 범위를 10구간으로 나누어 각 구간의 전송 횟수를 표시합니다.
   * @param {Array} events - Transfer 이벤트 배열
   */
  renderTransferChart(events) {
    const canvas = document.getElementById('transfer-chart');
    const emptyEl = document.getElementById('transfer-chart-empty');
    if (!canvas) return;

    // 기존 차트 destroy
    if (this.transferChart) {
      this.transferChart.destroy();
      this.transferChart = null;
    }

    // 데이터 없음 처리
    if (!events || events.length === 0) {
      canvas.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    // 블록 번호 범위 계산
    const blockNumbers = events.map(ev => ev.blockNumber);
    const minBlock = Math.min(...blockNumbers);
    const maxBlock = Math.max(...blockNumbers);
    const range = Math.max(maxBlock - minBlock, 1);

    // 10구간으로 분할
    const SEGMENT_COUNT = 10;
    const segmentSize = range / SEGMENT_COUNT;

    // 각 구간별 전송 횟수 집계
    const segmentCounts = new Array(SEGMENT_COUNT).fill(0);
    events.forEach(ev => {
      const idx = Math.min(
        Math.floor((ev.blockNumber - minBlock) / segmentSize),
        SEGMENT_COUNT - 1
      );
      segmentCounts[idx]++;
    });

    // 구간 레이블 생성 (블록 번호 범위)
    const labels = Array.from({ length: SEGMENT_COUNT }, (_, i) => {
      const start = Math.floor(minBlock + i * segmentSize);
      return `#${start.toLocaleString('ko-KR')}`;
    });

    // Chart.js 바 차트 생성
    this.transferChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '전송 횟수',
          data: segmentCounts,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `블록 ${items[0].label} 부근`,
              label: (item) => `전송 횟수: ${item.raw}건`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              font: { size: 10 },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            },
            title: {
              display: true,
              text: '전송 건수',
              font: { size: 11 },
            },
          },
        },
      },
    });
  },

  /**
   * 보유자 분포 파이 차트를 렌더링합니다.
   * Transfer 이벤트에서 주소별 순 잔액 변화를 추정합니다.
   * (from → 감소, to → 증가)
   * 상위 5개 주소 + "기타"로 구성됩니다.
   * @param {Array} events - Transfer 이벤트 배열
   */
  renderHolderChart(events) {
    const canvas = document.getElementById('holder-chart');
    const emptyEl = document.getElementById('holder-chart-empty');
    if (!canvas) return;

    // 기존 차트 destroy
    if (this.holderChart) {
      this.holderChart.destroy();
      this.holderChart = null;
    }

    // 데이터 없음 처리
    if (!events || events.length === 0) {
      canvas.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    // 주소별 순 잔액 추정 (from: 차감, to: 증가)
    const balanceMap = {};
    events.forEach(ev => {
      const value = parseFloat(ev.value) || 0;
      const from = ev.from.toLowerCase();
      const to = ev.to.toLowerCase();

      balanceMap[from] = (balanceMap[from] || 0) - value;
      balanceMap[to] = (balanceMap[to] || 0) + value;
    });

    // 양수 잔액만 추출하고 내림차순 정렬
    const positiveEntries = Object.entries(balanceMap)
      .filter(([, bal]) => bal > 0)
      .sort(([, a], [, b]) => b - a);

    if (positiveEntries.length === 0) {
      canvas.classList.add('hidden');
      if (emptyEl) {
        emptyEl.textContent = '잔액 데이터를 계산할 수 없습니다';
        emptyEl.classList.remove('hidden');
      }
      return;
    }

    // 상위 5개 + 기타
    const TOP_N = 5;
    const top5 = positiveEntries.slice(0, TOP_N);
    const others = positiveEntries.slice(TOP_N);
    const othersTotal = others.reduce((sum, [, bal]) => sum + bal, 0);

    const labels = top5.map(([addr]) => Web3Engine.shortenAddress(addr));
    const data = top5.map(([, bal]) => parseFloat(bal.toFixed(4)));

    if (othersTotal > 0) {
      labels.push('기타');
      data.push(parseFloat(othersTotal.toFixed(4)));
    }

    // Chart.js 파이 차트 생성
    this.holderChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.CHART_COLORS.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 11 },
              padding: 12,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: {
              label: (item) => {
                const total = item.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((item.raw / total) * 100).toFixed(1) : 0;
                return ` ${item.raw.toLocaleString('ko-KR')} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  },

  /**
   * 거래 내역 테이블을 렌더링합니다.
   * 주소는 축약 형태로, Tx Hash는 Etherscan 링크로 표시합니다.
   * @param {Array} events - Transfer 이벤트 배열
   */
  renderTable(events) {
    const tbody = document.getElementById('tx-table-body');
    const noMsgEl = document.getElementById('no-tx-message');
    const tableEl = document.getElementById('tx-table');
    if (!tbody) return;

    // 기존 행 초기화
    tbody.innerHTML = '';

    // 데이터 없음 처리
    if (!events || events.length === 0) {
      if (tableEl) tableEl.classList.add('hidden');
      if (noMsgEl) noMsgEl.classList.remove('hidden');
      return;
    }

    if (tableEl) tableEl.classList.remove('hidden');
    if (noMsgEl) noMsgEl.classList.add('hidden');

    // 최신 블록 순으로 정렬 (내림차순)
    const sorted = [...events].sort((a, b) => b.blockNumber - a.blockNumber);

    sorted.forEach(ev => {
      const etherscanUrl = Web3Engine.getEtherscanTxUrl(ev.txHash);
      const shortHash = ev.txHash
        ? `${ev.txHash.slice(0, 8)}...${ev.txHash.slice(-6)}`
        : '-';

      // 수량 포맷 (소수점 4자리)
      const formattedValue = parseFloat(ev.value).toLocaleString('ko-KR', {
        maximumFractionDigits: 4,
      });

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition-colors';
      tr.innerHTML = `
        <td class="py-2 px-3 font-mono text-xs text-gray-700" title="${ev.from}">
          ${Web3Engine.shortenAddress(ev.from)}
        </td>
        <td class="py-2 px-3 font-mono text-xs text-gray-700" title="${ev.to}">
          ${Web3Engine.shortenAddress(ev.to)}
        </td>
        <td class="py-2 px-3 text-xs text-right text-gray-800 font-medium">
          ${formattedValue}
        </td>
        <td class="py-2 px-3 text-xs text-right text-gray-500">
          ${ev.blockNumber.toLocaleString('ko-KR')}
        </td>
        <td class="py-2 px-3 text-xs text-right">
          <a
            href="${etherscanUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="font-mono text-blue-600 hover:text-blue-800 hover:underline"
            title="${ev.txHash}"
          >${shortHash}</a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },
};
