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

  it('combines higher-degree like terms instead of factoring when like terms exist', () => {
    // 3x^2 + 5x - x^2 + 2x -> 2x^2 + 7x (should NOT factor to x(2x + 7))
    const res = solveGrade9Math('3x^2 + 5x - x^2 + 2x');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('2x^2 + 7x');
  });

  it('expands monomial-times-polynomial expressions like 2x(3x - 5)', () => {
    const res = solveGrade9Math('2x(3x - 5)');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('6x^2 - 10x');
  });

  it('does not corrupt English words when restoring non-x variable letters', () => {
    const res = solveGrade9Math('y^2 - 16');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('(y - 4)(y + 4)');
    for (const step of res.steps) {
      expect(step.action).not.toContain('eypression');
      expect(step.rule).not.toContain('eypression');
    }
  });

  it('validates commutative terms inside binomial factors like (3 + x)(5 + x)', () => {
    const res = solveGrade9Math('(x + 3)(x + 5)');
    const step1 = res.steps.find(s => s.expression === 'x^2 + 8x + 15') || res.steps[res.steps.length - 1];
    expect(step1).toBeDefined();

    const trinomial = solveGrade9Math('x^2 + 5x + 6');
    // Expected is (x + 2)(x + 3); student types (3 + x)(2 + x)
    const valid = validateStep('(3 + x)(2 + x)', 1, trinomial.steps);
    expect(valid.status).toBe('correct');
  });
});
