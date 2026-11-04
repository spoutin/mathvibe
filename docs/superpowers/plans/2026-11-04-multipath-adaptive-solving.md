# Multi-Path Adaptive Solving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support multiple valid mathematical solving paths for problems (such as solving algebraically first vs substituting first for $3x + 7 = 22$ with $x = 5$, or distributing first vs dividing first for $2(x - 3) = 14$), dynamically adopting the student's chosen strategy.

**Architecture:** A multi-path solution generator (`src/lib/math/multipath.ts`) that generates alternative canonical Grade 9 solving paths. An adaptive validator (`src/lib/math/validator.ts`) accepts valid initial steps from any legitimate path and pivots `StepPlayer.svelte` to that path, displaying an encouraging Strategy Badge.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`), TypeScript, Vite, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-multipath-adaptive-solving-design.md`

## Global Constraints

- Svelte 5 with runes.
- Fully client-side; zero external APIs.
- Standard plain-text arithmetic in terminal/CLI (no LaTeX notation).
- Tests written with Vitest.

## Review Focus

1. **Equation with Assigned Variable Multi-Path:** For $3x + 7 = 22$ with $x = 5$, both $3(5) + 7 = 22$ AND $3x = 15$ validate as correct on Step 1. (Tested in Task 1 & Task 2).
2. **Equation with Distributive Brackets Multi-Path:** For $2(x - 3) = 14$, both $2x - 6 = 14$ AND $x - 3 = 7$ validate as correct on Step 1. (Tested in Task 1 & Task 2).
3. **Dynamic Step Sequence Pivoting:** Entering $3x = 15$ switches the active steps to $3x = 15$ ➔ $x = 5$. (Tested in Task 2 & Task 3).
4. **Strategy Badge Display:** The strategy badge displays the student's active approach (e.g. `🧭 Strategy: Algebra First` vs `🧭 Strategy: Direct Substitution`). (Tested in Task 3).
5. **Preservation of Single-Path Problems:** Non-branching problems (like standard arithmetic or trinomial factoring) continue working with zero regressions. (Tested in Task 3).

---

### Task 1: Multi-Path Solution Generator

**Files:**
- Create: `src/lib/math/multipath.ts`
- Test: `tests/multipath.test.ts`

**Interfaces:**
- Produces:
  - `SolutionPath`: `{ id: string; strategyLabel: string; steps: MathStep[]; finalAnswer: string; }`
  - `generateSolutionPaths(rawInput: string, variableValues?: Record<string, string>): SolutionPath[]`

- [ ] **Step 1: Write failing tests for multi-path generator**
In `tests/multipath.test.ts`, test:
  1. $3x + 7 = 22$ with $x = 5$: generates Path A (Direct Substitution, step 1 $3(5) + 7 = 22$) and Path B (Algebra First, step 1 $3x = 15$).
  2. $2(x - 3) = 14$: generates Path A (Distributive Property, step 1 $2x - 6 = 14$) and Path B (Divide First, step 1 $x - 3 = 7$).
  3. Non-divisible bracket $3(x - 2) = 10$: only generates Distributive path (since 10 is not divisible by 3).
  4. Standard non-branching problem generates single default path.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/multipath.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `generateSolutionPaths` in `src/lib/math/multipath.ts`**
Inspect problem type, check for equation with variable assignments or divisible outer multipliers, generate alternative `SolutionPath` objects with clear strategy labels.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/multipath.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/multipath.ts tests/multipath.test.ts
git commit -m "feat: add multi-path solution generator for algebra and substitution"
```

---

### Task 2: Adaptive Multi-Path Validator & Engine Integration

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/math/validator.ts`
- Modify: `src/lib/math/engine.ts`
- Test: `tests/multipath-validator.test.ts`

**Interfaces:**
- Consumes: `SolutionPath`, `generateSolutionPaths` from Task 1.
- Produces:
  - `validateStepMultiPath(userInput, currentIndex, activeSteps, paths)`
  - `SolveResult.paths` and `SolveResult.strategyLabel` populated in `engine.ts`.

- [ ] **Step 1: Write failing tests for multi-path validator**
In `tests/multipath-validator.test.ts`, test:
  1. Entering $3x = 15$ when active path is substitution: returns `{ status: 'correct', switchedPath: algebraPath }`.
  2. Entering $x - 3 = 7$ when active path is distributive: returns `{ status: 'correct', switchedPath: divisionPath }`.
  3. Truly invalid input returns `{ status: 'incorrect' }`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/multipath-validator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `validateStepMultiPath` and update `engine.ts`**
Attach `paths` to `SolveResult` in `engine.ts`. In `validator.ts`, check alternate path initial steps when `currentIndex === 0`.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/multipath-validator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/types.ts src/lib/math/validator.ts src/lib/math/engine.ts tests/multipath-validator.test.ts
git commit -m "feat: implement adaptive multi-path step validator and engine integration"
```

---

### Task 3: UI Strategy Badge, Dynamic Path Switching & E2E Integration

**Files:**
- Modify: `src/lib/components/StepPlayer.svelte`
- Create: `tests/multipath-integration.test.ts`

**Interfaces:**
- Renders strategy badge in `StepPlayer.svelte`.
- Switches step deck dynamically when an alternative path is adopted.

- [ ] **Step 1: Write integration tests in `tests/multipath-integration.test.ts`**
Verify complete solving workflows for both paths on $3x + 7 = 22$ ($x = 5$) and $2(x - 3) = 14$ through `solveGrade9Math` and `validateStepMultiPath`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/multipath-integration.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `StepPlayer.svelte`**
Render strategy badge `[ 🧭 Strategy: ... ]`.
When validator returns `switchedPath`, update active steps and strategy badge, keeping progress synchronized.

- [ ] **Step 4: Run full test suite and build verification**
Run: `npm test` and `npm run build`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/lib/components/StepPlayer.svelte tests/multipath-integration.test.ts
git commit -m "feat: add strategy badges and dynamic path switching in step player"
```
