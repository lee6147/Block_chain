# Duplicate week-folder audit

Date: 2026-04-27
Scope: `C:\Users\user\Desktop\Stable_coin`

## Finding

The repository had two competing layouts:

```text
Stable_coin/week_1_Blockchain Lab Report
Stable_coin/week_2-wallet-price-tracker
Stable_coin/week3-sepolia-lab
Stable_coin/week4
Stable_coin/week5

Stable_coin/week/week_1_Blockchain Lab Report
Stable_coin/week/week_2-wallet-price-tracker
Stable_coin/week/week3-sepolia-lab
Stable_coin/week/week4
Stable_coin/week/week5
Stable_coin/week/week/...
```

The `week/` directory is also a nested Git repository and contains another duplicate `week/week/` subtree plus old clone folders.

## Pair comparison, excluding `.git`, `node_modules`, and local agent/runtime state

| Root path | Duplicate inside `week/` | Result |
| --- | --- | --- |
| `week_1_Blockchain Lab Report` | `week/week_1_Blockchain Lab Report` | Same files; differences are line endings only. |
| `week_2-wallet-price-tracker` | `week/week_2-wallet-price-tracker` | Same files; differences are line endings only. |
| `week3-sepolia-lab` | `week/week3-sepolia-lab` | 41/41 files identical. |
| `week4` | `week/week4` | Same files; differences are line endings only. |
| `week5` | `week/week5` | Mostly same; root is newer for shared files. `week/week5` had two extra useful files. |

Extra files preserved from `week/week5`:

- `week5/blockchain_abi_analysis.md`
- `week5/week5-study.html`

## Canonical layout decision

Keep root-level week folders as canonical for Week 1-5:

```text
week_1_Blockchain Lab Report/
week_2-wallet-price-tracker/
week3-sepolia-lab/
week4/
week5/
```

Keep `week/week6` for now because the current Giwa/ERC20 DApp work is there and root `week6/` only contained empty gitlink remnants after the previous cleanup.

## Cleanup action

Use `git rm --cached` for duplicate `week/` subtrees so local files remain on disk but the GitHub repository stops carrying duplicate copies.
