import { parseTerms, formatTerms } from './simplify.ts';
import { Fraction } from './fraction.ts';
import { Polynomial } from './polynomial.ts';
import { evaluateScientific } from './scientific.ts';
import type { MathStep, SolutionPath } from '../types.ts';

export interface ValidationResult {
  status: 'correct' | 'incorrect' | 'skipped';
  matchedStepIndex?: number;
  skippedSteps?: MathStep[];
  message: string;
}

export interface MultiPathValidationResult extends ValidationResult {
  activePathId?: string;
  switchedPath?: SolutionPath;
}

export function validateStepMultiPath(
  userInput: string,
  currentIndex: number,
  activeSteps: MathStep[],
  availablePaths?: SolutionPath[]
): MultiPathValidationResult {
  // 1. Check against active path
  const activeRes = validateStep(userInput, currentIndex, activeSteps);
  if (activeRes.status === 'correct' || activeRes.status === 'skipped') {
    return activeRes;
  }

  // 2. If on the initial branching step (currentIndex === 0) and alternate paths exist:
  if (currentIndex === 0 && availablePaths && availablePaths.length > 1) {
    for (const altPath of availablePaths) {
      if (altPath.steps.length > 0) {
        const altCheck = validateStep(userInput, 0, altPath.steps);
        if (altCheck.status === 'correct' || altCheck.status === 'skipped') {
          return {
            ...altCheck,
            switchedPath: altPath,
            activePathId: altPath.id,
            message: `Nice strategy! Switched to ${altPath.strategyLabel}.`,
          };
        }
      }
    }
  }

  return activeRes;
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

  // Direct normalized string match (normalizing optional * before parentheses e.g. 2*(4) vs 2(4))
  const normA = cleanA.replace(/\s+/g, '').replace(/\*\(/g, '(').replace(/--/g, '-(-');
  const normB = cleanB.replace(/\s+/g, '').replace(/\*\(/g, '(').replace(/--/g, '-(-');
  if (normA === normB || normA.replace(/-\(-/g, '+') === normB.replace(/-\(-/g, '+')) {
    return true;
  }

  // Factored form requirement:
  // If target answer is factored into brackets e.g. "2xy(3x - 2y^2)" or "(x + 2)(x + 3)",
  // the student's answer must also be factored (must contain brackets)
  const isTargetFactored = /\([^()]+\)/.test(cleanB) && !cleanB.includes('=');
  const isInputFactored = /\([^()]+\)/.test(cleanA);
  if (isTargetFactored && !isInputFactored) {
    return false;
  }

  // Check GCF factored form: e.g. 2xy(3x - 2y^2) vs 2xy(-2y^2 + 3x)
  const gcfRegex = /^([+-]?\s*[^()]+)\s*\(([^()]+)\)$/;
  const gcfMatchA = gcfRegex.exec(cleanA);
  const gcfMatchB = gcfRegex.exec(cleanB);
  if (gcfMatchA && gcfMatchB) {
    try {
      const outerPolyA = Polynomial.parse(gcfMatchA[1]);
      const outerPolyB = Polynomial.parse(gcfMatchB[1]);
      if (arePolynomialsEquivalent(outerPolyA, outerPolyB)) {
        const polyA = Polynomial.parse(gcfMatchA[2]);
        const polyB = Polynomial.parse(gcfMatchB[2]);
        if (arePolynomialsEquivalent(polyA, polyB)) return true;
      }
    } catch {}
  }

  // Check product of binomials: e.g. (x + 2)(x + 3) vs (3 + x)(2 + x)
  const binomRegex = /^\(([^()]+)\)\s*\*?\s*\(([^()]+)\)$/;
  const binomMatchA = binomRegex.exec(cleanA);
  const binomMatchB = binomRegex.exec(cleanB);
  if (binomMatchA && binomMatchB) {
    try {
      const pA1 = Polynomial.parse(binomMatchA[1]);
      const pA2 = Polynomial.parse(binomMatchA[2]);
      const pB1 = Polynomial.parse(binomMatchB[1]);
      const pB2 = Polynomial.parse(binomMatchB[2]);

      if (
        (arePolynomialsEquivalent(pA1, pB1) && arePolynomialsEquivalent(pA2, pB2)) ||
        (arePolynomialsEquivalent(pA1, pB2) && arePolynomialsEquivalent(pA2, pB1))
      ) {
        return true;
      }
    } catch {}
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

  // General polynomial expression comparison (only if neither expression has numerical parentheses like 2(4)^2)
  if (!cleanA.includes('=') && !cleanB.includes('=')) {
    // If there are evaluated number brackets, check if evaluating them numerically matches
    // e.g. 5(9) - -3 vs 5 * 9 - -3
    try {
      const parsedA = cleanA.replace(/--/g, '- -').replace(/\)\s*\(/g, ') * (');
      const parsedB = cleanB.replace(/--/g, '- -').replace(/\)\s*\(/g, ') * (');
      
      // We must actively transform bracketed numbers into explicit multiplication for solveArithmetic
      // e.g. "5(9)" -> "5 * (9)"
      // And negative signs e.g. "- (3)" -> "-1 * 3" inside solveArithmetic, we just pass prepA
      const prepA = parsedA.replace(/(\d)\s*\(/g, '$1*(').replace(/\)\s*(\d)/g, ')*$1').replace(/\)\s*\(/g, ')*(');
      const prepB = parsedB.replace(/(\d)\s*\(/g, '$1*(').replace(/\)\s*(\d)/g, ')*$1').replace(/\)\s*\(/g, ')*(');

      // We use the scientific calculator engine for robust BEDMAS numerical eval here
      const arithA = evaluateScientific(prepA);
      const arithB = evaluateScientific(prepB);
      if (arithA.success && arithB.success && arithA.result === arithB.result) {
        if (!/[a-zA-Z]/.test(cleanA) && !/[a-zA-Z]/.test(cleanB)) {
           return true;
        }
      }
    } catch {}

    const hasNumParenA = /\(\s*-?\d/.test(cleanA) || /\)\s*-?\d/.test(cleanA) || /\d\s*\(/.test(cleanA);
    const hasNumParenB = /\(\s*-?\d/.test(cleanB) || /\)\s*-?\d/.test(cleanB) || /\d\s*\(/.test(cleanB);

    if (!hasNumParenA && !hasNumParenB) {
      try {
        const polyA = Polynomial.parse(cleanA).combineLikeTerms().format();
        const polyB = Polynomial.parse(cleanB).combineLikeTerms().format();
        if (polyA === polyB) {
          return true;
        }
      } catch {}

      if (isSideEquivalent(cleanA, cleanB)) {
        return true;
      }
    }
  }

  return false;
}

function arePolynomialsEquivalent(pA: Polynomial, pB: Polynomial): boolean {
  const cA = pA.combineLikeTerms();
  const cB = pB.combineLikeTerms();
  if (cA.terms.length !== cB.terms.length) return false;

  for (const tA of cA.terms) {
    const matching = cB.terms.find(
      (tB) => tB.signature === tA.signature && tB.coeff.toString() === tA.coeff.toString()
    );
    if (!matching) return false;
  }
  return true;
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
