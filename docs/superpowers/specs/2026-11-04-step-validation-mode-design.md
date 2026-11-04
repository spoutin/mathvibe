# Design Document: Interactive Step Validation & Practice Mode

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** In Review / Ready for Plan

---

## 1. Intent and Why
Currently, the Grade 9 Math Solver generates step-by-step solutions for students to read. To deepen student mastery and actively engage them in learning, the solver is shifting to an interactive **student-solved mode**. Students enter what they believe the next mathematical step should be. The engine validates their response in real time, encouraging active problem-solving while providing hints, reveal options, and intelligent detection if a student skipped ahead.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Always Student-Led by Default:** Every active step prompts the student to enter their next expression/equation.
- **Immediate Validation Feedback:**
  - *Correct:* Celebratory feedback, unlocks the step explanation and curriculum rule, advances to next step.
  - *Incorrect:* Friendly, encouraging feedback (e.g., *"Not quite! Check your signs or like terms and try again"*), keeping the prompt active.
- **Skipped-Step Intelligence:** If a student combines steps or does mental math and inputs an answer that matches a *subsequent* step in the solution chain:
  - Accept the response as valid.
  - Advance the player directly to that step.
  - Display an informative callout highlighting the intermediate step(s) that were bypassed (e.g., *"Great mental math! You jumped ahead. Notice the step in between: 4x - 8 = 2x + 10"*).
- **Escape Hatches & Scaffolding:**
  - **"💡 Hint" button:** Reveals the pedagogical clue/rule without giving away the mathematical expression.
  - **"👁️ Reveal Step" button:** Displays the current step's expression and explanation, advancing them so they never get trapped.
  - **"⏩ Solve All" button:** Solves the remaining steps.
- **Mathematical Equivalence Checker:**
  - Whitespace-insensitive (e.g. `2x+3=11` matches `2x + 3 = 11`).
  - Commutative order on terms (e.g. `3 + 2x = 11` matches `2x + 3 = 11`).
  - Symmetrical equation equality (e.g. `11 = 2x + 3` matches `2x + 3 = 11`).
  - Symmetrical variable isolation (e.g. `5 = x` matches `x = 5`).
  - Fraction simplification equivalence (e.g. `2/4` matches `1/2`).

### Non-Goals
- Multiple-choice quizzes (focus is typing/constructing the actual algebra line).
- Complex multi-branch alternative solution trees (we check against the canonical Grade 9 sequence and its standard equivalents).

### Anti-Goals
- Punitive red error messages that discourage students.
- Rigid string-only matching that rejects mathematically correct answers due to minor formatting (e.g. rejection because of a space or term order).
- Dead ends where a student who doesn't know the answer cannot proceed.

---

## 3. Architecture & Technical Design

### 3.1 Equivalence Checker Engine (`src/lib/math/validator.ts`)
A dedicated validation module that compares a student's `userInput` against the target `expected` step (and all subsequent steps in `allSteps`):

```ts
export interface ValidationResult {
  status: 'correct' | 'incorrect' | 'skipped';
  matchedStepIndex?: number;
  skippedSteps?: MathStep[];
  message: string;
}

export function validateStep(
  userInput: string,
  currentIndex: number,
  allSteps: MathStep[]
): ValidationResult;
```

**Equivalence Rules:**
1. Clean both strings (remove excess whitespace, standardize `*`, `×`, `·`, `/`, `÷`).
2. Exact cleaned string match: returns `'correct'`.
3. If input has `=`:
   - Split into LHS and RHS.
   - Symmetrical check: `LHS = RHS` vs `RHS = LHS`.
   - Polynomial canonicalization: using `parseTerms`, compare canonical polynomial forms of LHS and RHS (handles term reordering like `3 + 2x` vs `2x + 3`).
4. If purely arithmetic or non-equation expression:
   - Compare canonical terms using `parseTerms`.
5. **Skipped-Step Lookahead:**
   - If not matching `allSteps[currentIndex]`, check against `allSteps[k]` for `k > currentIndex`.
   - If match found at index `k`: return `{ status: 'skipped', matchedStepIndex: k, skippedSteps: allSteps.slice(currentIndex, k) }`.

### 3.2 UI Integration (`StepPlayer.svelte` and `StepCard.svelte`)
- The active step displays an interactive input box:
  - Input field with keyboard and math keypad integration.
  - Buttons: **"Check Step ✅"**, **"Hint 💡"**, **"Reveal Step 👁️"**.
- Hint card reveals when Hint is toggled.
- When an answer is submitted:
  - If `'correct'`: triggers micro-celebration, marks step complete, focuses next step.
  - If `'skipped'`: displays the yellow/amber "Step Skipped" notice with the missed step expressions, advances to the matched step.
  - If `'incorrect'`: displays friendly shake/notice: *"Try again! Need a clue? Click Hint 💡"*.

---

## 4. Decisions & Calls
- **Always Student-Led:** As requested by the user, the solver enters student practice mode automatically upon executing a problem.
- **Scaffolding:** Hint and Reveal Step ensure zero frustration or blockages.
- **Keypad Support:** The on-screen math keypad can insert characters directly into the active step input.
