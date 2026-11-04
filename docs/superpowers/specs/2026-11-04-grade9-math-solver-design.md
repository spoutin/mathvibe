# Design Document: Grade 9 Math Step-by-Step Solver

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** In Review / Ready for Plan

---

## 1. Intent and Why
High school Grade 9 math is a critical transition year where students move from basic arithmetic to abstract algebraic thinking (linear equations, distributive property, fraction operations, collecting like terms, and multi-step problem solving). Traditional calculators give only a final number, leaving students confused about intermediate steps, while online algebra tools are often sterile, clinical, or overly complex.

This project delivers an engaging, interactive, and gamified web application that solves Grade 9 math formulas and expressions while providing transparent, step-by-step pedagogical explanations following standard Grade 9 curriculum rules.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Interactive Step Player:** Users can execute a formula and either step forward one step at a time ("Next Step ▶") or reveal the entire step sequence to the final answer ("Solve All ⏩").
- **Grade 9 Curriculum Alignment:** Every step clearly highlights the algebraic transformation and the pedagogical rule applied (e.g., *"Inverse operations: subtract 7 from both sides"*, *"Distributive property: multiply 2 into the parentheses"*, *"Find a common denominator"*).
- **Core Grade 9 Capabilities:**
  1. *Arithmetic / Calculator:* Order of operations (BEDMAS/PEMDAS) with integers, decimals, and fractions.
  2. *Fraction Operations:* Addition, subtraction, multiplication, division, and reducing to lowest terms.
  3. *Expression Simplification:* Expanding brackets and collecting like terms (e.g., `3(2x - 4) + 5x`).
  4. *Linear Equation Solving:* Single-variable linear equations (`ax + b = cx + d`, with parentheses and clearing denominators).
- **Gamified & Vibrant Aesthetic:** Duolingo / Brilliant-inspired visual design with playful 3D tactile buttons, cheerful colors, progress bars, achievement-style badges, and confetti celebrations upon completion.
- **Accessible Dual-Input:** Support both physical keyboard typing and a quick on-screen math helper keypad (fractions, exponents, variables, operators) plus curated Grade 9 practice presets.

### Non-Goals
- Multi-variable systems of equations (Grade 10).
- Trigonometric functions or calculus.
- Graphing Cartesian planes (the focus is formula stepping and algebraic resolution).
- User authentication, database storage, or accounts (runs entirely client-side).

### Anti-Goals
- Dry, sterile, or monochrome calculator interfaces that bore students.
- Jumping steps or skipping intermediate algebraic work (e.g., combining 3 operations into 1 without explanation).
- Opaque or cryptic syntax error messages.

---

## 3. Technology Stack & Architecture

- **Reactive Framework:** Svelte 5 (utilizing latest Svelte runes: `$state`, `$derived`, `$effect`) for fine-grained reactivity, snappy state transitions, and minimal runtime overhead.
- **Build Tool:** Vite.
- **Styling:** Tailwind CSS with custom playful UI utilities (tactile button shadows, badges, cards).
- **Icons & Delight:** Lucide Svelte / SVG icons, `canvas-confetti` for celebratory effects.
- **Math Engine:** Custom lightweight, rule-based Grade 9 AST parser and step-solver written in TypeScript.
  - Keeps intermediate steps strictly tied to curriculum rules.
  - Zero external heavy algebra servers required; runs completely client-side in browser.

---

## 4. User Experience & Flow

### 4.1 Input Station
- Prominent input field with responsive layout.
- Quick topic presets categorized into:
  - *Linear Equations:* e.g., `3x + 7 = 22`, `4(x - 2) = 2x + 10`, `(x + 3)/2 = 5`
  - *Simplifying Expressions:* e.g., `3(2x + 4) - 5x + 7`, `4x + 3 - 2x + 8`
  - *Fractions & BEDMAS:* e.g., `3/4 + 2/5`, `(12 - 4) * 3 + 2^3`
- Math quick-toolbar buttons: `+`, `-`, `*`, `/`, `^`, `( )`, `x`, `Clear`, `Backspace`.
- Primary action: **"Execute / Start Solving 🚀"** button.

### 4.2 Interactive Step Player
Upon clicking Execute, the solver transitions into the player view:
- **Stepper Status Header:** Displays the target problem, the current step number (e.g., *"Step 2 of 4"*), and an animated progress bar.
- **Control Bar:**
  - **"Next Step ▶"** (Primary): Unfurls the next step card with a smooth slide-in animation.
  - **"Solve All ⏩"** (Secondary): Immediately expands all remaining steps down to the final result.
  - **"Reset / New Formula 🔄"**: Resets back to step 0 or allows entering a new equation.
- **Step Cards:**
  - *Header:* Step number + concise action (e.g., *"Step 1: Apply Distributive Property"*).
  - *Explanation callout:* Clear Grade 9 rationale (e.g., *"Multiply each term inside parentheses by 3"*).
  - *Visual Math Display:* Transformed equation rendered clearly with modified terms highlighted.
- **Final Result Card:**
  - When the final step is reached, an emerald celebratory card is displayed with the answer highlighted (`x = 5`), confetti fires, and a *"Problem Solved! ⭐"* badge appears.

---

## 5. Math Step Engine Specifications

### 5.1 Linear Equation Solver Pipeline
For an equation `Left = Right`:
1. **Fraction Clearing (if present):** Find LCD of any denominators; multiply both sides by LCD.
2. **Distributive Expansion:** Expand terms like `a(bx + c)` on either side into `ab*x + ac`.
3. **Combine Like Terms on Each Side:** Group variable terms and constant terms separately on LHS and RHS.
4. **Isolate Variable Terms:** Add or subtract variable terms so variables are only on one side (e.g., subtract `cx` from both sides).
5. **Isolate Constant Terms:** Add or subtract constants so numbers are on the opposite side (e.g., subtract `b` from both sides).
6. **Division / Coefficient Normalization:** Divide both sides by the variable coefficient `a` to reach `x = N`.
7. **Fraction Reduction:** If `N` is fractional, simplify to lowest terms or integer.

### 5.2 Expression Simplification Pipeline
1. Expand any parentheses using distributive multiplication.
2. Group like variable terms (e.g., `ax + bx`) and constant terms (`c + d`).
3. Compute combined coefficients step by step with explanations.

### 5.3 Calculator / BEDMAS Pipeline
1. Evaluate innermost brackets/parentheses.
2. Evaluate exponents.
3. Evaluate multiplication and division left-to-right (preserving exact fractions where appropriate).
4. Evaluate addition and subtraction left-to-right.

---

## 6. Edge Cases & Robustness
- **Invalid Syntax:** Show friendly contextual guidance (e.g., *"Looks like a closing bracket is missing. Did you mean 2(x + 3)?"*).
- **No Solution / Identity Equations:** Handle cases like `2x + 4 = 2x + 5` (No solution / parallel lines) or `2x + 4 = 2x + 4` (Infinitely many solutions) with clear explanations.
- **Zero Division:** Gracefully explain why division by zero is undefined.

---

## 7. Decisions Made & Builder Calls

### Decided by User:
- Ability to insert/add formulas and click execute.
- Step-by-step resolution with option to step one by one ("Next Step") or jump to end result ("Solve All").
- Steps must strictly adhere to Grade 9 math guidelines.
- Engaging, attractive design that keeps students interested.
- Scope covers fractions, algebra, simplifying equations, and standard calculator functions.
- Visual style: Vibrant & Gamified (Option A).
- Reactive framework: Svelte 5 (with runes and Vite).

### Builder's Calls (Recorded as sensible defaults):
- Preset library included for instant testing of all Grade 9 categories.
- On-screen math symbol keypad included alongside standard keyboard input.
- Confetti celebration using `canvas-confetti`.
- Client-side TypeScript rule-based solver engine to guarantee instant response and reliable offline functionality.
