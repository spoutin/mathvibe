import { describe, it, expect } from 'vitest';
import { evaluateScientific } from '../src/lib/math/scientific.ts';
import { validateStep } from '../src/lib/math/validator.ts';
import { solveGrade9Math } from '../src/lib/math/engine.ts';

describe('Scientific Calculator Ad-Hoc Integration', () => {
  it('evaluates Pythagorean theorem side calculations sqrt(3^2 + 4^2) = 5', () => {
    const res = evaluateScientific('sqrt(3^2 + 4^2)', 'deg');
    expect(res.success).toBe(true);
    expect(res.result).toBe(5);
    expect(res.display).toBe('5');
  });

  it('evaluates trig slope and angle calculations like tan(45) and sin(30)', () => {
    const r1 = evaluateScientific('tan(45)', 'deg');
    expect(r1.success).toBe(true);
    expect(r1.result).toBe(1);

    const r2 = evaluateScientific('sin(30)', 'deg');
    expect(r2.success).toBe(true);
    expect(r2.result).toBe(0.5);
  });

  it('evaluates compound expressions log(100) + sqrt(16) * 2', () => {
    const res = evaluateScientific('log(100) + sqrt(16) * 2', 'deg');
    expect(res.success).toBe(true);
    expect(res.result).toBe(10);
  });

  it('allows scientific calculation output to directly validate in problem steps', () => {
    // Problem: 3x + 7 = 22 -> final step expects x = 5
    const solution = solveGrade9Math('3x + 7 = 22');
    const calc = evaluateScientific('(22 - 7) / 3', 'deg');
    expect(calc.result).toBe(5);

    // Simulated "Insert into Step" producing "x = 5"
    const insertedAnswer = `x = ${calc.display}`;
    const validation = validateStep(insertedAnswer, 1, solution.steps);
    expect(validation.status).toBe('correct');
  });
});
