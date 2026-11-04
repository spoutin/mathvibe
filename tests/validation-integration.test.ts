import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';
import { validateStep } from '../src/lib/math/validator.ts';

describe('Step Validation Integration Workflows', () => {
  it('validates a complete student-solving workflow step-by-step for 3x + 7 = 22', () => {
    const solution = solveGrade9Math('3x + 7 = 22');
    expect(solution.success).toBe(true);
    expect(solution.steps.length).toBeGreaterThanOrEqual(2);

    // Step 0: Isolate variable terms (3x = 15)
    const step0Res = validateStep('3x = 15', 0, solution.steps);
    expect(step0Res.status).toBe('correct');
    expect(step0Res.matchedStepIndex).toBe(0);

    // Step 1: Solve for x (x = 5)
    const step1Res = validateStep('x = 5', 1, solution.steps);
    expect(step1Res.status).toBe('correct');
    expect(step1Res.matchedStepIndex).toBe(1);
  });

  it('recognizes skipped steps when student does mental math forward', () => {
    // 4(x - 2) = 2x + 10 -> expands to 4x - 8 = 2x + 10 -> 2x - 8 = 10 -> 2x = 18 -> x = 9
    const solution = solveGrade9Math('4(x - 2) = 2x + 10');
    expect(solution.success).toBe(true);

    // Student directly enters '2x = 18' on step 0
    const skipRes = validateStep('2x = 18', 0, solution.steps);
    expect(skipRes.status).toBe('skipped');
    expect(skipRes.matchedStepIndex).toBeGreaterThan(0);
    expect(skipRes.skippedSteps?.length).toBeGreaterThan(0);
  });

  it('handles incorrect algebraic answers with guidance', () => {
    const solution = solveGrade9Math('3x + 7 = 22');
    const wrongRes = validateStep('3x = 29', 0, solution.steps);
    expect(wrongRes.status).toBe('incorrect');
    expect(wrongRes.message).toMatch(/not quite/i);
  });

  it('accepts symmetric equation forms like 15 = 3x and 5 = x', () => {
    const solution = solveGrade9Math('3x + 7 = 22');
    const sym0 = validateStep('15 = 3x', 0, solution.steps);
    expect(sym0.status).toBe('correct');

    const sym1 = validateStep('5 = x', 1, solution.steps);
    expect(sym1.status).toBe('correct');
  });
});
