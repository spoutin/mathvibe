import { describe, it, expect } from 'vitest';
import { solveArithmetic } from '../src/lib/math/calculator.ts';

describe('BEDMAS Calculator Engine', () => {
  it('evaluates basic operations following BEDMAS with steps', () => {
    // (12 - 4) * 3 + 2^3
    // Brackets: 12 - 4 = 8 -> 8 * 3 + 2^3
    // Exponent: 2^3 = 8 -> 8 * 3 + 8
    // Multiplication: 8 * 3 = 24 -> 24 + 8
    // Addition: 24 + 8 = 32
    const result = solveArithmetic('(12 - 4) * 3 + 2^3');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('32');
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[result.steps.length - 1].isFinal).toBe(true);
  });

  it('evaluates fraction arithmetic', () => {
    const result = solveArithmetic('3/4 + 1/2');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('5/4');
    expect(result.steps.some(s => s.rule.includes('fraction') || s.rule.includes('BEDMAS') || s.rule.includes('denominator'))).toBe(true);
  });

  it('handles division by zero gracefully', () => {
    const result = solveArithmetic('8 / 0');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/division by zero/i);
  });

  it('handles implicit multiplication and unary negation before brackets', () => {
    const r1 = solveArithmetic('2(3 + 4)');
    expect(r1.success).toBe(true);
    expect(r1.finalAnswer).toBe('14');

    const r2 = solveArithmetic('-(3 + 4)');
    expect(r2.success).toBe(true);
    expect(r2.finalAnswer).toBe('-7');
  });
});
