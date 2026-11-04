import { describe, it, expect } from 'vitest';
import { Polynomial, factorPolynomialGCF } from '../src/lib/math/polynomial.ts';

describe('Polynomial & GCF Factoring Engine', () => {
  it('parses multi-variable monomials with exponents correctly', () => {
    const poly = Polynomial.parse('6x^2y - 4xy^3');
    expect(poly.terms.length).toBe(2);

    const t0 = poly.terms[0];
    expect(t0.coeff.toString()).toBe('6');
    expect(t0.vars).toEqual({ x: 2, y: 1 });
    expect(t0.signature).toBe('x^2y');

    const t1 = poly.terms[1];
    expect(t1.coeff.toString()).toBe('-4');
    expect(t1.vars).toEqual({ x: 1, y: 3 });
    expect(t1.signature).toBe('xy^3');
  });

  it('combines like terms across different degrees and variables', () => {
    const poly = Polynomial.parse('3x^2 + 5x - x^2 + 2x');
    const combined = poly.combineLikeTerms();
    expect(combined.format()).toBe('2x^2 + 7x');
  });

  it('does NOT combine unlike terms with different exponents or variables', () => {
    const poly = Polynomial.parse('6x^2y - 4xy^3');
    const combined = poly.combineLikeTerms();
    expect(combined.terms.length).toBe(2);
    expect(combined.format()).toBe('6x^2y - 4xy^3');
  });

  it('factors 6x^2y - 4xy^3 by GCF into 2xy(3x - 2y^2) with Grade 9 steps', () => {
    const result = factorPolynomialGCF('6x^2y - 4xy^3');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('2xy(3x - 2y^2)');
    expect(result.steps.length).toBeGreaterThanOrEqual(2);

    const hasGcfStep = result.steps.some(s => s.action.toLowerCase().includes('gcf') || s.rule.toLowerCase().includes('gcf'));
    expect(hasGcfStep).toBe(true);
  });

  it('factors 3x^3 + 6x^2 - 9x by GCF into 3x(x^2 + 2x - 3)', () => {
    const result = factorPolynomialGCF('3x^3 + 6x^2 - 9x');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('3x(x^2 + 2x - 3)');
  });
});
