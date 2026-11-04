# Design Document: High School Scientific Calculator Modal Popup

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** In Review / Ready for Plan

---

## 1. Intent and Why
While solving Grade 9 and high school math problems, students frequently need to perform ad-hoc side calculations (such as evaluating square roots for the Pythagorean theorem, computing trigonometric values like $\sin(30^\circ)$, finding logarithms, factorials, or power values) without clearing or disrupting their main problem-solving session.

This feature adds a playful, accessible floating action button (FAB) that opens a dedicated **Scientific Calculator Modal Popup** equipped with all standard high school scientific functions.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Fun Floating Action Button (FAB):** Fixed in the bottom-right corner of the screen with vibrant styling (`btn-3d`, 3D shadow, icon `🧮 Scientific Calc`), accessible at any scroll position.
- **Full High School Scientific Function Suite:**
  - **Trigonometric Functions:** `sin`, `cos`, `tan` and inverse `sin⁻¹`, `cos⁻¹`, `tan⁻¹` with a **DEG / RAD** mode toggle.
  - **Exponents, Roots & Powers:** $x^2$, $x^3$, $x^y$, $\sqrt{x}$, $\sqrt[3]{x}$, $10^x$, $e^x$.
  - **Logarithms & Constants:** Common log ($\log$), natural log ($\ln$), $\pi$ (`Math.PI`), $e$ (`Math.E`).
  - **Special Operations:** Factorial ($n!$), reciprocal ($1/x$), absolute value ($|x|$), percent ($\%$, divides by 100), sign toggle ($\pm$).
  - **Standard Arithmetic & Grouping:** `+`, `-`, `*`, `/`, `(`, `)`, `.`, `0-9`.
  - **Memory & Editing:** `Ans` (stores previous calculation), `Clear All` (`AC`), `Backspace` (`⌫`).
- **Student Workflow Integration:**
  - **"Insert into Step ↵" button:** Drops the calculator's current result or expression directly into the active problem input field, saving time and preventing transcription mistakes.
  - **"Copy 📋" button:** Copies the value to the clipboard.
- **Keyboard & Modal Usability:**
  - `Escape` key closes the modal.
  - Clicking outside the modal backdrop closes it.
  - Number and operator keypresses work directly while modal is open.

### Non-Goals
- Programmable calculator scripts or graphing curves (this is an ad-hoc arithmetic and scientific scratchpad).
- Replacing the main step solver (the main solver does pedagogical steps; the modal does instant side calculations).

### Anti-Goals
- Clunky, oversized windows that hide student work completely without easy dismissal.
- Floating-point glitches where $0.1 + 0.2 = 0.30000000000000004$ (formatted cleanly with clean rounding).
- Angular conversion confusion (clearly show active `DEG` or `RAD` status badge).

---

## 3. Architecture & Components

### 3.1 Scientific Calculation Engine (`src/lib/math/scientific.ts`)
A dedicated evaluator that evaluates scientific math expressions safely:
- Tokens: functions (`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `log`, `ln`, `sqrt`, `cbrt`, `abs`, `fact`), constants (`pi`, `e`), operators, numbers.
- Handles `angleMode: 'deg' | 'rad'`.
- Format results cleanly (stripping floating point epsilon noise, e.g. $\sin(30^\circ) = 0.5$ exactly).

### 3.2 Modal Component (`src/lib/components/ScientificCalculatorModal.svelte`)
- Backing state:
  - `display`: current formula / input string.
  - `result`: evaluated answer.
  - `angleMode`: `'deg' | 'rad'` (defaults to `'deg'`, the Grade 9 high school default).
  - `lastAnswer`: previous evaluated result for `Ans`.
  - `isInverse`: boolean toggle for inverse trig (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`).
- Responsive grid layout:
  - Header with title, DEG/RAD toggle pill, and Close button (`✕`).
  - Screen area showing formula history and large evaluated output.
  - Grid of tactile 3D buttons categorized by function (scientific functions in soft purple/slate, digits in crisp white, operators in sky blue, equal in emerald green).
  - Bottom action bar: "Insert into Step ↵" and "Copy 📋".

### 3.3 FAB Launch Button in `App.svelte`
- Floating button in bottom-right corner:
  `fixed bottom-6 right-6 z-40 btn-3d bg-indigo-600 text-white ...`
- Binds to `showScientificModal = $state(false)`.
- When "Insert into Step" is clicked, appends result into `activeStepInput` or `formula`.
