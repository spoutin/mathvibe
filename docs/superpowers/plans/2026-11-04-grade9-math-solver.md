# Grade 9 Math Step-by-Step Solver Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vibrant, gamified Grade 9 math step-by-step solver web application in Svelte 5 where students can enter formulas or equations and follow the resolution one step at a time or solve completely with pedagogical explanations.

**Architecture:** Pure client-side reactive Svelte 5 app powered by Vite and Tailwind CSS. A modular TypeScript math engine handles parsing and generates an ordered list of step objects (`math`, `action`, `rule`, `highlight`). The UI provides an interactive step player with progress tracking, tactile controls ("Next Step ▶", "Solve All ⏩"), and celebration effects.

**Tech Stack:** Svelte 5 (with runes: `$state`, `$derived`, `$effect`), TypeScript, Vite, Tailwind CSS, Lucide icons, `canvas-confetti`, Vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-11-04-grade9-math-solver-design.md`

## Global Constraints

- Modern reactive framework: Svelte 5 with runes (`$state`, `$derived`).
- Fast client-side bundling with Vite and TypeScript.
- Tailwind CSS for styling with gamified tactile neo-brutalist buttons (`btn-3d`) and vibrant theme.
- Tests written with Vitest.
- Terminal output and responses must never use LaTeX notation (plain-text arithmetic `*`, `/`, `~`, `=` only).

## Review Focus

1. **Division by zero:** Formula `10 / 0` or equations leading to zero denominator must return friendly error explanations rather than crashing with `Infinity` or `NaN`. (Tested in Task 2 & Task 5).
2. **Equations with No Solution:** Equations like `2x + 1 = 2x + 5` must conclude with a Grade 9 explanation that variable terms cancel to a false statement `1 = 5`, meaning no solution exists. (Tested in Task 4).
3. **Identity equations (Infinitely Many Solutions):** Equations like `3(x + 2) = 3x + 6` must resolve to `6 = 6` with the explanation that all real numbers are solutions. (Tested in Task 4).
4. **Negative coefficients and signs:** Equations like `-x + 4 = 10` and `-3x = 12` must show dividing/multiplying by negative numbers and sign flips clearly. (Tested in Task 4).
5. **Multiple fractional denominators:** Equations like `x/2 + x/3 = 5` must show calculating the Lowest Common Denominator (6) and multiplying every term across both sides. (Tested in Task 4).

---

### Task 1: Project Setup and Test Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `svelte.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.ts`, `src/app.css`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Working Svelte 5 + Vite + Tailwind + Vitest project configuration.

- [ ] **Step 1: Initialize package.json and install dependencies**
Dependencies: `svelte@^5.0.0`, `canvas-confetti`, `@types/canvas-confetti`, `lucide-svelte`.
DevDependencies: `vite`, `@sveltejs/vite-plugin-svelte`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `vitest`.

- [ ] **Step 2: Create configuration files**
Create `vite.config.ts`, `svelte.config.js`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, and `src/app.css` with 3D button utility classes.

- [ ] **Step 3: Write initial sanity test**
In `tests/setup.test.ts`, assert basic environment test passes.

- [ ] **Step 4: Run test to verify test runner works**
Run: `npx vitest run tests/setup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add package.json tsconfig.json vite.config.ts svelte.config.js tailwind.config.js postcss.config.js src/ tests/
git commit -m "chore: scaffold svelte 5 project with vite, tailwind, and vitest"
```

---

### Task 2: Data Models, Exact Fraction Utility, and BEDMAS Calculator Engine

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/math/fraction.ts`
- Create: `src/lib/math/calculator.ts`
- Test: `tests/fraction.test.ts`
- Test: `tests/calculator.test.ts`

**Interfaces:**
- Produces:
  - `MathStep`: `{ stepNumber: number; title: string; expression: string; action: string; rule: string; isFinal?: boolean; }`
  - `SolveResult`: `{ success: boolean; type: 'calculator' | 'simplify' | 'equation'; original: string; steps: MathStep[]; finalAnswer: string; error?: string; }`
  - `Fraction`: Class with `add()`, `sub()`, `mul()`, `div()`, `reduce()`, `toString()`, `fromNumber()`, `parse()`.
  - `solveArithmetic(expr: string): SolveResult`

- [ ] **Step 1: Write failing tests for Fraction and BEDMAS calculator**
In `tests/fraction.test.ts`, test fraction addition `3/4 + 2/5 = 23/20`, reduction `6/8 = 3/4`, division by zero error.
In `tests/calculator.test.ts`, test BEDMAS evaluation with steps: `(12 - 4) * 3 + 2^3`, `3/4 + 1/2`, division by zero handling `8 / 0`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/fraction.test.ts tests/calculator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `Fraction` and `solveArithmetic`**
In `src/lib/math/fraction.ts`, implement GCD, arithmetic operations, and parsing.
In `src/lib/math/calculator.ts`, implement tokenizer, AST/precedence parser, and step recorder tracking Grade 9 BEDMAS rules (Brackets, Exponents, Division & Multiplication, Addition & Subtraction).

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/fraction.test.ts tests/calculator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/types.ts src/lib/math/ tests/
git commit -m "feat: add Fraction utility and BEDMAS calculator engine with steps"
```

---

### Task 3: Expression Simplifier (Distributive Property & Like Terms)

**Files:**
- Create: `src/lib/math/simplify.ts`
- Test: `tests/simplify.test.ts`

**Interfaces:**
- Consumes: `Fraction`, `MathStep`, `SolveResult` from Task 2.
- Produces: `simplifyExpression(expr: string): SolveResult`

- [ ] **Step 1: Write failing tests for expression simplifier**
In `tests/simplify.test.ts`, test:
  1. Distributive property: `3(2x - 4)` -> steps showing `3 * 2x - 3 * 4` -> `6x - 12`.
  2. Combining like terms: `4x + 7 + 2x - 3` -> steps grouping `(4x + 2x) + (7 - 3)` -> `6x + 4`.
  3. Combined multi-step: `2(3x + 4) - 5x + 7` -> expand brackets step, then combine like terms step.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/simplify.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `simplifyExpression` in `src/lib/math/simplify.ts`**
Parse linear polynomial terms `a*x + b`, expand parentheses via distributive multiplier, record step with Grade 9 rule ("Distributive Property: Multiply each term inside the bracket"), group like terms, and add coefficients.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/simplify.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/simplify.ts tests/simplify.test.ts
git commit -m "feat: add expression simplifier with distributive and like-terms steps"
```

---

### Task 4: Grade 9 Linear Equation Solver

**Files:**
- Create: `src/lib/math/linear-solver.ts`
- Test: `tests/linear-solver.test.ts`

**Interfaces:**
- Consumes: `Fraction`, `MathStep`, `SolveResult` from Task 2.
- Produces: `solveLinearEquation(eqStr: string): SolveResult`

- [ ] **Step 1: Write failing tests for linear equation solving**
In `tests/linear-solver.test.ts`, test:
  1. Two-step: `3x + 7 = 22` -> subtract 7 -> divide by 3 -> `x = 5`.
  2. Variables on both sides: `4x - 8 = 2x + 10` -> isolate variable on LHS -> isolate constant on RHS -> divide.
  3. Parentheses on sides: `2(x - 3) = 14`.
  4. Clearing fractions (LCD): `x/2 + x/3 = 5` -> multiply both sides by 6 -> `3x + 2x = 30` -> `5x = 30` -> `x = 6`.
  5. Negative variable/division: `-x + 4 = 10` and `-3x = 12`.
  6. No solution: `2x + 1 = 2x + 5`.
  7. Infinitely many solutions: `3x + 6 = 3(x + 2)`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/linear-solver.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `solveLinearEquation` in `src/lib/math/linear-solver.ts`**
Pipeline:
  1. Detect equals sign `=`.
  2. Detect fractional denominators, calculate LCD, multiply both sides with Grade 9 rule ("Clear fractions by multiplying all terms by LCD").
  3. Expand parentheses using distributive property on LHS/RHS.
  4. Collect like terms on LHS and RHS.
  5. Move variable terms to one side via inverse addition/subtraction.
  6. Move constant terms to the opposite side.
  7. Check for identity (`0 = 0`) or contradiction (`0 = c`).
  8. Divide by coefficient of `x`, recording final answer and Grade 9 verification tip.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/linear-solver.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/linear-solver.ts tests/linear-solver.test.ts
git commit -m "feat: add linear equation solver with fractions, parentheses, and step rules"
```

---

### Task 5: Unified Math Engine Entrypoint & Problem Router

**Files:**
- Create: `src/lib/math/engine.ts`
- Test: `tests/engine.test.ts`

**Interfaces:**
- Consumes: `solveArithmetic`, `simplifyExpression`, `solveLinearEquation`.
- Produces: `solveGrade9Math(input: string): SolveResult`

- [ ] **Step 1: Write failing tests for unified solver entrypoint**
In `tests/engine.test.ts`:
  1. Detects equation (has `=`) -> calls `solveLinearEquation`.
  2. Detects expression with variable `x` without `=` -> calls `simplifyExpression`.
  3. Detects purely numerical arithmetic -> calls `solveArithmetic`.
  4. Handles empty string or syntax errors gracefully with user-friendly error step.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/engine.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `solveGrade9Math` in `src/lib/math/engine.ts`**
Sanitize input (standardize `*`, `×`, `÷`, `/`, spaces), detect mode, call appropriate sub-engine, and format final response.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/engine.ts tests/engine.test.ts
git commit -m "feat: add unified math engine entry point and problem router"
```

---

### Task 6: UI Components — Input Station, Math Keypad, and Presets Library

**Files:**
- Create: `src/lib/components/Keypad.svelte`
- Create: `src/lib/components/Presets.svelte`
- Create: `src/lib/presets-data.ts`
- Modify: `src/App.svelte`

**Interfaces:**
- Produces:
  - `Keypad`: emits character insertions (`+`, `-`, `*`, `/`, `^`, `(`, `)`, `x`), `clear`, `backspace`.
  - `Presets`: categorized list of sample Grade 9 problems (Linear Equations, Expressions, Fractions).
  - Formula input field with responsive layout, tactile buttons, and Execute action.

- [ ] **Step 1: Define Grade 9 presets data**
In `src/lib/presets-data.ts`, define preset problems categorized into "Linear Equations", "Simplifying", "Fractions & BEDMAS".

- [ ] **Step 2: Implement Keypad component**
In `src/lib/components/Keypad.svelte`, create tactile buttons with `btn-3d` styling for math symbols and editing actions.

- [ ] **Step 3: Implement Presets component**
In `src/lib/components/Presets.svelte`, render topic pill tabs and problem badges that populate the input when clicked.

- [ ] **Step 4: Manual/Build verification**
Run: `npm run build` to verify Svelte components compile cleanly.

- [ ] **Step 5: Commit**
```bash
git add src/lib/presets-data.ts src/lib/components/Keypad.svelte src/lib/components/Presets.svelte
git commit -m "feat: add math keypad and grade 9 presets library components"
```

---

### Task 7: UI Components — Step Card, Step Player, and Celebration Effects

**Files:**
- Create: `src/lib/components/StepCard.svelte`
- Create: `src/lib/components/StepPlayer.svelte`
- Create: `src/lib/confetti.ts`

**Interfaces:**
- Produces:
  - `StepCard`: displays step number, title, math line with highlighted changes, and Grade 9 curriculum rule badge.
  - `StepPlayer`: holds current step index `$state`, provides "Next Step ▶", "Solve All ⏩", and "Reset 🔄" controls, animated progress bar, and final victory card.
  - `fireConfetti()`: triggers cheerful celebratory confetti bursts via `canvas-confetti`.

- [ ] **Step 1: Implement celebratory confetti helper**
In `src/lib/confetti.ts`, wrap `canvas-confetti` with vibrant colors and school celebration flair.

- [ ] **Step 2: Implement `StepCard.svelte`**
Render card with step counter pill, friendly rule icon (💡), formatted math expression, and transition animation.

- [ ] **Step 3: Implement `StepPlayer.svelte`**
Use Svelte 5 runes (`$state(0)` for current step index, `$derived` for visible steps and progress percentage).
Implement "Next Step ▶" (advances index by 1), "Solve All ⏩" (sets index to `steps.length`), and "Reset 🔄".
Trigger `fireConfetti()` when reaching the final step.

- [ ] **Step 4: Build verification**
Run: `npm run build`
Expected: Build passes with no errors.

- [ ] **Step 5: Commit**
```bash
git add src/lib/confetti.ts src/lib/components/StepCard.svelte src/lib/components/StepPlayer.svelte
git commit -m "feat: add step card, step player with runes, and confetti effects"
```

---

### Task 8: App Integration, Polish, and End-to-End Verification

**Files:**
- Modify: `src/App.svelte`
- Modify: `src/app.css`
- Modify: `index.html`
- Create: `tests/integration.test.ts`

**Interfaces:**
- Assembles all components into the full single-page application.

- [ ] **Step 1: Write integration tests verifying end-to-end math solving workflows**
In `tests/integration.test.ts`, test multi-step equations (`3x + 7 = 22`, `4(x - 2) = 2x + 10`, `x/2 + x/3 = 5`, `2(3x + 4) - 5x`) through the engine and verify step count, step rules, and final answers.

- [ ] **Step 2: Run tests to verify**
Run: `npx vitest run tests/integration.test.ts`
Expected: PASS

- [ ] **Step 3: Assemble full UI in `src/App.svelte`**
Add engaging header ("⚡ Grade 9 Math Quest / Step-by-Step Solver"), formula bar with instant feedback, keypad toggle, preset drawer, and StepPlayer.

- [ ] **Step 4: Final verification and build**
Run: `npm run build` and `npm test`
Expected: All tests pass and production build outputs to `dist/`.

- [ ] **Step 5: Commit**
```bash
git add src/App.svelte src/app.css index.html tests/integration.test.ts
git commit -m "feat: complete grade 9 math solver app integration and styling"
```
