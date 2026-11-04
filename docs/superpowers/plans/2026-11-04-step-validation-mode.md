# Interactive Step Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the solver into a student-led practice experience where students type each step's answer to validate it, receive feedback, access hints or reveal steps, and get notified if they skip intermediate steps.

**Architecture:** Pure client-side validation using an algebraic equivalence engine (`src/lib/math/validator.ts`) that canonicalizes student inputs against current and future step expressions. The UI updates the active step in `StepCard.svelte` and `StepPlayer.svelte` to feature an input prompt with "Check Step", "Hint", and "Reveal Step" actions, integrated with the on-screen keypad.

**Tech Stack:** Svelte 5 (runes: `$state`, `$derived`, `$effect`), TypeScript, Vite, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-step-validation-mode-design.md`

## Global Constraints

- Svelte 5 with runes.
- Fully client-side; zero external APIs.
- Plain-text arithmetic in terminal/CLI (no LaTeX notation).
- Tests written with Vitest.

## Review Focus

1. **Commutative Term Reordering:** Student enters `7 + 3x = 22` when expected is `3x + 7 = 22`. (Tested in Task 1).
2. **Symmetric Equation Equality:** Student enters `22 = 3x + 7` or `5 = x` when expected is `3x + 7 = 22` or `x = 5`. (Tested in Task 1).
3. **Skipped Steps:** Student enters `2x = 18` directly on step 1 when expected sequence is `4x - 8 = 2x + 10` -> `2x - 8 = 10` -> `2x = 18`. Must advance to step 3 and report skipped steps. (Tested in Task 1 & Task 3).
4. **Fraction Equivalence:** Student enters unreduced or reduced equivalents (e.g., `2/4` vs `1/2`). (Tested in Task 1).
5. **Hint & Reveal Non-Blocking:** When a student clicks "Hint", the pedagogical rule is shown; when they click "Reveal Step", the step is resolved without failing the problem. (Tested in Task 2 & Task 3).

---

### Task 1: Mathematical Step Equivalence & Validation Engine

**Files:**
- Create: `src/lib/math/validator.ts`
- Test: `tests/validator.test.ts`

**Interfaces:**
- Produces:
  - `ValidationResult`: `{ status: 'correct' | 'incorrect' | 'skipped'; matchedStepIndex?: number; skippedSteps?: MathStep[]; message: string; }`
  - `validateStep(userInput: string, currentIndex: number, allSteps: MathStep[]): ValidationResult`

- [ ] **Step 1: Write failing tests for step validator**
In `tests/validator.test.ts`, test:
  1. Exact match with whitespace variations: `3x+7=22` matches `3x + 7 = 22`.
  2. Commutative terms: `7 + 3x = 22` matches `3x + 7 = 22`.
  3. Symmetric equation: `22 = 3x + 7` and `5 = x` matches `x = 5`.
  4. Incorrect answer: `3x + 5 = 20` returns `{ status: 'incorrect' }`.
  5. Skipped step: jumping from step 1 to step 3 returns `{ status: 'skipped', matchedStepIndex: 2 }` with skipped steps list.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npx vitest run tests/validator.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `validateStep` in `src/lib/math/validator.ts`**
Normalize whitespace and operators, compare canonical polynomial terms using `parseTerms`, handle symmetric `=` sides, and check forward in `allSteps` for skipped matches.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npx vitest run tests/validator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/math/validator.ts tests/validator.test.ts
git commit -m "feat: add mathematical step equivalence and validation engine"
```

---

### Task 2: Interactive Active-Step Card & Stepper Scaffolding UI

**Files:**
- Modify: `src/lib/components/StepCard.svelte`
- Modify: `src/lib/components/StepPlayer.svelte`

**Interfaces:**
- Consumes: `validateStep`, `ValidationResult`.
- Produces:
  - Interactive input field on the current active step in `StepCard`.
  - "Check Step ✅", "💡 Hint", "👁️ Reveal Step" controls.
  - Skipped-step yellow alert badge when steps were jumped.
  - Step status tracking: 'solved', 'revealed', 'skipped'.

- [ ] **Step 1: Update `StepCard.svelte`**
Support props for interactive mode: `isInteractive`, `onSubmitStep`, `onRevealStep`, `onToggleHint`, `showHint`, `skippedNotice`.
Render input box with action buttons when step is active and unsolved.

- [ ] **Step 2: Update `StepPlayer.svelte`**
Add state for student input, feedback messages, hint toggling, and skipped steps history.
Handle submission through `validateStep()`.
If correct: advance step and celebrate.
If skipped: advance to matched step and record skipped note.
If incorrect: show friendly guidance.
If revealed: show step and advance.

- [ ] **Step 3: Build verification**
Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/lib/components/StepCard.svelte src/lib/components/StepPlayer.svelte
git commit -m "feat: add interactive step card input, hint toggle, and skipped step banners"
```

---

### Task 3: Keypad Integration, End-to-End Tests, and Final Verification

**Files:**
- Modify: `src/App.svelte`
- Create: `tests/validation-integration.test.ts`

**Interfaces:**
- Connects math keypad to active step input when solving.
- Verifies end-to-end student solving, hint viewing, and skipped-step workflows.

- [ ] **Step 1: Write integration tests in `tests/validation-integration.test.ts`**
Test full problem validation workflows: solving `3x + 7 = 22` step-by-step, skipping ahead on `4x - 8 = 2x + 10`, and handling incorrect answers.

- [ ] **Step 2: Run tests to verify**
Run: `npx vitest run tests/validation-integration.test.ts`
Expected: PASS

- [ ] **Step 3: Update `src/App.svelte`**
Add active step input synchronization with keypad, ensuring student can type using keyboard or on-screen keypad seamlessly.

- [ ] **Step 4: Final verification and build**
Run: `npm test` and `npm run build`
Expected: All tests pass.

- [ ] **Step 5: Commit**
```bash
git add src/App.svelte tests/validation-integration.test.ts
git commit -m "feat: connect keypad to step input and verify student validation workflows"
```
