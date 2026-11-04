import { solveArithmetic } from './calculator.ts';
import { simplifyExpression } from './simplify.ts';
import { solveLinearEquation } from './linear-solver.ts';
import { factorPolynomialGCF, Polynomial } from './polynomial.ts';
import { expandPolynomial, factorTrinomial } from './factoring.ts';
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
    .trim();

  // Purely numerical arithmetic (BEDMAS) -> no letters at all
  if (!/[a-zA-Z]/.test(sanitized)) {
    return solveArithmetic(sanitized);
  }

  // Detect variable letter if single-letter variable used (e.g. y, n, a, etc.)
  const letters = sanitized.match(/[a-zA-Z]/g) || [];
  const distinctLetters = Array.from(new Set(letters));
  let activeVar = 'x';
  let normalized = sanitized;

  if (distinctLetters.length === 1 && distinctLetters[0] !== 'x') {
    activeVar = distinctLetters[0];
    normalized = sanitized.replace(new RegExp(activeVar, 'g'), 'x');
  }

  const finishResult = (res: SolveResult): SolveResult => {
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
  };

  // 1. Equations (has '=')
  if (normalized.includes('=')) {
    return finishResult(solveLinearEquation(normalized));
  }

  // 2. Product of Binomials FOIL: e.g. (x + 3)(x + 5)
  if (/^\([^()]+\)\s*\([^()]+\)$/.test(normalized)) {
    const expandRes = expandPolynomial(normalized);
    if (expandRes.success) {
      return finishResult(expandRes);
    }
  }

  // 3. Simple Trinomial Factoring / Difference of Squares: e.g. x^2 + 5x + 6, x^2 - 16
  if (!normalized.includes('(') && (normalized.includes('^2') || normalized.includes('^ 2'))) {
    const triRes = factorTrinomial(normalized);
    if (triRes.success) {
      return finishResult(triRes);
    }
  }

  // 4. Common Factoring (GCF): e.g. 6x^2y - 4xy^3 (no parentheses)
  if (!normalized.includes('(')) {
    try {
      const poly = Polynomial.parse(normalized);
      const combined = poly.combineLikeTerms();
      if (combined.terms.length > 1) {
        const gcfCheck = combined.factorGCF();
        if (gcfCheck !== null) {
          return finishResult(factorPolynomialGCF(normalized));
        }
      }
    } catch {
      // Fall through
    }
  }

  // 5. Higher-degree or Multi-variable Like Terms (without parentheses)
  if (!normalized.includes('(') && (normalized.includes('^') || distinctLetters.length > 1)) {
    try {
      const poly = Polynomial.parse(normalized);
      const combined = poly.combineLikeTerms();
      if (poly.terms.length > combined.terms.length) {
        const finalAnswer = combined.format();
        return finishResult({
          success: true,
          type: 'simplify',
          original: rawInput,
          steps: [
            {
              stepNumber: 1,
              title: 'Step 1: Combine Like Terms',
              expression: finalAnswer,
              action: `Combined like terms across powers and variables: ${finalAnswer}`,
              rule: 'Combining Like Terms: Add coefficients of terms sharing identical variable powers.',
              isFinal: true,
            },
          ],
          finalAnswer,
        });
      }
    } catch {
      // Fall through
    }
  }

  // 6. General Linear Expression Simplifier (handles parentheses expansion e.g. 2(3x + 4) - 5x)
  return finishResult(simplifyExpression(normalized));
}
