import { describe, it, expect } from 'vitest';
import { evaluateSubstitution } from '../src/lib/math/substitution.ts';

describe('Variable Substitution & Evaluation Engine', () => {
  it('evaluates full multi-variable expression 2x^2 - 3y + 5 with x = 4, y = -2', () => {
    const res = evaluateSubstitution('2x^2 - 3y + 5', { x: '4', y: '-2' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('43');
    expect(res.steps[0].expression).toBe('2(4)^2 - 3(-2) + 5');
    expect(res.steps[0].rule.toLowerCase()).toContain('substitution');
  });

  it('correctly parenthesizes negative numbers so x^2 with x = -3 evaluates to 9', () => {
    const res = evaluateSubstitution('x^2', { x: '-3' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('9');
    expect(res.steps[0].expression).toBe('(-3)^2');
  });

  it('substitutes fractions like x = 1/2 into 4x + 6', () => {
    const res = evaluateSubstitution('4x + 6', { x: '1/2' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('8');
  });

  it('handles partial variable assignment like 3x + 2y with only x = 4', () => {
    const res = evaluateSubstitution('3x + 2y', { x: '4' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('2y + 12');
  });

  it('evaluates formulas y = 3x - 4 with x = 5 to produce y = 11', () => {
    const res = evaluateSubstitution('y = 3x - 4', { x: '5' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('y = 11');
  });

  it('verifies balanced equations 3x + 7 = 22 with x = 5 to produce 22 = 22', () => {
    const res = evaluateSubstitution('3x + 7 = 22', { x: '5' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('22 = 22');
    expect(res.steps.some(s => s.action.toLowerCase().includes('balanced') || s.action.toLowerCase().includes('verified'))).toBe(true);
  });

  it('evaluates powers before products in partial substitution 2x^2 + 3y with x = 4 to get 3y + 32', () => {
    const res = evaluateSubstitution('2x^2 + 3y', { x: '4' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('3y + 32');
  });

  it('substitutes adjacent variables like xy and 2xy correctly (x=3, y=4 -> 24)', () => {
    const res = evaluateSubstitution('2xy', { x: '3', y: '4' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('24');
  });

  it('simplifies partial substitution on terms with coefficient 1 or -1 like x + 2y with x = 4', () => {
    const res = evaluateSubstitution('x + 2y', { x: '4' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('2y + 4');
  });
});
