import { describe, it, expect } from 'vitest';
import { solveLinearEquation } from '../src/lib/math/linear-solver.ts';

describe('Linear Equation Solver', () => {
  it('solves two-step linear equation 3x + 7 = 22', () => {
    const result = solveLinearEquation('3x + 7 = 22');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 5');
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
    expect(result.steps[result.steps.length - 1].isFinal).toBe(true);
  });

  it('solves equation with variables on both sides 4x - 8 = 2x + 10', () => {
    const result = solveLinearEquation('4x - 8 = 2x + 10');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 9');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('inverse') || s.action.toLowerCase().includes('subtract 2x'))).toBe(true);
  });

  it('solves equation with parentheses 2(x - 3) = 14', () => {
    const result = solveLinearEquation('2(x - 3) = 14');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 10');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('distributive'))).toBe(true);
  });

  it('clears fractional denominators using LCD x/2 + x/3 = 5', () => {
    const result = solveLinearEquation('x/2 + x/3 = 5');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 6');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('clear fractions') || s.rule.toLowerCase().includes('lcd'))).toBe(true);
  });

  it('handles negative variable coefficients -x + 4 = 10 and -3x = 12', () => {
    const r1 = solveLinearEquation('-x + 4 = 10');
    expect(r1.success).toBe(true);
    expect(r1.finalAnswer).toBe('x = -6');

    const r2 = solveLinearEquation('-3x = 12');
    expect(r2.success).toBe(true);
    expect(r2.finalAnswer).toBe('x = -4');
  });

  it('detects equations with no solution 2x + 1 = 2x + 5', () => {
    const result = solveLinearEquation('2x + 1 = 2x + 5');
    expect(result.success).toBe(true);
    expect(result.finalAnswer.toLowerCase()).toContain('no solution');
  });

  it('detects identity equations with infinitely many solutions 3x + 6 = 3(x + 2)', () => {
    const result = solveLinearEquation('3x + 6 = 3(x + 2)');
    expect(result.success).toBe(true);
    expect(result.finalAnswer.toLowerCase()).toContain('infinitely many solutions');
  });

  it('solves equations with grouped numerators over denominators like (x + 3)/2 = 5', () => {
    const result = solveLinearEquation('(x + 3)/2 = 5');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 7');
  });

  it('formats integer addition actions cleanly without /1 in step text', () => {
    const result = solveLinearEquation('3x - 4 = 11');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 5');
    expect(result.steps.some(s => s.action.includes('Added 4 to both sides'))).toBe(true);
    expect(result.steps.some(s => s.action.includes('4/1'))).toBe(false);
  });
});
