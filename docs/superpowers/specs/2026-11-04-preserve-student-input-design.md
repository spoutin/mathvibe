# Design Document: Preserving Student Input on Alternative Paths

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** Approved / Ready for Plan

---

## 1. Intent and Why
Currently, when a student enters a mathematically equivalent step (e.g., `5 * 9 - -3` instead of the solver's expected `5(9) - (-3)`, or `15 = 3x` instead of `3x = 15`), the `validateStep` engine marks it as correct because it is algebraically equivalent. However, the `StepPlayer.svelte` component immediately replaces the student's typed input with the engine's canonical string representation for that step.

This is frustrating for students because it feels like the application is "correcting" their perfectly valid formatting or term ordering. We want the solver to honor and display exactly what the student typed if it is mathematically correct, while maintaining the solver's underlying step generation for subsequent steps.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Preserve Validated Input:** When a student submits a valid step, the `StepCard` must display the exact string the student typed, rather than the canonical string from `result.steps`.
- **Support Switched Paths:** If a student switches strategies (e.g. going from Distributive to Divide-First), the first step of the new path should also display their exact typed input, while subsequent steps unfold canonically.
- **Skipped-Step Display Rule:** If a student skips ahead (e.g. jumps from Step 1 to Step 3), the student's exact input is displayed on the *target* step (Step 3). The intermediate skipped steps (Steps 1 and 2) will display the engine's canonical strings, since the student did not type them.

### Non-Goals
- Changing the internal canonical step generation in `linear-solver.ts` or `simplify.ts`. (The engine continues to generate its preferred format; we only override the UI display).
- Persisting student overrides across page reloads (the solver is currently a stateless, client-side session app).

### Anti-Goals
- Echoing typos or mathematically incorrect statements. (Only input that passes `validateStep` with a `'correct'` or `'skipped'` status gets preserved).

---

## 3. Architecture & Components

### 3.1 Data Model: `StepPlayer.svelte` State
- Add a new state object to track student overrides for each step index:
  `let studentOverrides = $state<Record<number, string>>({});`
- When `submitCurrentStep` evaluates to `correct`:
  - Save the exact `studentInput` to `studentOverrides[currentStepIndex] = studentInput;`
- When `submitCurrentStep` evaluates to `skipped`:
  - Save the exact `studentInput` to `studentOverrides[validation.matchedStepIndex] = studentInput;`
- Clear `studentOverrides` inside the `$effect` block that resets the player state when `result` changes.

### 3.2 UI Integration: `StepCard.svelte`
- Accept a new optional prop: `userOverride?: string`.
- In the "Confirmed Math Display" section (when `!isWaitingForInput`), render `{userOverride || step.expression}`.
- The explanation `step.action` and `step.rule` remain the canonical engine strings, providing the pedagogical rule regardless of the student's exact formatting.

---

## 4. Testing & Verification
- Verify that valid equivalent inputs (e.g. commutative operations or alternative spacing) are retained in the DOM after submission instead of being rewritten.