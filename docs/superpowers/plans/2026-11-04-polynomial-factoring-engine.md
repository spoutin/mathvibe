# Polynomial Factoring, FOIL Expansion & Multi-Variable Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement generalized multi-variable polynomial representation, Greatest Common Factor (GCF) factoring (e.g., `6x^2y - 4xy^3` ➔ `2xy(3x - 2y^2)`), FOIL binomial expansion, and simple trinomial factoring with Grade 9 step-by-step explanations.

**Architecture:** A robust `Polynomial` and `Monomial` module (`src/lib/math/polynomial.ts`) representing arbitrary variable powers and coefficients, combined with a factoring and expansion engine (`src/lib/math/factoring.ts`). Integrated into `engine.ts` and `validator.ts` for real-time practice validation.

**Tech Stack:** TypeScript, Svelte 5, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-polynomial-factoring-engine-design.md`

## Global Constraints

- Svelte 5 with runes.
- Fully client-side; zero external algebra servers.
- No LaTeX formatting in terminal output (standard plain-text arithmetic `*`, `/`, `^`, `=` only).
- Verified with Vitest tests.

## Review Focus

1. **Exact User Problem:** `6x^2y - 4xy^3` must resolve to GCF `2xy` and final factored form `2xy(3x - 2y^2)`. (Tested in Task 1).
2. **Multi-Variable Unlike Terms Preservation:** `6x^2y - 4xy^3` must NOT combine into `2x`. (Tested in Task 1).
3. **Higher-Degree Like-Terms Combining:** `3x^2 + 5x - x^2 + 2x` must combine to `2x^2 + 7x`. (Tested in Task 1).
4. **FOIL Expansion:** `(x + 3)(x + 5)` must expand to `x^2 + 8x + 15` with intermediate FOIL step. (Tested in Task 2).
5. **Trinomial & Difference of Squares Factoring:** `x^2 + 5x + 6` ➔ `(x + 2)(x + 3)` and `x^2 - 16` ➔ `(x - 4)(x + 4)`. (Tested in Task 2).

---

### Task 1: Generalized Monomial, Polynomial, and GCF Factoring Engine

**Files:**
- Create: `src/lib/math/polynomial.ts`
- Test: `tests/polynomial.test.ts`

**Interfaces:**
- Produces:
  - `Monomial`: `{ coeff: Fraction; vars: Record<string, number>; signature: string; }`
  - `Polynomial`: Class with `parse(str)`, `format()`, `combineLikeTerms()`, `factorGCF()`.
  - `factorPolynomialGCF(expr: string): SolveResult`

- [ ] **Step 1: Write failing tests for polynomial parsing and GCF factoring**
In `tests/polynomial.test.ts`, test:
  1. Parsing `6x^2y` and `-4xy^3` into correct powers and coefficients.
  2. Combining like terms across powers: `3x^2 + 5x - x^2 + 2x` ➔ `2x^2 + 7x`.
  3. GCF Factoring on `6x^2y - 4xy^3` ➔ produces steps with GCF = `2xy` and final answer `2xy(3x - 2y^2)`.
  4. GCF Factoring on trinomial: `3x^3 + 6x^2 - 9x` ➔ `3x(x^2 + 2x - 3)`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/polynomial.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `Polynomial` and `factorPolynomialGCF` in `src/lib/math/polynomial.ts`**
Parse arbitrary variables and powers `([a-zA-Z](\^\d+)?)`, compute variable GCD (minimum exponent across all terms), compute integer GCD of coefficients, divide each term, and generate Grade 9 step cards.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/polynomial.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/polynomial.ts tests/polynomial.test.ts
git commit -m "feat: add multi-variable polynomial engine and GCF factoring"
```

---

### Task 2: Binomial FOIL Expansion & Trinomial Factoring

**Files:**
- Create: `src/lib/math/factoring.ts`
- Test: `tests/factoring.test.ts`

**Interfaces:**
- Consumes: `Polynomial`, `Monomial`, `Fraction` from Task 1.
- Produces:
  - `expandPolynomial(expr: string): SolveResult`
  - `factorTrinomial(expr: string): SolveResult`

- [ ] **Step 1: Write failing tests for FOIL and trinomial factoring**
In `tests/factoring.test.ts`, test:
  1. FOIL binomial expansion: `(x + 3)(x + 5)` ➔ `x^2 + 8x + 15`.
  2. Monomial times polynomial: `2x(3x - 5)` ➔ `6x^2 - 10x`.
  3. Simple trinomial factoring: `x^2 + 5x + 6` ➔ `(x + 2)(x + 3)` (Product/Sum method).
  4. Difference of squares: `x^2 - 16` ➔ `(x - 4)(x + 4)`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/factoring.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `expandPolynomial` and `factorTrinomial` in `src/lib/math/factoring.ts`**
Implement FOIL distribution, like-term collection, Product/Sum integer search for factors of $c$ that sum to $b$, and square root checks for difference of squares.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/factoring.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/factoring.ts tests/factoring.test.ts
git commit -m "feat: add FOIL polynomial expansion and trinomial factoring"
```

---

### Task 3: Unified Engine Routing, Validator Update & Presets

**Files:**
- Modify: `src/lib/math/engine.ts`
- Modify: `src/lib/math/validator.ts`
- Modify: `src/lib/presets-data.ts`
- Create: `tests/polynomial-integration.test.ts`

**Interfaces:**
- Routes `6x^2y - 4xy^3` directly to GCF factoring in `engine.ts`.
- Updates `validator.ts` to recognize factored and expanded polynomial forms.
- Adds new presets to `GRADE_9_PRESETS`.

- [ ] **Step 1: Write integration tests in `tests/polynomial-integration.test.ts`**
Verify `solveGrade9Math('6x^2y - 4xy^3')` returns GCF factoring with `2xy(3x - 2y^2)`.
Verify student validation of `2xy(3x - 2y^2)` succeeds.
Verify FOIL and trinomial routing through `solveGrade9Math`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/polynomial-integration.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `src/lib/math/engine.ts`, `src/lib/math/validator.ts`, and `src/lib/presets-data.ts`**
Route expressions to expansion, like-term collection, or factoring; support factored product equivalence in validator; add Factoring presets.

- [ ] **Step 4: Run full test suite and build**
Run: `npm test` and `npm run build`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/engine.ts src/lib/math/validator.ts src/lib/presets-data.ts tests/polynomial-integration.test.ts
git commit -m "feat: integrate polynomial factoring into unified engine and practice validator"
```
