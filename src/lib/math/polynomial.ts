import { Fraction } from './fraction.ts';
import type { MathStep, SolveResult } from '../types.ts';

export class Monomial {
  coeff: Fraction;
  vars: Record<string, number>;

  constructor(coeff: Fraction, vars: Record<string, number> = {}) {
    this.coeff = coeff;
    // Clean vars: only keep exponents > 0
    const cleaned: Record<string, number> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (v > 0) cleaned[k] = v;
    }
    this.vars = cleaned;
  }

  get signature(): string {
    const keys = Object.keys(this.vars).sort();
    if (keys.length === 0) return '';
    return keys
      .map((k) => {
        const exp = this.vars[k];
        return exp === 1 ? k : `${k}^${exp}`;
      })
      .join('');
  }

  get totalDegree(): number {
    return Object.values(this.vars).reduce((sum, exp) => sum + exp, 0);
  }

  format(isLeading: boolean = false): string {
    if (this.coeff.numerator === 0) return '0';

    const isNegative = this.coeff.numerator < 0;
    const absCoeff = new Fraction(Math.abs(this.coeff.numerator), this.coeff.denominator);
    const sig = this.signature;

    let coeffStr = absCoeff.toString();
    if (sig) {
      if (coeffStr === '1') {
        coeffStr = '';
      }
    }

    const termBody = `${coeffStr}${sig}`;

    if (isLeading) {
      return isNegative ? `-${termBody}` : termBody;
    }
    return isNegative ? `- ${termBody}` : `+ ${termBody}`;
  }

  mul(other: Monomial): Monomial {
    const newCoeff = this.coeff.mul(other.coeff);
    const newVars: Record<string, number> = { ...this.vars };
    for (const [k, v] of Object.entries(other.vars)) {
      newVars[k] = (newVars[k] || 0) + v;
    }
    return new Monomial(newCoeff, newVars);
  }

  div(other: Monomial): Monomial {
    const newCoeff = this.coeff.div(other.coeff);
    const newVars: Record<string, number> = { ...this.vars };
    for (const [k, v] of Object.entries(other.vars)) {
      const cur = newVars[k] || 0;
      if (cur < v) {
        throw new Error(`Cannot divide ${this.signature} by ${other.signature}`);
      }
      newVars[k] = cur - v;
    }
    return new Monomial(newCoeff, newVars);
  }
}

export class Polynomial {
  terms: Monomial[];

  constructor(terms: Monomial[]) {
    this.terms = terms;
  }

  static parse(input: string): Polynomial {
    const cleaned = input
      .replace(/\s+/g, ' ')
      .replace(/[×·]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\+\s*\+/g, '+')
      .replace(/\+\s*-/g, '-')
      .replace(/-\s*\+/g, '-')
      .replace(/-\s*-/g, '+')
      .trim();

    const terms: Monomial[] = [];
    const termRegex = /([+-]?\s*[^+-]+)/g;
    let match: RegExpExecArray | null;

    while ((match = termRegex.exec(cleaned)) !== null) {
      const raw = match[1].replace(/\s+/g, '');
      if (!raw) continue;

      let sign = 1;
      let body = raw;
      if (body.startsWith('-')) {
        sign = -1;
        body = body.substring(1);
      } else if (body.startsWith('+')) {
        body = body.substring(1);
      }

      // Separate leading coefficient from variables
      // e.g. "6x^2y" -> coeff 6, vars "x^2y"
      // e.g. "4xy^3" -> coeff 4, vars "xy^3"
      // e.g. "x^2" -> coeff 1, vars "x^2"
      // e.g. "7" -> coeff 7, vars ""
      const varStartIndex = body.search(/[a-zA-Z]/);
      let coeff: Fraction;
      let varStr = '';

      if (varStartIndex === -1) {
        // Pure constant
        coeff = Fraction.parse(body);
        if (sign === -1) coeff = coeff.mul(new Fraction(-1, 1));
        terms.push(new Monomial(coeff, {}));
        continue;
      }

      if (varStartIndex === 0) {
        coeff = new Fraction(sign, 1);
        varStr = body;
      } else {
        const coeffStr = body.substring(0, varStartIndex);
        varStr = body.substring(varStartIndex);
        const parsedCoeff = Fraction.parse(coeffStr);
        coeff = sign === -1 ? parsedCoeff.mul(new Fraction(-1, 1)) : parsedCoeff;
      }

      // Parse variables and exponents in varStr
      // e.g. "x^2y" or "xy^3" or "x^2"
      const varRegex = /([a-zA-Z])(?:\^(\d+))?/g;
      let varMatch: RegExpExecArray | null;
      const vars: Record<string, number> = {};

      while ((varMatch = varRegex.exec(varStr)) !== null) {
        const letter = varMatch[1];
        const exponent = varMatch[2] ? parseInt(varMatch[2], 10) : 1;
        vars[letter] = (vars[letter] || 0) + exponent;
      }

      terms.push(new Monomial(coeff, vars));
    }

    return new Polynomial(terms);
  }

  format(): string {
    if (this.terms.length === 0) return '0';

    let res = '';
    for (let i = 0; i < this.terms.length; i++) {
      const formatted = this.terms[i].format(i === 0);
      if (i === 0) {
        res += formatted;
      } else {
        res += ` ${formatted}`;
      }
    }
    return res || '0';
  }

  combineLikeTerms(): Polynomial {
    const groups: Map<string, Monomial> = new Map();
    const order: string[] = [];

    for (const term of this.terms) {
      const sig = term.signature;
      if (groups.has(sig)) {
        const existing = groups.get(sig)!;
        groups.set(sig, new Monomial(existing.coeff.add(term.coeff), existing.vars));
      } else {
        order.push(sig);
        groups.set(sig, new Monomial(term.coeff, term.vars));
      }
    }

    let combined = order
      .map((sig) => groups.get(sig)!)
      .filter((t) => t.coeff.numerator !== 0);

    if (combined.length === 0) {
      combined = [new Monomial(new Fraction(0, 1), {})];
    }

    return new Polynomial(combined);
  }

  factorGCF(): { gcf: Monomial; quotient: Polynomial } | null {
    if (this.terms.length <= 1) return null;

    // 1. Numerical GCD
    let numGcd = Math.abs(this.terms[0].coeff.numerator);
    for (const t of this.terms) {
      numGcd = Fraction.gcd(numGcd, Math.abs(t.coeff.numerator));
    }

    // 2. Common Variables
    // Variable must appear in EVERY term
    const firstVars = Object.keys(this.terms[0].vars);
    const commonVars: Record<string, number> = {};

    for (const v of firstVars) {
      let minExp = this.terms[0].vars[v];
      let inAll = true;
      for (let i = 1; i < this.terms.length; i++) {
        if (!this.terms[i].vars[v]) {
          inAll = false;
          break;
        }
        minExp = Math.min(minExp, this.terms[i].vars[v]);
      }
      if (inAll && minExp > 0) {
        commonVars[v] = minExp;
      }
    }

    const hasCommonVar = Object.keys(commonVars).length > 0;
    const hasCommonNum = numGcd > 1;

    // If GCF is 1, no non-trivial factor
    if (!hasCommonNum && !hasCommonVar) {
      return null;
    }

    const gcfMonomial = new Monomial(new Fraction(numGcd, 1), commonVars);
    const quotientTerms = this.terms.map((t) => t.div(gcfMonomial));

    return {
      gcf: gcfMonomial,
      quotient: new Polynomial(quotientTerms),
    };
  }
}

export function factorPolynomialGCF(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  const poly = Polynomial.parse(rawInput);
  const combined = poly.combineLikeTerms();

  let currentExpr = combined.format();
  let stepCount = 0;

  // Step 0: If uncombined like terms were present, record combining step
  if (poly.terms.length !== combined.terms.length) {
    stepCount++;
    steps.push({
      stepNumber: stepCount,
      title: `Step ${stepCount}: Combine Like Terms`,
      expression: currentExpr,
      action: 'Combined like terms before factoring',
      rule: 'Combining Like Terms: Collect terms with identical variables and powers.',
    });
  }

  const factorResult = combined.factorGCF();

  if (!factorResult) {
    stepCount++;
    steps.push({
      stepNumber: stepCount,
      title: 'Factoring Check: No Common Factor',
      expression: currentExpr,
      action: 'The terms do not share a common numerical or variable factor.',
      rule: 'Prime Polynomial: The expression cannot be factored further by GCF.',
      isFinal: true,
    });
    return {
      success: true,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: currentExpr,
    };
  }

  const gcfStr = factorResult.gcf.format(true);
  const quotientStr = factorResult.quotient.format();

  // Step 1: Identify GCF and divide terms
  stepCount++;
  const divisionBreakdown = combined.terms
    .map((t) => `(${t.format(true)}) / (${gcfStr}) = ${t.div(factorResult.gcf).format(true)}`)
    .join(', ');

  steps.push({
    stepNumber: stepCount,
    title: `Step ${stepCount}: Find Greatest Common Factor (GCF = ${gcfStr})`,
    expression: `${gcfStr}(${quotientStr})`,
    action: `Determined GCF of terms is ${gcfStr}. Divided each term: ${divisionBreakdown}`,
    rule: 'Greatest Common Factor: Divide each term in the polynomial by the GCF.',
  });

  // Step 2: Final factored expression
  const finalAnswer = `${gcfStr}(${quotientStr})`;
  stepCount++;
  steps.push({
    stepNumber: stepCount,
    title: 'Final Factored Form',
    expression: finalAnswer,
    action: `Factored polynomial: ${finalAnswer}`,
    rule: 'Common Factoring: Write the GCF outside the parentheses and the quotient terms inside.',
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
