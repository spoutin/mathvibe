import { describe, it, expect } from 'vitest';
import { generateSolutionPaths } from '../src/lib/math/multipath.ts';

describe('Multi-Path Solution Generator', () => {
  it('generates both substitution and algebra-first paths for 3x + 7 = 22 with x = 5', () => {
    const paths = generateSolutionPaths('3x + 7 = 22', { x: '5' });
    expect(paths.length).toBe(2);

    const subPath = paths.find(p => p.id === 'substitution');
    expect(subPath).toBeDefined();
    expect(subPath?.strategyLabel).toContain('Substitution');
    expect(subPath?.steps[0].expression).toBe('3(5) + 7 = 22');

    const algPath = paths.find(p => p.id === 'algebra');
    expect(algPath).toBeDefined();
    expect(algPath?.strategyLabel).toContain('Algebra');
    expect(algPath?.steps[0].expression).toBe('3x = 15');
    expect(algPath?.finalAnswer).toBe('x = 5');
  });

  it('generates both distributive and divide-first paths for 2(x - 3) = 14', () => {
    const paths = generateSolutionPaths('2(x - 3) = 14');
    expect(paths.length).toBe(2);

    const distPath = paths.find(p => p.id === 'distributive');
    expect(distPath).toBeDefined();
    expect(distPath?.strategyLabel).toContain('Distributive');
    expect(distPath?.steps[0].expression).toBe('2x - 6 = 14');

    const divPath = paths.find(p => p.id === 'division');
    expect(divPath).toBeDefined();
    expect(divPath?.strategyLabel).toContain('Divide');
    expect(divPath?.steps[0].expression).toBe('x - 3 = 7');
  });

  it('only generates distributive path when RHS is not divisible by multiplier like 3(x - 2) = 10', () => {
    const paths = generateSolutionPaths('3(x - 2) = 10');
    expect(paths.length).toBe(1);
    expect(paths[0].id).toBe('distributive');
  });

  it('generates single canonical path for non-branching linear equations like 3x = 15', () => {
    const paths = generateSolutionPaths('3x = 15');
    expect(paths.length).toBe(1);
    expect(paths[0].steps[0].expression).toBe('x = 5');
  });
});
