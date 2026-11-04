import { Fraction } from './fraction.ts';
import { Polynomial, Monomial } from './polynomial.ts';
import type { MathStep, SolveResult } from '../types.ts';

export function expandPolynomial(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  const trimmed = rawInput.trim();
  let stepCount = 0;

  try {
    // 1. Binomial times Binomial: (A)(B)
    const twoParensRegex = /^\(([^()]+)\)\s*\(([^()]+)\)$/;
    const twoMatch = twoParensRegex.exec(trimmed);

    if (twoMatch) {
      const leftPoly = Polynomial.parse(twoMatch[1]);
      const rightPoly = Polynomial.parse(twoMatch[2]);

      const productTerms: Monomial[] = [];
      const expansionBreakdown: string[] = [];

      for (const t1 of leftPoly.terms) {
        for (const t2 of rightPoly.terms) {
          const prod = t1.mul(t2);
          productTerms.push(prod);
          expansionBreakdown.push(prod.format(productTerms.length === 1));
        }
      }

      const expandedPoly = new Polynomial(productTerms);
      const intermediateStr = expandedPoly.format();

      stepCount++;
      steps.push({
        stepNumber: stepCount,
        title: `Step ${stepCount}: Apply FOIL (Expand Brackets)`,
        expression: intermediateStr,
        action: `Multiplied each term in the first bracket by each term in the second: ${expansionBreakdown.join(' ')}`,
        rule: 'FOIL Method: FOIL time! Multiply Firsts, Outers, Inners, and Lasts, then gather your like terms.',
      });

      const combined = expandedPoly.combineLikeTerms();
      const finalAnswer = combined.format();

      if (finalAnswer !== intermediateStr) {
        stepCount++;
        steps.push({
          stepNumber: stepCount,
          title: `Step ${stepCount}: Combine Like Terms`,
          expression: finalAnswer,
          action: `Grouped and combined like terms to achieve simplest form: ${finalAnswer}`,
          rule: 'Combining Like Terms: Add coefficients of terms with identical powers.',
          isFinal: true,
        });
      } else {
        steps[steps.length - 1].isFinal = true;
      }

      return {
        success: true,
        type: 'simplify',
        original: rawInput,
        steps,
        finalAnswer,
      };
    }

    // 2. Monomial times Polynomial: M(P) e.g. 2x(3x - 5)
    const monoParenRegex = /^([+-]?\s*[^()]+)\s*\(([^()]+)\)$/;
    const monoMatch = monoParenRegex.exec(trimmed);

    if (monoMatch) {
      const monoPoly = Polynomial.parse(monoMatch[1]);
      if (monoPoly.terms.length === 1) {
        const mono = monoPoly.terms[0];
        const innerPoly = Polynomial.parse(monoMatch[2]);

        const distributedTerms = innerPoly.terms.map((t) => mono.mul(t));
        const finalPoly = new Polynomial(distributedTerms).combineLikeTerms();
        const finalAnswer = finalPoly.format();

        stepCount++;
        steps.push({
          stepNumber: stepCount,
          title: `Step ${stepCount}: Distributive Property`,
          expression: finalAnswer,
          action: `Multiplied ${mono.format(true)} into (${monoMatch[2]}): ${finalAnswer}`,
          rule: 'Distributive Property: Rainbow rule! Multiply the monomial out front with each term inside the bracket.',
          isFinal: true,
        });

        return {
          success: true,
          type: 'simplify',
          original: rawInput,
          steps,
          finalAnswer,
        };
      }
    }

    throw new Error('Unsupported expansion format.');
  } catch (err: any) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error expanding polynomial.',
    };
  }
}

export function factorTrinomial(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  const poly = Polynomial.parse(rawInput).combineLikeTerms();
  let stepCount = 0;

  try {
    // 1. Difference of Squares: x^2 - a^2
    if (poly.terms.length === 2) {
      const t0 = poly.terms[0];
      const t1 = poly.terms[1];

      // Standard form: x^2 - N
      if (
        t0.vars['x'] === 2 &&
        t0.coeff.toString() === '1' &&
        Object.keys(t0.vars).length === 1 &&
        t1.signature === '' &&
        t1.coeff.numerator < 0
      ) {
        const constantVal = Math.abs(t1.coeff.numerator / t1.coeff.denominator);
        const root = Math.sqrt(constantVal);

        if (Number.isInteger(root)) {
          stepCount++;
          steps.push({
            stepNumber: stepCount,
            title: `Step ${stepCount}: Identify Difference of Squares`,
            expression: `(x)^2 - (${root})^2`,
            action: `Recognized expression as a^2 - b^2 with a = x and b = ${root}`,
            rule: 'Difference of Squares: Two squared items subtracted (a^2 - b^2) always split into (a - b)(a + b).',
          });

          const finalAnswer = `(x - ${root})(x + ${root})`;
          stepCount++;
          steps.push({
            stepNumber: stepCount,
            title: 'Final Factored Form',
            expression: finalAnswer,
            action: `Factored into conjugate binomials: ${finalAnswer}`,
            rule: 'Factoring Rule: (a - b)(a + b) eliminates the middle term.',
            isFinal: true,
          });

          return {
            success: true,
            type: 'simplify',
            original: rawInput,
            steps,
            finalAnswer,
          };
        }
      }
    }

    // 2. Simple Trinomial: x^2 + bx + c
    if (poly.terms.length === 3) {
      const termDegree2 = poly.terms.find((t) => t.vars['x'] === 2 && Object.keys(t.vars).length === 1);
      const termDegree1 = poly.terms.find((t) => t.vars['x'] === 1 && Object.keys(t.vars).length === 1);
      const termDegree0 = poly.terms.find((t) => t.signature === '');

      if (termDegree2 && termDegree1 && termDegree0 && termDegree2.coeff.toString() === '1') {
        const b = termDegree1.coeff.toNumber();
        const c = termDegree0.coeff.toNumber();

        // Search for integer factors p and q such that p * q = c and p + q = b
        let foundP: number | null = null;
        let foundQ: number | null = null;

        const maxFactor = Math.abs(c);
        for (let p = -maxFactor; p <= maxFactor; p++) {
          if (p === 0) continue;
          if (c % p === 0) {
            const q = c / p;
            if (p + q === b) {
              foundP = p;
              foundQ = q;
              break;
            }
          }
        }

        if (foundP !== null && foundQ !== null) {
          stepCount++;
          steps.push({
            stepNumber: stepCount,
            title: `Step ${stepCount}: Product and Sum Method`,
            expression: `Product = ${c}, Sum = ${b}`,
            action: `Found integers ${foundP} and ${foundQ} because (${foundP}) * (${foundQ}) = ${c} and (${foundP}) + (${foundQ}) = ${b}`,
            rule: 'Product & Sum Method: Number riddle! Find two numbers that multiply to the end number and add up to the middle number.',
          });

          const formatFactor = (num: number): string => (num >= 0 ? `(x + ${num})` : `(x - ${Math.abs(num)})`);
          const finalAnswer = `${formatFactor(foundP)}${formatFactor(foundQ)}`;

          stepCount++;
          steps.push({
            stepNumber: stepCount,
            title: 'Final Factored Form',
            expression: finalAnswer,
            action: `Factored trinomial: ${finalAnswer}`,
            rule: 'Factoring Simple Trinomials: x^2 + bx + c = (x + p)(x + q).',
            isFinal: true,
          });

          return {
            success: true,
            type: 'simplify',
            original: rawInput,
            steps,
            finalAnswer,
          };
        }
      }
    }

    throw new Error('Polynomial could not be factored as a simple trinomial or difference of squares.');
  } catch (err: any) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error factoring trinomial.',
    };
  }
}
