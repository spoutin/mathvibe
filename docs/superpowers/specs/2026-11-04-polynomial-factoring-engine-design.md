# Design Document: Grade 9 Polynomial Factoring, FOIL Expansion & Multi-Variable Engine

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** Approved / Ready for Plan

---

## 1. Intent and Why
High school Grade 9 algebra introduces polynomial operations and factoring:
1. Factoring polynomials by Greatest Common Factor (GCF), such as `6x^2y - 4xy^3` ➔ `2xy(3x - 2y^2)`.
2. Combining like terms across arbitrary powers and multiple variables (e.g., `3x^2 + 5x - x^2 + 2x` ➔ `2x^2 + 7x`).
3. Multiplying polynomials and expanding binomials (FOIL), such as `(x + 3)(x + 5)` ➔ `x^2 + 8x + 15`.
4. Factoring simple trinomials ($x^2 + bx + c$) and difference of squares ($x^2 - a^2$).

---

## 2. Core Decisions & Pipeline Specifications

### 2.1 Multi-Variable Monomial & Polynomial Representation
- A `Monomial` stores:
  - `coeff: Fraction`
  - `vars: Record<string, number>` (e.g., `6x^2y` ➔ `coeff: 6, vars: { x: 2, y: 1 }`).
- Monomial signature: sorted canonical representation of variables, e.g. `"x^2y"`.
- Two monomials can only combine if their signatures are identical.

### 2.2 Routing Pipeline in `engine.ts`
1. If input has `=`: Route to `linear-solver.ts`.
2. If input has adjacent brackets e.g. `(x + 2)(x + 3)` or monomial bracket `2x(3x - 5)`: Route to **Polynomial Expansion / FOIL**.
3. If input has uncombined like terms e.g. `3x^2 + 5x - x^2 + 2`: Route to **Polynomial Simplification (Combine Like Terms)**.
4. If input is a factorable polynomial without like terms:
   - Check **Trinomial Factoring** ($x^2 + bx + c$ or $x^2 - a^2$).
   - Check **Common Factoring (GCF)** (e.g. `6x^2y - 4xy^3`).
5. Otherwise, if purely numerical, route to `calculator.ts`.

### 2.3 Step Structure for Factoring
- **GCF Factoring (e.g. `6x^2y - 4xy^3`):**
  - **Step 1 (Find GCF & Division):**
    - Identifies numerical GCF (2) and variable GCF (xy). Total GCF = `2xy`.
    - Shows dividing each term by GCF: `(6x^2y)/(2xy) - (4xy^3)/(2xy)`.
  - **Step 2 (Final Factored Form):**
    - Writes `2xy(3x - 2y^2)`.
    - Pedagogical Rule: *"Common Factoring: Write the GCF outside the bracket and the resulting quotient terms inside."*
- **Trinomial Factoring (e.g. `x^2 + 5x + 6`):**
  - **Step 1 (Product & Sum):** Identifies $p \times q = 6$ and $p + q = 5$ ➔ $2$ and $3$.
  - **Step 2 (Factored Form):** `(x + 2)(x + 3)` (or `(x + 3)(x + 2)`).
- **Difference of Squares (e.g. `x^2 - 16`):**
  - **Step 1:** Identifies $(x)^2 - (4)^2$.
  - **Step 2:** `(x - 4)(x + 4)`.

### 2.4 Factored Form Enforcement in Validator
- When the expected answer is a factored expression (e.g. `2xy(3x - 2y^2)` or `(x + 2)(x + 3)`):
  - The student's input must also be in factored form (i.e. contains parentheses separating factors).
  - The student cannot merely re-type the original un-factored sum `6x^2y - 4xy^3` or `x^2 + 5x + 6`.
  - Factor order is commutative (e.g. `(x + 3)(x + 2)` matches `(x + 2)(x + 3)`).
