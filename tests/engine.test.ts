import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';

describe('Unified Grade 9 Math Engine', () => {
  it('routes equations with "=" to linear solver', () => {
    const res = solveGrade9Math('3x + 7 = 22');
    expect(res.success).toBe(true);
    expect(res.type).toBe('equation');
    expect(res.finalAnswer).toBe('x = 5');
  });

  it('routes expressions with variable "x" to simplifier', () => {
    const res = solveGrade9Math('2(3x + 4) - 5x');
    expect(res.success).toBe(true);
    expect(res.type).toBe('simplify');
    expect(res.finalAnswer).toBe('x + 8');
  });

  it('routes purely numerical expressions to BEDMAS calculator', () => {
    const res = solveGrade9Math('(10 - 2) * 3 + 4');
    expect(res.success).toBe(true);
    expect(res.type).toBe('calculator');
    expect(res.finalAnswer).toBe('28');
  });

  it('normalizes multiplication and division symbols (×, ÷)', () => {
    const res = solveGrade9Math('12 ÷ 3 × 2');
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('8');
  });

  it('handles empty input gracefully', () => {
    const res = solveGrade9Math('   ');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('normalizes single-letter variables like y, n, a to x', () => {
    const r1 = solveGrade9Math('2y + 3 = 11');
    expect(r1.success).toBe(true);
    expect(r1.finalAnswer).toBe('y = 4');

    const r2 = solveGrade9Math('3n + 5n');
    expect(r2.success).toBe(true);
    expect(r2.finalAnswer).toBe('8n');
  });
});
