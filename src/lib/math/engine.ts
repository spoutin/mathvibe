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

  // Detect variable letter if any (e.g. y, n, a, etc.)
  const letters = sanitized.match(/[a-zA-Z]/g) || [];
  const distinctLetters = Array.from(new Set(letters));
  let activeVar = 'x';

  let normalized = sanitized;
  if (distinctLetters.length === 1 && distinctLetters[0] !== 'x') {
    activeVar = distinctLetters[0];
    normalized = sanitized.replace(new RegExp(activeVar, 'g'), 'x');
  }

  // Route to the appropriate solver
  let res: SolveResult;
  if (normalized.includes('=')) {
    res = solveLinearEquation(normalized);
  } else if (/[a-zA-Z]/.test(normalized)) {
    res = simplifyExpression(normalized);
  } else {
    res = solveArithmetic(normalized);
  }

  // Restore variable name if not 'x'
  if (activeVar !== 'x') {
    res.original = rawInput;
    res.finalAnswer = res.finalAnswer.replace(/x/g, activeVar);
    res.steps = res.steps.map((s) => ({
      ...s,
      expression: s.expression.replace(/x/g, activeVar),
      action: s.action.replace(/x/g, activeVar),
      title: s.title.replace(/x/g, activeVar),
    }));
  }

  return res;
}
