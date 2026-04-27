# Stable_coin / Block_chain Repo Cleanup Plan

Date: 2026-04-27
Scope: C:\Users\user\Desktop\Stable_coin linked to https://github.com/lee6147/Block_chain

## Safety rule

This pass does not delete local work. It only:

1. records the current repo state,
2. strengthens ignore rules, and
3. removes generated/runtime files from Git tracking with `git rm --cached` so files remain on disk.

No `git reset --hard`, no recursive local deletion, and no push in this pass.

## Cleanup smells found

1. Nested Git repositories under `week/`, `week/Block_chain_push_work/`, and `week/ui-ux-pro-max-skill/`.
2. Tracked dependency folders, especially `week_2-wallet-price-tracker/**/node_modules`.
3. Runtime/agent state folders mixed into the teaching repo: `.omc`, `.omx`, `.claude`, `.agents`, `.bkit`.
4. Duplicate course paths, for example `week/week3-sepolia-lab` and `week3-sepolia-lab`.
5. Broken/unclear gitlink-style entries without a `.gitmodules` file.
6. Dirty working tree with tracked deletions, tracked modifications, and many untracked deliverables.

## Pass order

### Pass 1 - Git hygiene, safest

- Add ignore rules for generated/runtime files.
- Untrack `node_modules` and runtime state using `git rm --cached` only.
- Verify that local files still exist.

### Pass 2 - Structure decision, not done automatically in this pass

- Choose one canonical layout.
- Recommended target:

```text
Stable_coin/
  README.md
  week3-sepolia-lab/
  week_2-wallet-price-tracker/
  week4/
  week5/
  week6/
  특강/
```

- Treat `week/` as duplicate/archive unless a later check proves it contains the newest source for a specific lesson.

### Pass 3 - Nested Git repair, deferred until after Pass 1

- Decide whether nested repos should be removed as Git repos, converted to true submodules, or moved outside this repo.
- Do not push until this is resolved.

## Verification after Pass 1

- `git status --short --branch`
- tracked `node_modules` count should become 0
- tracked `.omc/.omx/.claude/.agents/.bkit` state count should drop to 0 or near 0
- local files should remain on disk because `--cached` was used
