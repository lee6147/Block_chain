# Multi-Agent HTML Assembly: Integration Failure Patterns

## The Insight
When multiple agents independently write sections of a single HTML file, **interface contracts** (IDs, callback signatures, localStorage keys, global variable names) are the #1 failure mode — not the logic within each section. Each agent builds internally consistent code, but the **seams** between agents silently break.

## Why This Matters
We built an ERC20 tutorial with 5 parallel agents writing sections. Every agent's code passed individual validation. After assembly:
- `id="tab-interact"` appeared twice (skeleton + interactive-content), breaking `getElementById`
- `Web3Engine.onConnectionChanged(true, address)` was called with positional args, but the consumer expected `onConnectionChanged({connected, address, network, chainId})` — silent undefined values
- `Web3Engine.isConnected()` and `getState()` were called by skeleton.html but never defined in web3-engine.js
- Deploy tab saved to `localStorage('deployedTokenAddress')`, interact tab read from `localStorage('erc20-tutorial-contracts')` — addresses never shared

## Recognition Pattern
- Assembling output from 3+ independent agents into one file
- `TypeError: X is not a function` on globals defined by another agent
- UI elements not responding (duplicate IDs → wrong element selected)
- Data saved in one tab not appearing in another

## The Approach

**Before launching agents:**
1. Define a **shared contract document**: exact global object names, method signatures with types, callback shapes, localStorage key names, ID naming conventions (namespace prefixes like `panel-*` vs `tab-*`)
2. Assign ID namespaces per agent (Agent A: `tut-*`, Agent B: `deploy-*`, etc.)

**During assembly:**
3. Run duplicate ID scan: `grep -oP 'id="[^"]+"' file.html | sort | uniq -d`
4. Run function reference check: extract all `onclick="X()"` and verify each `X` exists as a function declaration
5. Run localStorage key audit: `grep -oP "localStorage\.\w+Item\('[^']+'" file.html | sort -u`

**After assembly:**
6. Test each tab transition (not just page load)
7. Test cross-tab data flow (save in tab A → load in tab B)

## Example

Bad prompt to agent: "Write a Web3 engine with connection callbacks"
Good prompt to agent: "Write Web3Engine with these exact methods: `isConnected() → boolean`, `getState() → {connected: boolean, address: string|null, network: string, chainId: number|null}`. Callbacks must pass state object: `onConnectionChanged(state)` where state matches getState() return type."
