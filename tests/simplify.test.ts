import { describe, it, expect } from 'vitest';
import { simplifyExpression } from '../src/lib/math/simplify.ts';

describe('Expression Simplifier', () => {
  it('applies distributive property with steps', () => {
    // 3(2x - 4) -> 6x - 12
    const result = simplifyExpression('3(2x - 4)');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('6x - 12');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('distributive'))).toBe(true);
  });

  it('combines like terms with steps', () => {
    // 4x + 7 + 2x - 3 -> 6x + 4
    const result = simplifyExpression('4x + 7 + 2x - 3');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('6x + 4');
    expect(result.steps.some(s => s.rule.toLowerCase().includes('like terms'))).toBe(true);
  });

  it('handles combined multi-step expansion and simplification', () => {
    // 2(3x + 4) - 5x + 7 -> 6x + 8 - 5x + 7 -> x + 15
    const result = simplifyExpression('2(3x + 4) - 5x + 7');
    expect(result.success).toBe(true);
    expect(result.finalAnswer).toBe('x + 15');
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
  });
});
