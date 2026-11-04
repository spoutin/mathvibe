import { solveArithmetic } from './calculator.ts';
import { simplifyExpression } from './simplify.ts';
import { solveLinearEquation } from './linear-solver.ts';
import type { SolveResult } from '../types.ts';

export function solveGrade9Math(rawInput: string): SolveResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      success: false,
      type: 'calculator',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'Please enter a formula or problem to solve.',
    };
  }

  // Standardize symbols
  const sanitized = trimmed
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/X/g, 'x')
    .trim();

  // Route to the appropriate solver
  if (sanitized.includes('=')) {
    return solveLinearEquation(sanitized);
  }

  if (/[a-zA-Z]/.test(sanitized)) {
    return simplifyExpression(sanitized);
  }

  return solveArithmetic(sanitized);
}
