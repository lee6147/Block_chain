# Week 12 DAO / Parity Smart Contract Security Lab

> **Local Hardhat simulation only.** This repository is an offline education package for Week 12 smart-contract security. It does **not** use a live network, private key, RPC URL, faucet, wallet, or real funds.

This folder turns the DAO and Parity case studies into a GitHub-style submission package: Solidity contracts, executable Hardhat simulations, retained logs, and a delegatecall storage diagram.

## Assignment objective

Demonstrate three historical smart-contract failure modes in a controlled local environment, then show the matching mitigations or final state.

1. **DAO Reentrancy** — vulnerable withdrawal order drains the DAO; fixed variants prevent the reentrant path.
2. **Parity #1: Unauthorized Initialization** — uninitialized proxy wallets can be taken over through `delegatecall`; constructor initialization fixes it.
3. **Parity #2: Library Self-Destruct** — shared-library destruction freezes wallets that still point to removed code; funds are **frozen, not stolen**.

Korean note: 이 폴더는 제출용 로컬 실습 패키지입니다. 실제 네트워크 배포나 개인키 사용 없이 Hardhat 메모리 체인에서만 재현합니다.

## Safety boundary

- **Local Hardhat simulation only** (`--network hardhatMainnet`).
- **No live network, no private key, no RPC URL.**
- **No Remix or localhost web server is required.** The `.js` files are Hardhat automation scripts, not frontend code.
- Vulnerable contracts are intentionally unsafe and must remain inside this controlled lab.
- The scripts write evidence to `logs/`; they are not deployment scripts.
- Parity #2 wording matters: the replay shows a **freeze/loss of access** condition, not attacker theft of wallet balances.

## Quick start

```powershell
cd C:\Users\user\Desktop\Stable_coin\week\week_12
npm ci
npm test
```

If `npm ci` is unavailable in a copied folder, use `npm install` as a fallback. For a clean GitHub checkout with `package-lock.json`, `npm ci` is preferred because it reproduces the locked dependency set.

`npm test` is the main verification gate. It compiles the contracts and runs every simulation:

```powershell
npm run compile
npm run simulate:dao
npm run simulate:dao-fixes
npm run simulate:parity1
npm run simulate:parity2
```

A passing run regenerates or preserves these evidence logs:

- `logs/dao_attack.log`
- `logs/dao_fixes.log`
- `logs/parity1_attack.log`
- `logs/parity2_freeze.log`

## Repository structure

```text
week_12/
  contracts/
    dao/
      SimpleDAO.sol
      DAOAttacker.sol
      SimpleDAO_CEI.sol
      SimpleDAO_Guard.sol
      SimpleDAO_PullPayment.sol
    parity1/
      WalletLibraryVulnerable.sol
      WalletVulnerable.sol
      WalletFixed.sol
    parity2/
      SharedWalletLibraryVulnerable.sol
      SharedWallet.sol
      SharedWalletLibraryFixed.sol
  scripts/
    01_dao_attack.js
    02_dao_fixes.js
    03_parity1_attack.js
    04_parity2_freeze.js
    lib.js
  logs/
    dao_attack.log
    dao_fixes.log
    parity1_attack.log
    parity2_freeze.log
  diagrams/
    delegatecall_storage_collision.md
  07_smart_contract_security_dao_parity (1).html
  student_ai_prompt_week12.md
  hardhat.config.js
  package.json
  package-lock.json
  README.md
```

## Submission boundary

Keep the review focus on the executable lab package, not on generated local tool folders.

| Category | Include / rely on | Notes |
| --- | --- | --- |
| Core submission | `contracts/`, `scripts/`, `logs/`, `diagrams/`, `README.md`, `package.json`, `package-lock.json`, `hardhat.config.js` | These files prove the three assignment parts and the local verification path. |
| Auxiliary study material | `07_smart_contract_security_dao_parity (1).html`, `student_ai_prompt_week12.md` | Helpful for learning or prompting, but not the primary executable evidence. |
| Regenerable local output | `artifacts/`, `cache/`, `node_modules/` | Created by install/compile/test. Do not treat these as hand-written deliverables. |
| Agent/runtime state | `.omx/` | Local workflow state only; not part of the assignment evidence. |

## Assignment-to-file mapping

| Assignment part | What is demonstrated | Core contracts | Run script | Evidence output | Supporting material |
| --- | --- | --- | --- | --- | --- |
| DAO Reentrancy | External call before balance update allows recursive withdrawal; CEI/guard/pull-payment variants stop it. | `contracts/dao/*` | `scripts/01_dao_attack.js`, `scripts/02_dao_fixes.js` | `logs/dao_attack.log`, `logs/dao_fixes.log` | Vulnerability notes in this README |
| Parity #1 Unauthorized Initialization | Proxy fallback `delegatecall` lets attacker initialize uninitialized proxy storage. | `contracts/parity1/*` | `scripts/03_parity1_attack.js` | `logs/parity1_attack.log` | `diagrams/delegatecall_storage_collision.md` |
| Parity #2 Library Self-Destruct | Shared library takeover and `selfdestruct` remove delegated code, freezing proxy wallets. | `contracts/parity2/*` | `scripts/04_parity2_freeze.js` | `logs/parity2_freeze.log` | `hardhat.config.js` Merge/Paris settings |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run compile` | Compile all contracts under `contracts/`. |
| `npm run simulate:dao` | Run the vulnerable DAO reentrancy replay and write `logs/dao_attack.log`. |
| `npm run simulate:dao-fixes` | Run CEI, reentrancy-guard, and pull-payment DAO mitigations and write `logs/dao_fixes.log`. |
| `npm run simulate:parity1` | Run Parity #1 unauthorized initialization replay plus fixed-wallet check and write `logs/parity1_attack.log`. |
| `npm run simulate:parity2` | Run Parity #2 library self-destruct freeze replay plus fixed-library check and write `logs/parity2_freeze.log`. |
| `npm run simulate:all` | Run all four simulation scripts in sequence. |
| `npm test` | Full submission gate: compile, then run `simulate:all`. |

## Expected results

### 1. DAO Reentrancy

Core files:

- `contracts/dao/SimpleDAO.sol`
- `contracts/dao/DAOAttacker.sol`
- `contracts/dao/SimpleDAO_CEI.sol`
- `contracts/dao/SimpleDAO_Guard.sol`
- `contracts/dao/SimpleDAO_PullPayment.sol`

Expected vulnerable flow:

1. Victim deposits 10 ETH into `SimpleDAO`.
2. Attacker seeds 1 ETH.
3. `DAOAttacker.receive()` re-enters `withdraw()` before `SimpleDAO` reduces the recorded balance.
4. The DAO balance reaches 0 ETH and the attacker contract balance records the captured funds.

Vulnerable ordering:

```solidity
(bool ok, ) = payable(msg.sender).call{value: amount}("");
require(ok, "send failed");
balances[msg.sender] -= amount;
```

Fix coverage:

- `SimpleDAO_CEI.sol` reduces balance before the external call.
- `SimpleDAO_Guard.sol` blocks recursive `withdraw()` with a local guard.
- `SimpleDAO_PullPayment.sol` queues withdrawals so the vulnerable contract does not push Ether during the first `withdraw()` call.

Compatibility note: the vulnerable replay intentionally includes legacy-style behavior for teaching. The large underflowed recorded balance in `dao_attack.log` is a demonstration artifact, not a desired modern-contract behavior.

### 2. Parity #1: Unauthorized Initialization

Core files:

- `contracts/parity1/WalletLibraryVulnerable.sol`
- `contracts/parity1/WalletVulnerable.sol`
- `contracts/parity1/WalletFixed.sol`
- `diagrams/delegatecall_storage_collision.md`

Expected vulnerable flow:

1. One vulnerable wallet library is deployed.
2. Three proxy wallets delegate to that same library.
3. Wallet 1 is initialized by the legitimate owner and shows normal owner control.
4. Wallets 2 and 3 are left uninitialized.
5. Attacker calls `initWallet([attacker], 1)` through each uninitialized proxy fallback.
6. `delegatecall` writes attacker ownership into each proxy's storage.
7. Attacker calls `execute()` and drains Wallets 2 and 3.

Expected fixed flow:

- `WalletFixed` initializes ownership in the constructor.
- Re-running `initWallet()` reverts with `already initialized`.
- Attacker `execute()` reverts with `owner only`.

### 3. Parity #2: Library Self-Destruct

Core files:

- `contracts/parity2/SharedWalletLibraryVulnerable.sol`
- `contracts/parity2/SharedWallet.sol`
- `contracts/parity2/SharedWalletLibraryFixed.sol`

Expected vulnerable flow:

1. One vulnerable shared library is deployed.
2. Three funded `SharedWallet` proxies are initialized with the legitimate owner and point to that shared library.
3. The library contract itself can be initialized directly.
4. Attacker becomes owner of the library's own storage.
5. Attacker calls `killLibrary()`.
6. Each proxy still points to the same library address, but the code at that address is gone.
7. Owner `execute()` calls fail and wallet balances remain in place.

> **Important:** Parity #2 freezes funds; it does not transfer wallet funds to the attacker.

Expected fixed flow:

- `SharedWalletLibraryFixed` disables direct library-instance initialization.
- It exposes no `killLibrary()` / `selfdestruct` entrypoint.
- A wallet using the fixed library remains usable by the legitimate owner.

## Why Hardhat uses Merge/Paris here

`hardhat.config.js` sets:

- Solidity EVM version: `paris`
- Hardhat simulated network hardfork: `merge`

This is intentional. Modern Cancun/Prague semantics changed `SELFDESTRUCT` behavior, so the Parity #2 historical replay needs pre-Cancun behavior to show the shared-library code disappearing and the proxy wallets freezing.

## Core deliverables checklist

- [x] Vulnerable Solidity contracts for DAO, Parity #1, and Parity #2
- [x] Attacker/exploit simulation scripts
- [x] Fixed Solidity contracts or fixed-library variants
- [x] Transaction/result logs under `logs/`
- [x] Delegatecall storage-collision diagram under `diagrams/`
- [x] Local-only safety boundary
- [x] One-command verification through `npm test`

## Auxiliary materials

These files are useful for study or prompting, but they are not the core executable submission evidence:

- `07_smart_contract_security_dao_parity (1).html` — teaching/reference HTML for the DAO and Parity topics.
- `student_ai_prompt_week12.md` — student-facing AI prompt/support note.

## Verification checklist for reviewers

Run these commands from `week_12/`:

```powershell
npm test
Get-ChildItem logs
Get-Content logs/dao_attack.log -Tail 8
Get-Content logs/dao_fixes.log -Tail 8
Get-Content logs/parity1_attack.log -Tail 8
Get-Content logs/parity2_freeze.log -Tail 8
```

Pass criteria:

- Compile succeeds.
- DAO attack log shows the vulnerable DAO drained to 0 ETH.
- DAO fixes log shows the CEI and guard reverts plus the pull-payment safe path.
- Parity #1 log shows uninitialized wallets drained and fixed wallet protected.
- Parity #2 log shows wallet balances frozen in place, not stolen, and the fixed shared-library wallet remains usable.
