import { describe, it, expect } from 'vitest';
import { generateSolutionPaths } from '../src/lib/math/multipath.ts';
import { validateStepMultiPath } from '../src/lib/math/validator.ts';

describe('Adaptive Multi-Path Step Validator', () => {
  it('validates and switches path when student inputs algebra first 3x = 15 for 3x + 7 = 22 with x = 5', () => {
    const paths = generateSolutionPaths('3x + 7 = 22', { x: '5' });
    const activePath = paths[0]; // Substitution path (3(5) + 7 = 22)

    // Student enters algebraic step 3x = 15 on Step 1
    const res = validateStepMultiPath('3x = 15', 0, activePath.steps, paths);
    expect(res.status).toBe('correct');
    expect(res.switchedPath).toBeDefined();
    expect(res.switchedPath?.id).toBe('algebra');
    expect(res.activePathId).toBe('algebra');
  });

  it('validates and switches path when student inputs divide-first x - 3 = 7 for 2(x - 3) = 14', () => {
    const paths = generateSolutionPaths('2(x - 3) = 14');
    const activePath = paths[0]; // Distributive path (2x - 6 = 14)

    // Student enters division step x - 3 = 7 on Step 1
    const res = validateStepMultiPath('x - 3 = 7', 0, activePath.steps, paths);
    expect(res.status).toBe('correct');
    expect(res.switchedPath).toBeDefined();
    expect(res.switchedPath?.id).toBe('division');
    expect(res.activePathId).toBe('division');
  });

  it('validates regular primary path without switching', () => {
    const paths = generateSolutionPaths('2(x - 3) = 14');
    const activePath = paths[0];

    const res = validateStepMultiPath('2x - 6 = 14', 0, activePath.steps, paths);
    expect(res.status).toBe('correct');
    expect(res.switchedPath).toBeUndefined();
  });

  it('rejects truly invalid input across all paths', () => {
    const paths = generateSolutionPaths('3x + 7 = 22', { x: '5' });
    const res = validateStepMultiPath('3x = 99', 0, paths[0].steps, paths);
    expect(res.status).toBe('incorrect');
  });
});
