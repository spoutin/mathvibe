import { Fraction } from './fraction.ts';
import { parseTerms, formatTerms } from './simplify.ts';
import type { MathStep, SolveResult } from '../types.ts';

interface SidePolynomial {
  xCoeff: Fraction;
  constant: Fraction;
}

export function solveLinearEquation(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  const trimmed = rawInput.trim();

  if (!trimmed.includes('=')) {
    return {
      success: false,
      type: 'equation',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'An equation must contain an equals sign (=).',
    };
  }

  const sides = trimmed.split('=');
  if (sides.length !== 2) {
    return {
      success: false,
      type: 'equation',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'Equations can only have one equals sign (=).',
    };
  }

  let lhsStr = sides[0].trim();
  let rhsStr = sides[1].trim();
  let stepCount = 0;

  try {
    // 1. Check for fractional terms and clear denominators (LCD)
    const lcd = findEquationLcd(lhsStr, rhsStr);
    if (lcd > 1) {
      stepCount++;
      lhsStr = clearFractionsInSide(lhsStr, lcd);
      rhsStr = clearFractionsInSide(rhsStr, lcd);
      const eqDisplay = `${lhsStr} = ${rhsStr}`;

      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Clear Fractions (Multiply by LCD = ${lcd})`,
        expression: eqDisplay,
        action: `Multiplied every term on both sides by the Lowest Common Denominator (${lcd}) to eliminate fractions`,
        rule: 'Clearing Denominators: Multiplying both sides by the LCD simplifies the equation to integer coefficients.',
      });
    }

    // 2. Expand Parentheses on LHS and RHS if present
    let expandedAny = false;
    if (hasParentheses(lhsStr) || hasParentheses(rhsStr)) {
      if (hasParentheses(lhsStr)) {
        lhsStr = expandParentheses(lhsStr);
        expandedAny = true;
      }
      if (hasParentheses(rhsStr)) {
        rhsStr = expandParentheses(rhsStr);
        expandedAny = true;
      }

      if (expandedAny) {
        stepCount++;
        const eqDisplay = `${lhsStr} = ${rhsStr}`;
        steps.push({
          stepNumber: stepCount,
          title: `Step ${stepCount}: Expand Parentheses`,
          expression: eqDisplay,
          action: 'Applied distributive property to remove parentheses on both sides',
          rule: 'Distributive Property: Multiply the factor outside brackets by each term inside.',
        });
      }
    }

    // 3. Combine Like Terms on each side
    let lhsPoly = evaluateSidePolynomial(lhsStr);
    let rhsPoly = evaluateSidePolynomial(rhsStr);

    const formattedLhs = formatSide(lhsPoly);
    const formattedRhs = formatSide(rhsPoly);

    if (formattedLhs !== lhsStr || formattedRhs !== rhsStr) {
      stepCount++;
      lhsStr = formattedLhs;
      rhsStr = formattedRhs;
      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Combine Like Terms`,
        expression: `${lhsStr} = ${rhsStr}`,
        action: 'Collected variable terms and numerical constants on each side of the equation',
        rule: 'Combining Like Terms: Simplify each side independently before moving terms across.',
      });
    }

    // 4. Move variable terms to LHS
    if (rhsPoly.xCoeff.numerator !== 0) {
      stepCount++;
      const moveCoeff = rhsPoly.xCoeff;
      // Subtract rhsPoly.xCoeff from both sides
      lhsPoly.xCoeff = lhsPoly.xCoeff.sub(moveCoeff);
      rhsPoly.xCoeff = new Fraction(0, 1);

      lhsStr = formatSide(lhsPoly);
      rhsStr = formatSide(rhsPoly);

      const actionText =
        moveCoeff.numerator > 0
          ? `Subtracted ${formatVariableTerm(moveCoeff)} from both sides`
          : `Added ${formatVariableTerm(new Fraction(-moveCoeff.numerator, moveCoeff.denominator))} to both sides`;

      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Isolate Variable on One Side`,
        expression: `${lhsStr} = ${rhsStr}`,
        action: actionText,
        rule: 'Inverse Operations: Use addition or subtraction to collect all variable terms on one side.',
      });
    }

    // 5. Move constant terms to RHS
    if (lhsPoly.constant.numerator !== 0) {
      stepCount++;
      const moveConst = lhsPoly.constant;
      // Subtract lhsPoly.constant from both sides
      rhsPoly.constant = rhsPoly.constant.sub(moveConst);
      lhsPoly.constant = new Fraction(0, 1);

      lhsStr = formatSide(lhsPoly);
      rhsStr = formatSide(rhsPoly);

      const actionText =
        moveConst.numerator > 0
          ? `Subtracted ${moveConst.toString()} from both sides`
          : `Added ${Math.abs(moveConst.numerator)}/${moveConst.denominator} to both sides`;

      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Isolate Constant Terms`,
        expression: `${lhsStr} = ${rhsStr}`,
        action: actionText,
        rule: 'Inverse Operations: Move constant numbers to the opposite side of the variable.',
      });
    }

    // 6. Check for Special Cases: Identity or Contradiction
    if (lhsPoly.xCoeff.numerator === 0) {
      stepCount++;
      if (rhsPoly.constant.numerator === 0) {
        // 0 = 0
        const answer = 'Infinitely many solutions (Identity equation)';
        steps.push({
          stepNumber: stepCount,
          title: 'Final Result: Identity Equation',
          expression: '0 = 0',
          action: 'The variable cancels out leaving a statement (0 = 0) that is always true for any real number.',
          rule: 'Identity: When an equation simplifies to true numerical equality, all real numbers are solutions.',
          isFinal: true,
        });
        return {
          success: true,
          type: 'equation',
          original: rawInput,
          steps,
          finalAnswer: answer,
        };
      } else {
        // 0 = C
        const answer = `No solution (Contradiction: 0 = ${rhsPoly.constant.toString()})`;
        steps.push({
          stepNumber: stepCount,
          title: 'Final Result: No Solution',
          expression: `0 = ${rhsPoly.constant.toString()}`,
          action: `The variable cancels out leaving a false statement (0 = ${rhsPoly.constant.toString()}).`,
          rule: 'Contradiction: When an equation simplifies to a false numerical statement, no solution exists.',
          isFinal: true,
        });
        return {
          success: true,
          type: 'equation',
          original: rawInput,
          steps,
          finalAnswer: answer,
        };
      }
    }

    // 7. Divide by variable coefficient if not 1
    let finalAnswer = '';
    if (lhsPoly.xCoeff.toString() !== '1') {
      stepCount++;
      const divisor = lhsPoly.xCoeff;
      const solution = rhsPoly.constant.div(divisor);

      finalAnswer = `x = ${solution.toString()}`;

      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Solve for x (Divide by Coefficient)`,
        expression: finalAnswer,
        action: `Divided both sides by ${divisor.toString()} to isolate x: x = ${rhsPoly.constant.toString()} / ${divisor.toString()} = ${solution.toString()}`,
        rule: 'Division Property of Equality: Divide both sides by the coefficient of x to find the unknown value.',
        isFinal: true,
      });
    } else {
      finalAnswer = `x = ${rhsPoly.constant.toString()}`;
      // Mark last step as final or add completion step
      if (steps.length > 0) {
        steps[steps.length - 1].isFinal = true;
      } else {
        stepCount++;
        steps.push({
          stepNumber: stepCount,
          title: 'Final Result',
          expression: finalAnswer,
          action: `Equation solved: ${finalAnswer}`,
          rule: 'The variable is completely isolated.',
          isFinal: true,
        });
      }
    }

    return {
      success: true,
      type: 'equation',
      original: rawInput,
      steps,
      finalAnswer,
    };
  } catch (err: any) {
    return {
      success: false,
      type: 'equation',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error solving linear equation.',
    };
  }
}

function hasParentheses(str: string): boolean {
  return str.includes('(') && str.includes(')');
}

function expandParentheses(expr: string): string {
  let res = expr;
  const parenRegex = /([+-]?\s*\d*(?:\/\d+)?)\s*\(\s*([^()]+)\s*\)/;

  while (parenRegex.test(res)) {
    const match = parenRegex.exec(res);
    if (!match) break;

    const rawMultiplier = match[1].replace(/\s+/g, '');
    const inner = match[2].trim();

    let multiplier = new Fraction(1, 1);
    if (rawMultiplier === '-' || rawMultiplier === '-1') {
      multiplier = new Fraction(-1, 1);
    } else if (rawMultiplier === '+' || rawMultiplier === '') {
      multiplier = new Fraction(1, 1);
    } else {
      multiplier = Fraction.parse(rawMultiplier);
    }

    const innerTerms = parseTerms(inner);
    const expandedTerms = innerTerms.map((t) => ({
      coeff: t.coeff.mul(multiplier),
      variable: t.variable,
    }));

    const expandedStr = formatTerms(expandedTerms);
    const startIndex = match.index;
    const matchLen = match[0].length;

    let prefix = res.substring(0, startIndex).trimEnd();
    let suffix = res.substring(startIndex + matchLen).trimStart();

    let replacement = expandedStr;
    if (prefix && !prefix.endsWith('+') && !prefix.endsWith('-') && !expandedStr.startsWith('-')) {
      replacement = '+ ' + expandedStr;
    }

    res = `${prefix} ${replacement} ${suffix}`.replace(/\s+/g, ' ').trim();
  }

  return res;
}

function evaluateSidePolynomial(expr: string): SidePolynomial {
  const terms = parseTerms(expr);
  let totalX = new Fraction(0, 1);
  let totalConst = new Fraction(0, 1);

  for (const t of terms) {
    if (t.variable === 'x') {
      totalX = totalX.add(t.coeff);
    } else {
      totalConst = totalConst.add(t.coeff);
    }
  }

  return { xCoeff: totalX, constant: totalConst };
}

function formatSide(poly: SidePolynomial): string {
  const terms: { coeff: Fraction; variable: string }[] = [];
  if (poly.xCoeff.numerator !== 0) {
    terms.push({ coeff: poly.xCoeff, variable: 'x' });
  }
  if (poly.constant.numerator !== 0 || terms.length === 0) {
    terms.push({ coeff: poly.constant, variable: '' });
  }
  return formatTerms(terms);
}

function formatVariableTerm(coeff: Fraction): string {
  if (coeff.toString() === '1') return 'x';
  if (coeff.toString() === '-1') return '-x';
  return `${coeff.toString()}x`;
}

/**
 * Finds the LCD of all denominators appearing in LHS and RHS
 * Handles terms like "x/2", "x/3", "5/4", etc.
 */
function findEquationLcd(lhs: string, rhs: string): number {
  const full = `${lhs} + ${rhs}`;
  const denRegex = /\/\s*(\d+)/g;
  let match: RegExpExecArray | null;
  const denominators: number[] = [];

  while ((match = denRegex.exec(full)) !== null) {
    const den = parseInt(match[1], 10);
    if (den > 1) {
      denominators.push(den);
    }
  }

  if (denominators.length === 0) return 1;

  let currentLcd = denominators[0];
  for (let i = 1; i < denominators.length; i++) {
    currentLcd = Fraction.lcm(currentLcd, denominators[i]);
  }

  return currentLcd;
}

/**
 * Multiplies each term in a side string by the LCD
 * e.g. "x/2 + x/3" * 6 -> "3x + 2x"
 * e.g. "5" * 6 -> "30"
 */
function clearFractionsInSide(expr: string, lcd: number): string {
  // If expression has parentheses, expand first or multiply
  const cleaned = expr.replace(/\s+/g, ' ');
  // Split terms by + or -
  const terms = parseFractionTerms(cleaned);
  const multipliedTerms = terms.map((t) => {
    // Multiply term coefficient by lcd
    return {
      coeff: t.coeff.mul(new Fraction(lcd, 1)),
      variable: t.variable,
    };
  });

  return formatTerms(multipliedTerms);
}

function parseFractionTerms(expr: string): { coeff: Fraction; variable: string }[] {
  const terms: { coeff: Fraction; variable: string }[] = [];
  const regex = /([+-]?\s*[^+-]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(expr)) !== null) {
    const raw = match[1].replace(/\s+/g, '');
    if (!raw) continue;

    if (raw.includes('x')) {
      // e.g. "x/2", "+x/3", "-x/4", "3x/4", "-2x/5"
      let coeffPart = raw.replace('x', '');
      let sign = 1;
      if (coeffPart.startsWith('-')) {
        sign = -1;
        coeffPart = coeffPart.substring(1);
      } else if (coeffPart.startsWith('+')) {
        coeffPart = coeffPart.substring(1);
      }

      let coeff: Fraction;
      if (coeffPart === '') {
        coeff = new Fraction(sign, 1);
      } else if (coeffPart.startsWith('/')) {
        const den = parseInt(coeffPart.substring(1), 10);
        coeff = new Fraction(sign, den);
      } else {
        const parsed = Fraction.parse(coeffPart);
        coeff = sign === -1 ? parsed.mul(new Fraction(-1, 1)) : parsed;
      }
      terms.push({ coeff, variable: 'x' });
    } else {
      terms.push({ coeff: Fraction.parse(raw), variable: '' });
    }
  }

  return terms;
}
