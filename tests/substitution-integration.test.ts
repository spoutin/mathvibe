import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';
import { validateStep } from '../src/lib/math/validator.ts';
import { GRADE_9_PRESETS } from '../src/lib/presets-data.ts';

describe('Variable Substitution End-to-End Integration', () => {
  it('evaluates multi-variable expressions with values through solveGrade9Math', () => {
    const res = solveGrade9Math('2x^2 - 3y + 5', { x: '4', y: '-2' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('43');
    expect(res.steps[0].expression).toBe('2(4)^2 - 3(-2) + 5');
  });

  it('validates student input on the initial substitution line in practice mode', () => {
    const res = solveGrade9Math('2x^2 - 3y + 5', { x: '4', y: '-2' });
    const step0Valid = validateStep('2(4)^2 - 3(-2) + 5', 0, res.steps);
    expect(step0Valid.status).toBe('correct');
  });

  it('evaluates formulas y = 2x + 5 with x = 3 to produce y = 11', () => {
    const res = solveGrade9Math('y = 2x + 5', { x: '3' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('y = 11');
  });

  it('verifies equations 3x + 7 = 22 with x = 5 to produce 22 = 22', () => {
    const res = solveGrade9Math('3x + 7 = 22', { x: '5' });
    expect(res.success).toBe(true);
    expect(res.finalAnswer).toBe('22 = 22');
  });

  it('includes evaluating expressions presets with default variables', () => {
    const evalPresets = GRADE_9_PRESETS.filter(p => p.category === 'evaluation');
    expect(evalPresets.length).toBeGreaterThan(0);
    expect(evalPresets[0].variables).toBeDefined();
  });
});
