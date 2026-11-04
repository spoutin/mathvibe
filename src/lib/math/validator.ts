import { parseTerms, formatTerms } from './simplify.ts';
import { Fraction } from './fraction.ts';
import type { MathStep } from '../types.ts';

export interface ValidationResult {
  status: 'correct' | 'incorrect' | 'skipped';
  matchedStepIndex?: number;
  skippedSteps?: MathStep[];
  message: string;
}

export function validateStep(
  userInput: string,
  currentIndex: number,
  allSteps: MathStep[]
): ValidationResult {
  const rawInput = userInput.trim();
  if (!rawInput) {
    return {
      status: 'incorrect',
      message: 'Please enter your mathematical step.',
    };
  }

  // 1. Check if matches the current expected step
  if (currentIndex >= 0 && currentIndex < allSteps.length) {
    const currentStep = allSteps[currentIndex];
    if (isEquivalent(rawInput, currentStep.expression)) {
      return {
        status: 'correct',
        matchedStepIndex: currentIndex,
        message: 'Correct! Well done.',
      };
    }
  }

  // 2. Check if matches any subsequent step (student skipped ahead)
  for (let k = currentIndex + 1; k < allSteps.length; k++) {
    const futureStep = allSteps[k];
    if (isEquivalent(rawInput, futureStep.expression)) {
      const skipped = allSteps.slice(currentIndex, k);
      return {
        status: 'skipped',
        matchedStepIndex: k,
        skippedSteps: skipped,
        message: 'Great math! You skipped ahead.',
      };
    }
  }

  return {
    status: 'incorrect',
    message: 'Not quite! Check your signs or operations and try again.',
  };
}

/**
 * Checks whether two mathematical expressions/equations are equivalent in standard Grade 9 form
 */
export function isEquivalent(inputA: string, inputB: string): boolean {
  const cleanA = sanitizeInput(inputA);
  const cleanB = sanitizeInput(inputB);

  // Direct normalized string match
  if (cleanA.replace(/\s+/g, '') === cleanB.replace(/\s+/g, '')) {
    return true;
  }

  // Equation comparison
  if (cleanA.includes('=') && cleanB.includes('=')) {
    const partsA = cleanA.split('=').map((s) => s.trim());
    const partsB = cleanB.split('=').map((s) => s.trim());

    if (partsA.length === 2 && partsB.length === 2) {
      const [aLHS, aRHS] = partsA;
      const [bLHS, bRHS] = partsB;

      // Direct sides
      if (
        (isSideEquivalent(aLHS, bLHS) && isSideEquivalent(aRHS, bRHS)) ||
        // Symmetric sides (e.g. 5 = x vs x = 5)
        (isSideEquivalent(aLHS, bRHS) && isSideEquivalent(aRHS, bLHS))
      ) {
        return true;
      }
    }
  }

  // Non-equation algebraic expression comparison (e.g. "8 + x" vs "x + 8")
  if (!cleanA.includes('=') && !cleanB.includes('=')) {
    if (isSideEquivalent(cleanA, cleanB)) {
      return true;
    }
  }

  return false;
}

function isSideEquivalent(sideA: string, sideB: string): boolean {
  if (sideA.replace(/\s+/g, '') === sideB.replace(/\s+/g, '')) {
    return true;
  }

  try {
    const termsA = parseTerms(sideA);
    const termsB = parseTerms(sideB);

    if (termsA.length === 0 || termsB.length === 0) {
      return false;
    }

    const canonA = canonicalizePolynomial(termsA);
    const canonB = canonicalizePolynomial(termsB);

    return canonA === canonB;
  } catch {
    return false;
  }
}

function canonicalizePolynomial(terms: { coeff: Fraction; variable: string }[]): string {
  let totalX = terms
    .filter((t) => t.variable === 'x')
    .reduce((acc, t) => acc.add(t.coeff), new Fraction(0, 1));
  let totalConst = terms
    .filter((t) => t.variable === '')
    .reduce((acc, t) => acc.add(t.coeff), new Fraction(0, 1));

  const canonTerms: { coeff: Fraction; variable: string }[] = [];
  if (totalX.numerator !== 0) canonTerms.push({ coeff: totalX, variable: 'x' });
  if (totalConst.numerator !== 0 || canonTerms.length === 0) {
    canonTerms.push({ coeff: totalConst, variable: '' });
  }

  return formatTerms(canonTerms).replace(/\s+/g, '');
}

function sanitizeInput(str: string): string {
  return str
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .trim();
}
