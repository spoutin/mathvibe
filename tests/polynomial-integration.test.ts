import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';
import { validateStep } from '../src/lib/math/validator.ts';

describe('Polynomial Factoring & Expansion Integration', () => {
  it('solves 6x^2y - 4xy^3 by factoring out GCF into 2xy(3x - 2y^2)', () => {
    const res = solveGrade9Math('6x^2y - 4xy^3');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('2xy(3x - 2y^2)');
    expect(res.steps.length).toBeGreaterThanOrEqual(2);

    const hasGcf = res.steps.some(s => s.action.toLowerCase().includes('gcf'));
    expect(hasGcf).toBe(true);
  });

  it('validates student input for factored form 2xy(3x - 2y^2) with commutative terms', () => {
    const res = solveGrade9Math('6x^2y - 4xy^3');
    const valid1 = validateStep('2xy(3x - 2y^2)', 1, res.steps);
    expect(valid1.status).toBe('correct');

    const validCommutative = validateStep('2xy(-2y^2 + 3x)', 1, res.steps);
    expect(validCommutative.status).toBe('correct');
  });

  it('rejects un-factored input when expected answer is factored', () => {
    const res = solveGrade9Math('6x^2y - 4xy^3');
    // Repeating the original un-factored equation should not count as solved
    const invalid = validateStep('6x^2y - 4xy^3', 1, res.steps);
    expect(invalid.status).toBe('incorrect');
  });

  it('routes binomial products to FOIL expansion', () => {
    const res = solveGrade9Math('(x + 3)(x + 5)');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('x^2 + 8x + 15');
  });

  it('routes trinomials to factoring', () => {
    const res = solveGrade9Math('x^2 + 5x + 6');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('(x + 2)(x + 3)');
  });

  it('routes difference of squares to factoring', () => {
    const res = solveGrade9Math('x^2 - 16');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('(x - 4)(x + 4)');
  });
});
