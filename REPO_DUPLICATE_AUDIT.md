# Duplicate week-folder audit

Date: 2026-04-27
Scope: `C:\Users\user\Desktop\Stable_coin`

## Updated decision

The canonical course layout is now the nested `week/` course workspace:

```text
week/week_1_Blockchain Lab Report/
week/week_2-wallet-price-tracker/
week/week3-sepolia-lab/
week/week4/
week/week5/
week/week6/
```

The root-level Week 1-5 copies were removed after the user clarified that the intended source of truth is `C:\Users\user\Desktop\Stable_coin\week`.

## Why this changed

An earlier cleanup pass temporarily treated the root-level Week 1-5 folders as canonical and made the `week/week*` folders local-only. That was wrong for the user's intended local layout. This pass flips the Git-tracked layout so the repository matches the actual teaching workspace under `week/`.

## Safety checks

Before switching the canonical layout, the duplicated pairs were compared while excluding `.git`, `node_modules`, and local agent/runtime state:

| Root path | `week/` path | Result |
| --- | --- | --- |
| `week_1_Blockchain Lab Report` | `week/week_1_Blockchain Lab Report` | Same files; differences were line endings only. |
| `week_2-wallet-price-tracker` | `week/week_2-wallet-price-tracker` | Same files after the duplicated `HTML/` copy had been removed earlier. |
| `week3-sepolia-lab` | `week/week3-sepolia-lab` | Same teaching files. |
| `week4` | `week/week4` | Same teaching files. |
| `week5` | `week/week5` | Same teaching files; `blockchain_abi_analysis.md` and `week5-study.html` are present under `week/week5`. |

## Current cleanup rule

- Keep course materials under `week/week*`.
- Keep `week/week6` as the active Giwa/ERC20 teaching path.
- Do not track `node_modules`, `.omc`, `.omx`, `.bkit`, `.claude`, `.agents`, or helper repos such as `week/ui-ux-pro-max-skill`.
- Do not recreate root-level Week 1-5 folders unless the project intentionally changes layout again.
