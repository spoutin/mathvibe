import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';

describe('End-to-End Grade 9 Math Solver Integration', () => {
  it('solves multi-step linear equation with distributive property and variables on both sides', () => {
    // 4(x - 2) = 2x + 10
    // 1. Expand brackets: 4x - 8 = 2x + 10
    // 2. Subtract 2x: 2x - 8 = 10
    // 3. Add 8: 2x = 18
    // 4. Divide by 2: x = 9
    const result = solveGrade9Math('4(x - 2) = 2x + 10');
    expect(result.success).toBe(true);
    expect(result.type).toBe('equation');
    expect(result.finalAnswer).toBe('x = 9');
    expect(result.steps.length).toBeGreaterThanOrEqual(4);

    const rules = result.steps.map(s => s.rule.toLowerCase());
    expect(rules.some(r => r.includes('distributive'))).toBe(true);
    expect(rules.some(r => r.includes('inverse'))).toBe(true);
    expect(rules.some(r => r.includes('division property'))).toBe(true);
  });

  it('solves equations with fraction clearing using LCD', () => {
    // x/2 + x/3 = 5 -> LCD 6 -> 3x + 2x = 30 -> 5x = 30 -> x = 6
    const result = solveGrade9Math('x/2 + x/3 = 5');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x = 6');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('clearing denominators') || s.rule.toLowerCase().includes('lcd'))).toBe(true);
  });

  it('simplifies algebraic expressions with brackets and like terms', () => {
    // 2(3x + 4) - 5x -> 6x + 8 - 5x -> x + 8
    const result = solveGrade9Math('2(3x + 4) - 5x');
    expect(result.success).toBe(true);
    expect(result.type).toBe('simplify');
    expect(result.finalAnswer).toBe('x + 8');
  });

  it('computes BEDMAS calculator expressions with exponents and brackets', () => {
    const result = solveGrade9Math('(12 - 4) * 3 + 2^3');
    expect(result.success).toBe(true);
    expect(result.type).toBe('calculator');
    expect(result.finalAnswer).toBe('32');
  });

  it('safely catches division by zero with friendly feedback', () => {
    const result = solveGrade9Math('10 / 0');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/division by zero/i);
  });

  it('identifies parallel lines / no solution contradictions', () => {
    const result = solveGrade9Math('2x + 1 = 2x + 5');
    expect(result.success).toBe(true);
    expect(result.finalAnswer.toLowerCase()).toContain('no solution');
  });

  it('identifies identical lines / infinitely many solutions', () => {
    const result = solveGrade9Math('3x + 6 = 3(x + 2)');
    expect(result.success).toBe(true);
    expect(result.finalAnswer.toLowerCase()).toContain('infinitely many solutions');
  });
});
