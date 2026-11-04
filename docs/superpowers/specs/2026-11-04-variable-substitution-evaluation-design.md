# Design Document: Variable Value Assignment & Substitution Evaluation

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** Approved / Ready for Plan

---

## 1. Intent and Why
A fundamental Grade 9 algebra skill is evaluating algebraic expressions and formulas given specific values for variables (e.g., evaluating $2x^2 - 3y + 5$ when $x = 4$ and $y = -2$, or evaluating a formula like $y = 3x - 4$ when $x = 5$). Students frequently make errors with negative signs and order of operations during substitution.

This feature adds automatic variable detection to the input station, offering numerical value input chips (`x = [ ]`, `y = [ ]`). When variable values are provided, the solver generates transparent, step-by-step substitution and BEDMAS calculations.

---

## 2. Core Decisions & Pipeline Specifications

### 2.1 Complete vs Partial Variable Assignment
- **Complete Assignment:** When values are provided for all detected variables, the expression evaluates to a single numerical value via BEDMAS steps.
- **Partial Assignment:** When only a subset of variables are assigned (e.g. $x = 4$ in $3x + 2y$), the engine substitutes $x$ ($3(4) + 2y$), performs the numerical multiplication ($12 + 2y$), and returns the simplified algebraic expression ($2y + 12$).

### 2.2 Handling Equations with `=`
- **Formulas (One Dependent Variable Unassigned):**
  - Example: $y = 2x^2 + 5$ with $x = 3$.
  - Evaluates the right-hand side step by step: $y = 2(3)^2 + 5$ ➔ $y = 2(9) + 5$ ➔ $y = 18 + 5$ ➔ $y = 23$.
- **Verification (All Variables in Equation Assigned):**
  - Example: $3x + 7 = 22$ with $x = 5$.
  - Evaluates left side: $3(5) + 7 = 15 + 7 = 22$.
  - Concludes: $22 = 22$ (Verified: Left Side = Right Side).

### 2.3 Step 1 Substitution Formatting
- **Parentheses Rule:** Every substituted value is wrapped in parentheses `(val)` so signs and powers are preserved accurately:
  - Example: $x^2$ with $x = -3$ becomes $(-3)^2 = 9$.
  - Tutor Hint: *"Substitution: Wrap each number in parentheses when replacing variables so negative signs and powers stay organized."*

### 2.4 Presets & Practice Mode
- Add optional `variables?: Record<string, string>` to `PresetProblem` in `types.ts` and add sample problems in `presets-data.ts`.
- In Practice Mode, regular skipping rules apply: if a student mentally substitutes and enters the simplified line directly, the skipped-step detector accepts it and highlights the substitution line.
