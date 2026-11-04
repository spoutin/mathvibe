import { Fraction } from './fraction.ts';
import { Polynomial, Monomial } from './polynomial.ts';
import type { MathStep, SolveResult } from '../types.ts';

interface Term {
  coeff: Fraction;
  variable: string; // '' for constants, 'x' for linear variable
}

export function simplifyExpression(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  let currentExpr = rawInput.trim();

  if (!currentExpr) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'Please enter a valid algebraic expression.',
    };
  }

  let stepCount = 0;

  try {
    // 1. Expand Parentheses using Distributive Property
    // Matches e.g. "3(2x - 4)", "-2(x + 5)", "+(3x - 1)", "(x + 4)", "-(5 - 4t)"
    const parenRegex = /([+-]?\s*\d*(?:\/\d+)?)\s*\(\s*([^()]+)\s*\)/;

    while (parenRegex.test(currentExpr)) {
      const match = parenRegex.exec(currentExpr);
      if (!match) break;

      const rawMultiplier = match[1].replace(/\s+/g, '');
      const innerContent = match[2].trim();

      let multiplier = new Fraction(1, 1);
      if (rawMultiplier === '-' || rawMultiplier === '-1') {
        multiplier = new Fraction(-1, 1);
      } else if (rawMultiplier === '+' || rawMultiplier === '') {
        multiplier = new Fraction(1, 1);
      } else {
        multiplier = Fraction.parse(rawMultiplier);
      }

      // Parse inner content using Polynomial to handle any powers and variables
      const innerPoly = Polynomial.parse(innerContent);
      const expandedTerms = innerPoly.terms.map((t) => new Monomial(t.coeff.mul(multiplier), t.vars));
      const expandedPoly = new Polynomial(expandedTerms);
      const expandedStr = expandedPoly.format();

      // Replace in currentExpr
      const startIndex = match.index;
      const matchLen = match[0].length;

      let prefix = currentExpr.substring(0, startIndex).trimEnd();
      let suffix = currentExpr.substring(startIndex + matchLen).trimStart();

      let replacement = expandedStr;
      if (prefix && !prefix.endsWith('+') && !prefix.endsWith('-') && !expandedStr.startsWith('-')) {
        replacement = '+ ' + expandedStr;
      }

      currentExpr = cleanExpression(`${prefix} ${replacement} ${suffix}`.trim());

      stepCount++;
      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Distributive Property`,
        expression: currentExpr,
        action: `Distributed multiplier ${multiplier.toString()} into (${innerContent}): ${expandedStr}`,
        rule: 'Distributive Property: The rainbow rule! Multiply the number outside the brackets with each term inside.',
      });
    }

    // 2. Parse all terms and combine like terms across any powers and variables
    const poly = Polynomial.parse(currentExpr);
    const combined = poly.combineLikeTerms();

    if (poly.terms.length > combined.terms.length) {
      stepCount++;
      currentExpr = combined.format();
      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Combine Like Terms`,
        expression: currentExpr,
        action: `Grouped and combined like terms across powers and variables: ${currentExpr}`,
        rule: 'Combining Like Terms: Collect terms that share the exact same variable letters and powers.',
      });
    } else {
      currentExpr = combined.format();
    }

    const finalAnswer = currentExpr;
    stepCount++;
    steps.push({
      stepNumber: stepCount,
      title: 'Final Simplified Form',
      expression: finalAnswer,
      action: `The expression is in simplest form: ${finalAnswer}`,
      rule: 'All like terms have been combined and all brackets expanded.',
      isFinal: true,
    });

    return {
      success: true,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer,
    };
  } catch (err: any) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error simplifying expression.',
    };
  }
}

/**
 * Splits an expression without parentheses into a list of linear Terms
 * (Preserved for compatibility)
 */
export function parseTerms(expr: string): Term[] {
  const terms: Term[] = [];
  const cleaned = cleanExpression(expr);
  if (!cleaned) return terms;

  const regex = /([+-]?\s*[^+-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleaned)) !== null) {
    const rawTerm = match[1].replace(/\s+/g, '');
    if (!rawTerm) continue;

    if (rawTerm.includes('x')) {
      let coeffPart = rawTerm.replace('x', '');
      let coeff: Fraction;
      if (coeffPart === '' || coeffPart === '+') {
        coeff = new Fraction(1, 1);
      } else if (coeffPart === '-') {
        coeff = new Fraction(-1, 1);
      } else {
        coeff = Fraction.parse(coeffPart);
      }
      terms.push({ coeff, variable: 'x' });
    } else {
      terms.push({ coeff: Fraction.parse(rawTerm), variable: '' });
    }
  }

  return terms;
}

export function formatTerms(terms: Term[]): string {
  if (terms.length === 0) return '0';

  let result = '';
  for (let i = 0; i < terms.length; i++) {
    const { coeff, variable } = terms[i];
    if (coeff.numerator === 0 && terms.length > 1) continue;

    const isNegative = coeff.numerator < 0;
    const absCoeff = new Fraction(Math.abs(coeff.numerator), coeff.denominator);

    let termStr = '';
    if (variable === 'x') {
      if (absCoeff.toString() === '1') {
        termStr = 'x';
      } else {
        termStr = `${absCoeff.toString()}x`;
      }
    } else {
      termStr = absCoeff.toString();
    }

    if (i === 0) {
      result += isNegative ? `-${termStr}` : termStr;
    } else {
      result += isNegative ? ` - ${termStr}` : ` + ${termStr}`;
    }
  }

  return result || '0';
}

function cleanExpression(str: string): string {
  return str
    .replace(/\s+/g, ' ')
    .replace(/\+\s*\+/g, '+')
    .replace(/\+\s*-/g, '-')
    .replace(/-\s*\+/g, '-')
    .replace(/-\s*-/g, '+')
    .trim();
}
