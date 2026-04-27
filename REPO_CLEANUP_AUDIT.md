# Stable_coin / Block_chain Repo Cleanup Audit

## Verified connection

- Local git root: `C:/Users/user/Desktop/Stable_coin`
- Remote: `https://github.com/lee6147/Block_chain.git`
- Branch: `main`
- Local state before cleanup: `main...origin/main [behind 1]`
- Latest local HEAD seen: `6188cf2 Add Week6 ERC20 staking assignment materials`
- Remote-tracking HEAD seen: `0ac7324 Rename 00_README.md to README.md`

## High-risk findings

### 1. Nested Git repos

Found:

```text
.git
week/.git
week/Block_chain_push_work/.git
week/ui-ux-pro-max-skill/.git
```

This makes commit/push behavior ambiguous because `week/` is both a nested repository and a path that the parent repository tracks.

### 2. Tracked generated dependencies

Tracked `node_modules` count before cleanup: `3708`.

This is the biggest repository bloat source and should not stay in Git.

### 3. Runtime state mixed into repo

Tracked or untracked state folders were present, including `.omc`, `.omx`, `.claude`, `.agents`, and `.bkit` paths.

### 4. Duplicate course layout

Examples:

```text
week/week3-sepolia-lab vs week3-sepolia-lab
week/week_2-wallet-price-tracker vs week_2-wallet-price-tracker
week/week5 vs week5
week/week6 vs week6
```

The repo needs a single canonical teaching-material layout before a clean push.

### 5. Gitlink/submodule ambiguity

Gitlink-style tracked entries exist but `.gitmodules` is absent. That means clone behavior can be broken or confusing.

### 6. Git permission issue

A `git fetch --prune origin` attempt reported:

```text
error: cannot open '.git/FETCH_HEAD': Permission denied
```

So remote synchronization may also require a Windows ACL repair later.

## Pass 1 result section

To be updated after the first hygiene pass.

## Pass 1 result - 2026-04-27

Actions completed:

- Created `REPO_CLEANUP_PLAN.md`.
- Updated `.gitignore` for generated/runtime files.
- Ran `git rm --cached` only for dependency/runtime/generated paths.
- No local dependency or state files were deleted from disk.

Verification:

```text
tracked node_modules after: 0
tracked runtime state after: 0
local week_2-wallet-price-tracker/node_modules exists: True
local week_2-wallet-price-tracker/HTML/node_modules exists: True
local .omc skills file exists: True
```

Important remaining issues:

- The working tree still contains pre-existing tracked deletions under `week/week6/*.md` and `Block_chain_push_work`.
- `week/week6/30_DApp.html` still has a pre-existing local modification.
- Nested Git repos still exist under `week/`, `week/Block_chain_push_work/`, and `week/ui-ux-pro-max-skill/`.
- Local branch is still one commit behind `origin/main`; do not push until the remaining layout decision is handled.
