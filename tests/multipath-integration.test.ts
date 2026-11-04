import { describe, it, expect } from 'vitest';
import { solveGrade9Math } from '../src/lib/math/engine.ts';
import { validateStepMultiPath } from '../src/lib/math/validator.ts';

describe('Multi-Path Solving & Adaptive Strategy Integration', () => {
  it('allows student to solve 3x + 7 = 22 (x = 5) using either substitution or algebra first', () => {
    const res = solveGrade9Math('3x + 7 = 22', { x: '5' });
    expect(res.paths).toBeDefined();
    expect(res.paths?.length).toBe(2);

    // Path A: Student types substitution line 3(5) + 7 = 22
    const step0A = validateStepMultiPath('3(5) + 7 = 22', 0, res.steps, res.paths);
    expect(step0A.status).toBe('correct');

    // Path B: Student chooses to solve algebraically first with 3x = 15
    const step0B = validateStepMultiPath('3x = 15', 0, res.steps, res.paths);
    expect(step0B.status).toBe('correct');
    expect(step0B.switchedPath).toBeDefined();
    expect(step0B.switchedPath?.id).toBe('algebra');

    // Follow up step on Path B: x = 5
    const step1B = validateStepMultiPath('x = 5', 1, step0B.switchedPath!.steps, res.paths);
    expect(step1B.status).toBe('correct');
  });

  it('allows student to solve 2(x - 3) = 14 using either distributive property or divide first', () => {
    const res = solveGrade9Math('2(x - 3) = 14');
    expect(res.paths).toBeDefined();
    expect(res.paths?.length).toBe(2);

    // Path A: Distribute first (2x - 6 = 14)
    const step0A = validateStepMultiPath('2x - 6 = 14', 0, res.steps, res.paths);
    expect(step0A.status).toBe('correct');

    // Path B: Divide by 2 first (x - 3 = 7)
    const step0B = validateStepMultiPath('x - 3 = 7', 0, res.steps, res.paths);
    expect(step0B.status).toBe('correct');
    expect(step0B.switchedPath?.id).toBe('division');

    // Follow up step on Path B: x = 10
    const step1B = validateStepMultiPath('x = 10', 1, step0B.switchedPath!.steps, res.paths);
    expect(step1B.status).toBe('correct');
  });

  it('supports non-x single variables in multi-path generation like 3y + 7 = 22 (y = 5) and 2(y - 3) = 14', () => {
    const r1 = solveGrade9Math('3y + 7 = 22', { y: '5' });
    expect(r1.paths).toBeDefined();
    expect(r1.paths?.length).toBe(2);

    const algPath = r1.paths?.find(p => p.id === 'algebra');
    expect(algPath).toBeDefined();
    expect(algPath?.steps[0].expression).toBe('3y = 15');
    expect(algPath?.finalAnswer).toBe('y = 5');

    const r2 = solveGrade9Math('2(y - 3) = 14');
    expect(r2.paths).toBeDefined();
    expect(r2.paths?.length).toBe(2);
    const divPath = r2.paths?.find(p => p.id === 'division');
    expect(divPath?.steps[0].expression).toBe('y - 3 = 7');
    expect(divPath?.steps[1].title).toMatch(/Step 2:/);
  });
});
