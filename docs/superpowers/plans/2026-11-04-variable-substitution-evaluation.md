# Variable Value Assignment & Substitution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow students to assign values to detected variables (e.g., $x = 4, y = -2$), automatically detecting letters in the formula and generating step-by-step substitution and BEDMAS evaluations.

**Architecture:** A dedicated substitution engine (`src/lib/math/substitution.ts`) that handles full numerical evaluation, partial algebraic substitution, formula evaluation ($y = mx + b$), and equation verification ($LS = RS$). The UI detects unique letters in `App.svelte` and displays interactive variable chips under the input bar.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`), TypeScript, Vite, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-variable-substitution-evaluation-design.md`

## Global Constraints

- Svelte 5 with runes.
- Fully client-side; zero external APIs.
- Standard plain-text arithmetic in terminal/CLI (no LaTeX notation).
- Tests written with Vitest.

## Review Focus

1. **Negative Number Parenthesization:** Negative values must be wrapped in parentheses (e.g., $x^2$ with $x = -3$ becomes $(-3)^2 = 9$, not $-3^2 = -9$). (Tested in Task 1).
2. **Partial Variable Assignment:** In $3x + 2y$ with only $x = 4$ supplied, the engine evaluates $3(4) + 2y$ to $2y + 12$. (Tested in Task 1).
3. **Formula Evaluation ($y = f(x)$):** Given $y = 2x^2 + 5$ with $x = 3$, it computes $y = 23$. (Tested in Task 1).
4. **Equation Verification ($LS = RS$):** Given $3x + 7 = 22$ with $x = 5$, it concludes with a verified balance card ($22 = 22$). (Tested in Task 1).
5. **Practice Mode Validation:** Step 1 validates the student's typed substitution line $2(4)^2 - 3(-2) + 5$ before progressing to arithmetic. (Tested in Task 3).

---

### Task 1: Variable Substitution Evaluation Engine

**Files:**
- Create: `src/lib/math/substitution.ts`
- Test: `tests/substitution.test.ts`

**Interfaces:**
- Produces:
  - `evaluateSubstitution(rawInput: string, variableValues: Record<string, string>): SolveResult`

- [ ] **Step 1: Write failing tests for substitution engine**
In `tests/substitution.test.ts`, test:
  1. Full numerical evaluation: $2x^2 - 3y + 5$ with $x = 4, y = -2$ ➔ Step 1 $2(4)^2 - 3(-2) + 5$ ➔ final answer `43`.
  2. Negative powers: $x^2$ with $x = -3$ ➔ $(-3)^2$ ➔ `9`.
  3. Fraction substitution: $4x + 6$ with $x = 1/2$ ➔ `8`.
  4. Partial assignment: $3x + 2y$ with $x = 4$ ➔ `2y + 12`.
  5. Formula evaluation: $y = 3x - 4$ with $x = 5$ ➔ `y = 11`.
  6. Equation verification: $3x + 7 = 22$ with $x = 5$ ➔ `22 = 22` (Verified).

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/substitution.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `evaluateSubstitution` in `src/lib/math/substitution.ts`**
Parse variable tokens, substitute values wrapped in parentheses, handle equations ($=$) and partial remaining variables, and chain into `solveArithmetic` or `simplifyExpression`.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/substitution.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/substitution.ts tests/substitution.test.ts
git commit -m "feat: add variable substitution and formula evaluation engine"
```

---

### Task 2: Automatic Variable Detection & UI Variable Chips

**Files:**
- Create: `src/lib/components/VariableInputs.svelte`
- Modify: `src/lib/math/engine.ts`
- Modify: `src/App.svelte`

**Interfaces:**
- Consumes: `evaluateSubstitution` from Task 1.
- Produces:
  - `VariableInputs.svelte`: automatic variable chips (`x = [ ]`, `y = [ ]`) displayed under the formula bar.
  - Passes non-empty `variableValues` to `solveGrade9Math(formula, variableValues)`.

- [ ] **Step 1: Implement `VariableInputs.svelte`**
Component takes `variables: string[]`, `values: Record<string, string>`, `onChange`, and `onClear`. Renders responsive chips with clear buttons.

- [ ] **Step 2: Update `src/lib/math/engine.ts`**
Accept optional `variableValues?: Record<string, string>` parameter; if any variable values are provided, delegate to `evaluateSubstitution`.

- [ ] **Step 3: Update `src/App.svelte`**
Derive `detectedVariables` from `formula`, render `VariableInputs`, and pass `variableValues` to `solveGrade9Math`.

- [ ] **Step 4: Build verification**
Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/components/VariableInputs.svelte src/lib/math/engine.ts src/App.svelte
git commit -m "feat: add automatic variable detection and UI variable input chips"
```

---

### Task 3: Presets, Step Validator Update & E2E Integration

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/presets-data.ts`
- Modify: `src/lib/components/Presets.svelte`
- Modify: `src/lib/math/validator.ts`
- Create: `tests/substitution-integration.test.ts`

**Interfaces:**
- Presets support default variable values.
- Practice mode validates student substitution lines.

- [ ] **Step 1: Write integration tests in `tests/substitution-integration.test.ts`**
Verify full workflow: detecting variables, solving with values, validating student substitution input $2(4)^2 - 3(-2) + 5$, and loading substitution presets.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/substitution-integration.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `types.ts`, `presets-data.ts`, `Presets.svelte`, and `validator.ts`**
Add `variables?: Record<string, string>` to `PresetProblem`; add "Evaluating Expressions" presets; update validator to accept equivalent substitution expressions.

- [ ] **Step 4: Run full test suite and build verification**
Run: `npm test` and `npm run build`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/lib/types.ts src/lib/presets-data.ts src/lib/components/Presets.svelte src/lib/math/validator.ts tests/substitution-integration.test.ts
git commit -m "feat: add variable substitution presets and practice validation integration"
```
