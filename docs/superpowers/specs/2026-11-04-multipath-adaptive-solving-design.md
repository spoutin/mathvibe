# Design Document: Multi-Path Adaptive Solving & Strategy Switching

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** Approved / Ready for Plan

---

## 1. Intent and Why
In high school algebra, problems frequently admit more than one valid pedagogical solving sequence:
1. **Equations with assigned variable values ($3x + 7 = 22$ with $x = 5$):**
   - **Path A (Substitution First):** $3(5) + 7 = 22$ ➔ $15 + 7 = 22$ ➔ $22 = 22$ (Verified).
   - **Path B (Algebra First):** $3x = 15$ ➔ $x = 5$ ➔ Concludes: $x = 5$ matches given value.
2. **Equations with distributive brackets ($2(x - 3) = 14$):**
   - **Path A (Distribute First):** $2x - 6 = 14$ ➔ $2x = 20$ ➔ $x = 10$.
   - **Path B (Divide First):** $x - 3 = 7$ ➔ $x = 10$.

This feature enables **Multi-Path Generation and Dynamic Strategy Adaptation**:
- Multiple canonical solution paths are generated for branching problems.
- When a student begins by inputting a step from an alternate valid strategy on Step 1, the step is accepted as **Correct ✅**.
- The solver dynamically pivots to that strategy, updating remaining steps to match the student's chosen path.
- An encouraging strategy badge (e.g., *"🧭 Strategy: Algebra First"*, *"🧭 Strategy: Direct Substitution"*, *"🧭 Strategy: Divide First"*) is displayed in the player header.

---

## 2. Core Decisions & Pipeline Specifications

### 2.1 Branching & Strategy Adoption Timing
- Strategy branching occurs on the initial step (index 0).
- If the student's input matches the initial step of an alternate path in `paths`, the player marks the step correct, sets that path as active, and unfolds the remaining steps for that specific strategy.

### 2.2 Final Step for Algebra-First with Assigned Value
- For $3x + 7 = 22$ with $x = 5$:
  - Step 1: $3x = 15$ (Isolate variable terms).
  - Step 2: $x = 5$ (Final result: variable solved and matches given $x = 5$).
- Both $3(5) + 7 = 22$ and $3x = 15$ validate successfully on Step 1!

### 2.3 Bracketed Equation Alternative Path (Divide First)
- For $a(x + b) = c$:
  - If $c$ is cleanly divisible by $a$ (e.g. $2(x - 3) = 14$ where $14/2 = 7$):
    - **Path 1 (Distributive Property):** $2x - 6 = 14$ ➔ $2x = 20$ ➔ $x = 10$.
    - **Path 2 (Divide Both Sides by 2):** $x - 3 = 7$ ➔ $x = 10$.
  - Both $2x - 6 = 14$ and $x - 3 = 7$ validate successfully on Step 1!

### 2.4 Data Model & UI Extension
- Extend `SolveResult` in `src/lib/types.ts`:
  ```ts
  export interface SolutionPath {
    id: string;
    strategyLabel: string;
    steps: MathStep[];
    finalAnswer: string;
  }

  export interface SolveResult {
    // existing fields...
    paths?: SolutionPath[];
    activePathId?: string;
    strategyLabel?: string;
  }
  ```
- In `StepPlayer.svelte`:
  - Shows strategy badge `[ 🧭 Strategy: <strategyLabel> ]` when paths exist.
  - Passes available paths to validator. When an alternative strategy is chosen on step 1, switches `result.steps` and `strategyLabel` to the selected path.
