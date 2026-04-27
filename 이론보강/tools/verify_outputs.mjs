#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const mode = process.argv.slice(2).find((arg) => arg.startsWith('--')) || '--full';

const requiredHarnessFiles = [
  'START_HERE.md',
  '00_HARNESS_CONTRACT.md',
  '01_SOURCE_MANIFEST.md',
  'tasks/agent-audit-curriculum.md',
  'tasks/agent-md-week1-2.md',
  'tasks/agent-md-week3-4.md',
  'tasks/agent-md-week5-6.md',
  'tasks/agent-html-week1-3.md',
  'tasks/agent-html-week4-6.md',
  'tasks/agent-qa.md',
  'tools/verify_outputs.mjs',
  'evidence/screenshots/.gitkeep',
  'evidence/console/.gitkeep',
];

const mdFiles = [
  '01_week1_blockchain_basics.md',
  '02_week2_wallet_transaction.md',
  '03_week3_testnet_gas_nonce_signature.md',
  '04_week4_stablecoin_networks.md',
  '05_week5_solidity_remix_faucet.md',
  '06_week6_erc20_staking_errors.md',
];

const htmlFiles = [
  '01_week1_blockchain_basics.html',
  '02_week2_wallet_transaction.html',
  '03_week3_testnet_gas_nonce_signature.html',
  '04_week4_stablecoin_networks.html',
  '05_week5_solidity_remix_faucet.html',
  '06_week6_erc20_staking_errors.html',
  'index.html',
];

const requiredMdSections = [
  '## 학습 목표',
  '## 비유로 먼저 이해하기',
  '## 정석 개념 설명',
  '## 수업 실습과 연결',
  '## 자주 헷갈리는 지점',
  '## HTML 시뮬레이터 설계',
  '## 체크리스트',
  '## 참고한 기존 자료',
];

const failures = [];
const warnings = [];

function rel(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(rel(file));
}

function read(file) {
  return fs.readFileSync(rel(file), 'utf8');
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function checkHarness() {
  for (const file of requiredHarnessFiles) {
    if (!exists(file)) fail(`Missing harness file: ${file}`);
  }

  for (const file of ['START_HERE.md', '00_HARNESS_CONTRACT.md']) {
    if (!exists(file)) continue;
    const text = read(file);
    for (const phrase of ['MD', 'HTML', '시뮬레이터', '정석']) {
      if (!text.includes(phrase)) fail(`${file} missing contract phrase: ${phrase}`);
    }
  }

  const start = exists('START_HERE.md') ? read('START_HERE.md') : '';
  for (const phrase of ['읽기 순서', '00_HARNESS_CONTRACT.md', '01_SOURCE_MANIFEST.md', 'tasks/agent-*.md']) {
    if (!start.includes(phrase)) fail(`START_HERE.md missing start rule: ${phrase}`);
  }
}

function checkMdFiles() {
  for (const file of mdFiles) {
    if (!exists(file)) {
      fail(`Missing MD output: ${file}`);
      continue;
    }
    const text = read(file);
    for (const section of requiredMdSections) {
      if (!text.includes(section)) fail(`${file} missing section: ${section}`);
    }
    if (!/비유|예시|쉽게 말하면/.test(text)) fail(`${file} needs analogy-oriented explanation`);
    if (!/정의|원리|정석|공식|구조/.test(text)) fail(`${file} needs formal explanation terms`);
  }
}

function checkHtmlFiles() {
  for (const file of htmlFiles) {
    if (!exists(file)) {
      fail(`Missing HTML output: ${file}`);
      continue;
    }
    const text = read(file);
    if (!/<title[\s>]/i.test(text)) fail(`${file} missing <title>`);
    if (!/<h1[\s>]/i.test(text)) fail(`${file} missing <h1>`);
    if (!/(목차|nav|toc|data-section)/i.test(text)) fail(`${file} missing navigation or table of contents`);
    const interactiveCount = (text.match(/<(button|input|select|textarea)\b/gi) || []).length;
    if (interactiveCount < 2) fail(`${file} needs at least 2 interactive controls, found ${interactiveCount}`);
    if (!/(reset|초기화|다시|리셋)/i.test(text)) fail(`${file} missing reset/initial-state affordance`);
    if (!/(시뮬레이터|시뮬레이션|interactive|animation|애니메이션)/i.test(text)) fail(`${file} missing simulator language`);
  }
}

function resolvePlaywright() {
  const candidates = [];
  if (process.env.NODE_PATH) {
    for (const entry of process.env.NODE_PATH.split(path.delimiter)) {
      candidates.push(path.join(entry, 'playwright'));
    }
  }
  candidates.push(path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
  candidates.push(path.join(process.env.HOME || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
  candidates.push('playwright');
  return candidates;
}

async function importPlaywright() {
  for (const candidate of resolvePlaywright()) {
    try {
      if (candidate === 'playwright') return await import('playwright');
      const pkg = path.join(candidate, 'index.mjs');
      const cjs = path.join(candidate, 'index.js');
      if (fs.existsSync(pkg)) return await import(pathToFileURL(pkg).href);
      if (fs.existsSync(cjs)) return await import(pathToFileURL(cjs).href);
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

async function checkBrowser() {
  const candidates = htmlFiles.filter((file) => exists(file));
  if (candidates.length === 0) {
    fail('No HTML files available for browser verification');
    return;
  }

  const pw = await importPlaywright();
  if (!pw?.chromium) {
    warn('Playwright not available; browser verification skipped');
    return;
  }

  const screenshotDir = rel('evidence/screenshots');
  const consoleDir = rel('evidence/console');
  fs.mkdirSync(screenshotDir, { recursive: true });
  fs.mkdirSync(consoleDir, { recursive: true });

  const browser = await pw.chromium.launch();
  try {
    for (const file of candidates) {
      for (const width of [375, 768, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });
        const consoleErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        await page.goto(pathToFileURL(rel(file)).href, { waitUntil: 'domcontentloaded' });
        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          buttonCount: document.querySelectorAll('button,input,select,textarea').length,
          bodyText: document.body?.innerText?.slice(0, 500) || '',
        }));
        if (metrics.scrollWidth > metrics.clientWidth + 2) {
          fail(`${file} has horizontal overflow at ${width}px (${metrics.scrollWidth} > ${metrics.clientWidth})`);
        }
        if (metrics.buttonCount < 2) fail(`${file} has fewer than 2 controls in browser at ${width}px`);
        if (consoleErrors.length > 0) fail(`${file} console errors at ${width}px: ${consoleErrors.join(' | ')}`);
        const base = file.replace(/[\\/]/g, '_').replace(/\.html$/i, '');
        await page.screenshot({ path: path.join(screenshotDir, `${base}-${width}.png`), fullPage: true });
        fs.writeFileSync(path.join(consoleDir, `${base}-${width}.json`), JSON.stringify({ consoleErrors, metrics }, null, 2), 'utf8');
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  checkHarness();

  if (mode === '--harness-only') {
    printResult();
    return;
  }

  if (mode === '--md-only' || mode === '--full') checkMdFiles();
  if (mode === '--html-only' || mode === '--full') checkHtmlFiles();
  if (mode === '--browser' || mode === '--full') await checkBrowser();

  printResult();
}

function printResult() {
  if (warnings.length) {
    console.log('WARNINGS');
    for (const item of warnings) console.log(`- ${item}`);
  }
  if (failures.length) {
    console.error('FAILURES');
    for (const item of failures) console.error(`- ${item}`);
    process.exitCode = 1;
    return;
  }
  console.log(`OK ${mode}: harness/output contract checks passed`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
