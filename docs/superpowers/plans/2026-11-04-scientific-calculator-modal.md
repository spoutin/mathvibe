# Scientific Calculator Modal Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating action button (FAB) that opens a full-featured high school scientific calculator modal popup supporting trigonometry (with DEG/RAD toggle), logarithms, powers, roots, factorials, and constants, with a direct "Insert into Step" integration.

**Architecture:** Pure client-side scientific evaluation engine (`src/lib/math/scientific.ts`) paired with a modal component (`src/lib/components/ScientificCalculatorModal.svelte`). Connected to `App.svelte` via a sticky floating launch button and step input synchronization.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`, `$effect`), TypeScript, Vite, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-scientific-calculator-modal-design.md`

## Global Constraints

- Svelte 5 with runes.
- Fully client-side; zero external APIs.
- Standard plain-text arithmetic in terminal/CLI (no LaTeX notation).
- Tests written with Vitest.

## Review Focus

1. **Trig in Degrees vs Radians:** $\sin(30^\circ)$ in DEG mode must equal `0.5` exactly without floating-point artifacts like `0.49999999999999994`. (Tested in Task 1).
2. **Logarithms and Natural Log:** $\log_{10}(1000) = 3$ and $\ln(e) = 1$. (Tested in Task 1).
3. **Factorials and Negative Roots:** Factorial $5! = 120$; $\sqrt{-4}$ throws a friendly "Domain Error / Negative Root" rather than crashing with `NaN`. (Tested in Task 1).
4. **Previous Answer (`Ans`):** Using `Ans` in an expression evaluates the previous calculation result. (Tested in Task 1).
5. **Modal Dismissal and Step Insertion:** Clicking "Insert into Step ↵" transfers the calculated value to the active input and closes the modal; `Escape` key closes modal. (Tested in Task 2 & Task 3).

---

### Task 1: High School Scientific Calculation Engine

**Files:**
- Create: `src/lib/math/scientific.ts`
- Test: `tests/scientific.test.ts`

**Interfaces:**
- Produces:
  - `evaluateScientific(expr: string, angleMode: 'deg' | 'rad', lastAns?: number): { success: boolean; result: number; display: string; error?: string; }`

- [ ] **Step 1: Write failing tests for scientific calculator engine**
In `tests/scientific.test.ts`, test:
  1. Trig functions in degrees: `sin(30)` = `0.5`, `cos(60)` = `0.5`, `tan(45)` = `1`.
  2. Trig functions in radians: `sin(pi / 2)` = `1`.
  3. Inverse trig: `asin(0.5)` in degrees = `30`.
  4. Logarithms: `log(100)` = `2`, `ln(e)` = `1`.
  5. Powers & roots: `sqrt(144)` = `12`, `cbrt(27)` = `3`, `2^4` = `16`.
  6. Factorial: `fact(5)` = `120`.
  7. Constants: `pi` and `e`.
  8. Domain error on `sqrt(-9)`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/scientific.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `evaluateScientific` in `src/lib/math/scientific.ts`**
Implement tokenizer for scientific functions (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `log`, `ln`, `sqrt`, `cbrt`, `abs`, `fact`), constants (`pi`, `e`), and operators with DEG/RAD angle conversion and clean floating-point rounding.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/scientific.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/scientific.ts tests/scientific.test.ts
git commit -m "feat: add scientific calculation engine with trig, logs, and powers"
```

---

### Task 2: Scientific Calculator Modal Component

**Files:**
- Create: `src/lib/components/ScientificCalculatorModal.svelte`

**Interfaces:**
- Consumes: `evaluateScientific` from Task 1.
- Produces:
  - `ScientificCalculatorModal`: modal with full scientific keypad, DEG/RAD toggle, screen display, "Insert into Step ↵", and "Copy 📋" actions.

- [ ] **Step 1: Implement `ScientificCalculatorModal.svelte`**
Build responsive modal dialog with:
  - Header: Title, DEG/RAD toggle pill, Close button (`✕`).
  - Screen: Expression input bar and large live result readout.
  - Button matrix:
    - Row 1: `DEG/RAD`, `INV`, `sin`, `cos`, `tan`, `π`
    - Row 2: `ln`, `log`, `√`, `x²`, `xʸ`, `e`
    - Row 3: `(`, `)`, `n!`, `1/x`, `abs`, `÷`
    - Row 4: `7`, `8`, `9`, `⌫`, `AC`, `×`
    - Row 5: `4`, `5`, `6`, `Ans`, `%`, `−`
    - Row 6: `1`, `2`, `3`, `0`, `.`, `+`
    - Action: `=`
  - Footer actions: "Insert into Step ↵" and "Copy 📋".
  - Keyboard listeners: numbers, operators, `Enter` to evaluate, `Escape` to close.

- [ ] **Step 2: Build verification**
Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add src/lib/components/ScientificCalculatorModal.svelte
git commit -m "feat: add scientific calculator modal popup component"
```

---

### Task 3: Floating Action Button (FAB), App Integration & E2E Verification

**Files:**
- Modify: `src/App.svelte`
- Create: `tests/scientific-integration.test.ts`

**Interfaces:**
- Connects FAB in bottom-right corner to open modal.
- Connects modal's `onInsert` callback to paste calculation into active step input.

- [ ] **Step 1: Write integration tests in `tests/scientific-integration.test.ts`**
Verify ad-hoc calculation workflow: calculating $\sqrt{3^2 + 4^2} = 5$ for the Pythagorean theorem, and evaluating trig ratios.

- [ ] **Step 2: Run tests to verify**
Run: `npx vitest run tests/scientific-integration.test.ts`
Expected: PASS

- [ ] **Step 3: Update `src/App.svelte`**
Add the floating action button (`fixed bottom-6 right-6 z-40 btn-3d bg-indigo-600 ... [ 🧮 Scientific Calc ]`).
Render `ScientificCalculatorModal` when open, routing `onInsert` to `activeStepInput` or `formula`.

- [ ] **Step 4: Full test suite and build verification**
Run: `npm test` and `npm run build`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/App.svelte tests/scientific-integration.test.ts
git commit -m "feat: add floating scientific calculator launch button and app integration"
```
