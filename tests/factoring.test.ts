import { describe, it, expect } from 'vitest';
import { expandPolynomial, factorTrinomial } from '../src/lib/math/factoring.ts';

describe('FOIL Expansion & Trinomial Factoring', () => {
  it('expands binomial product using FOIL (x + 3)(x + 5)', () => {
    const res = expandPolynomial('(x + 3)(x + 5)');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('x^2 + 8x + 15');
    expect(res.steps.some(s => s.title.toLowerCase().includes('foil') || s.action.toLowerCase().includes('multiply'))).toBe(true);
  });

  it('multiplies monomial by polynomial 2x(3x - 5)', () => {
    const res = expandPolynomial('2x(3x - 5)');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('6x^2 - 10x');
  });

  it('factors simple trinomial x^2 + 5x + 6 using Product and Sum method', () => {
    const res = factorTrinomial('x^2 + 5x + 6');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('(x + 2)(x + 3)');
    expect(res.steps.some(s => s.action.toLowerCase().includes('product') || s.rule.toLowerCase().includes('product'))).toBe(true);
  });

  it('factors difference of squares x^2 - 16', () => {
    const res = factorTrinomial('x^2 - 16');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('(x - 4)(x + 4)');
    expect(res.steps.some(s => s.rule.toLowerCase().includes('difference of squares'))).toBe(true);
  });
});
