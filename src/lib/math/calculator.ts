import { Fraction } from './fraction.ts';
import type { MathStep, SolveResult } from '../types.ts';

type Token =
  | { type: 'num'; val: Fraction; display?: string }
  | { type: 'op'; op: '+' | '-' | '*' | '/' | '^' }
  | { type: 'paren'; paren: '(' | ')' };

export function solveArithmetic(rawInput: string): SolveResult {
  const steps: MathStep[] = [];
  const input = rawInput.trim();

  if (!input) {
    return {
      success: false,
      type: 'calculator',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'Please enter a valid mathematical expression.',
    };
  }

  try {
    const tokens = tokenize(input);
    let stepCount = 0;

    // Helper to format tokens back into readable string
    const formatTokens = (toks: Token[]): string => {
      let out = '';
      for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (t.type === 'num') {
          out += t.val.toString();
        } else if (t.type === 'op') {
          out += ` ${t.op} `;
        } else {
          out += t.paren;
        }
      }
      return out.trim();
    };

    // Step loop: while tokens have operations or parentheses
    while (hasOperationsOrParens(tokens)) {
      // 1. Check for innermost parentheses
      const openParenIdx = findLastOpenParen(tokens);
      if (openParenIdx !== -1) {
        const closeParenIdx = findMatchingCloseParen(tokens, openParenIdx);
        if (closeParenIdx === -1) {
          throw new Error('Mismatched parentheses.');
        }

        const innerTokens = tokens.slice(openParenIdx + 1, closeParenIdx);
        if (innerTokens.length === 0) {
          throw new Error('Empty parentheses.');
        }

        if (innerTokens.length === 1 && innerTokens[0].type === 'num') {
          // Just remove the parentheses around a single number
          tokens.splice(openParenIdx, 3, innerTokens[0]);
          continue;
        }

        // Reduce one operation inside parentheses
        const stepDetail = reduceOneOperation(innerTokens);
        if (stepDetail) {
          stepCount++;
          // Replace innerTokens inside tokens
          tokens.splice(openParenIdx + 1, closeParenIdx - openParenIdx - 1, ...innerTokens);
          steps.push({
            stepNumber: stepCount,
            title: `Step ${stepCount}: Inside Parentheses`,
            expression: formatTokens(tokens),
            action: stepDetail.action,
            rule: `BEDMAS: ${stepDetail.rule}`,
          });
        }
        continue;
      }

      // 2. Reduce one operation in flat expression
      const stepDetail = reduceOneOperation(tokens);
      if (stepDetail) {
        stepCount++;
        steps.push({
          stepNumber: stepCount,
          title: `Step ${stepCount}: ${stepDetail.title}`,
          expression: formatTokens(tokens),
          action: stepDetail.action,
          rule: stepDetail.rule,
        });
      } else {
        break;
      }
    }

    if (tokens.length !== 1 || tokens[0].type !== 'num') {
      throw new Error('Could not fully evaluate expression.');
    }

    const finalAnswer = tokens[0].val.toString();
    stepCount++;
    steps.push({
      stepNumber: stepCount,
      title: 'Final Result',
      expression: finalAnswer,
      action: `Completed all operations. The final answer is ${finalAnswer}`,
      rule: 'All steps verified using Grade 9 BEDMAS order of operations.',
      isFinal: true,
    });

    return {
      success: true,
      type: 'calculator',
      original: rawInput,
      steps,
      finalAnswer,
    };
  } catch (err: any) {
    return {
      success: false,
      type: 'calculator',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error evaluating arithmetic expression.',
    };
  }
}

function hasOperationsOrParens(tokens: Token[]): boolean {
  return tokens.some((t) => t.type === 'op' || t.type === 'paren');
}

function findLastOpenParen(tokens: Token[]): number {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type === 'paren' && (tokens[i] as any).paren === '(') {
      return i;
    }
  }
  return -1;
}

function findMatchingCloseParen(tokens: Token[], openIdx: number): number {
  for (let i = openIdx + 1; i < tokens.length; i++) {
    if (tokens[i].type === 'paren' && (tokens[i] as any).paren === ')') {
      return i;
    }
  }
  return -1;
}

interface StepReduction {
  title: string;
  action: string;
  rule: string;
}

function reduceOneOperation(tokens: Token[]): StepReduction | null {
  // BEDMAS Order:
  // 1. Exponents (^)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'op' && t.op === '^') {
      const left = tokens[i - 1];
      const right = tokens[i + 1];
      if (left?.type === 'num' && right?.type === 'num') {
        const exp = right.val.toNumber();
        if (!Number.isInteger(exp)) {
          throw new Error('Fractional exponents are not supported in Grade 9 arithmetic.');
        }
        const res = left.val.pow(exp);
        const action = `Calculate exponent: ${left.val.toString()}^${right.val.toString()} = ${res.toString()}`;
        const rule = 'BEDMAS Rule: Exponents are evaluated before multiplication and division.';
        tokens.splice(i - 1, 3, { type: 'num', val: res });
        return { title: 'Evaluate Exponent', action, rule };
      }
    }
  }

  // 2. Multiplication & Division (left to right)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'op' && (t.op === '*' || t.op === '/')) {
      const left = tokens[i - 1];
      const right = tokens[i + 1];
      if (left?.type === 'num' && right?.type === 'num') {
        if (t.op === '*') {
          const res = left.val.mul(right.val);
          const action = `Multiply: ${left.val.toString()} * ${right.val.toString()} = ${res.toString()}`;
          const rule = 'BEDMAS Rule: Multiplication and division are evaluated in order from left to right.';
          tokens.splice(i - 1, 3, { type: 'num', val: res });
          return { title: 'Multiplication', action, rule };
        } else {
          if (right.val.numerator === 0) {
            throw new Error('Division by zero is undefined.');
          }
          const res = left.val.div(right.val);
          const action = `Divide: ${left.val.toString()} / ${right.val.toString()} = ${res.toString()}`;
          const rule = 'BEDMAS Rule: Division and multiplication are evaluated in order from left to right.';
          tokens.splice(i - 1, 3, { type: 'num', val: res });
          return { title: 'Division', action, rule };
        }
      }
    }
  }

  // 3. Addition & Subtraction (left to right)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'op' && (t.op === '+' || t.op === '-')) {
      const left = tokens[i - 1];
      const right = tokens[i + 1];
      if (left?.type === 'num' && right?.type === 'num') {
        if (t.op === '+') {
          const res = left.val.add(right.val);
          let rule = 'BEDMAS Rule: Addition and subtraction are evaluated from left to right.';
          let action = `Add: ${left.val.toString()} + ${right.val.toString()} = ${res.toString()}`;
          if (left.val.denominator !== 1 || right.val.denominator !== 1) {
            rule = 'Fraction Addition: Find the lowest common denominator (LCD) before adding numerators.';
          }
          tokens.splice(i - 1, 3, { type: 'num', val: res });
          return { title: 'Addition', action, rule };
        } else {
          const res = left.val.sub(right.val);
          let rule = 'BEDMAS Rule: Addition and subtraction are evaluated from left to right.';
          let action = `Subtract: ${left.val.toString()} - ${right.val.toString()} = ${res.toString()}`;
          if (left.val.denominator !== 1 || right.val.denominator !== 1) {
            rule = 'Fraction Subtraction: Convert to common denominator before subtracting numerators.';
          }
          tokens.splice(i - 1, 3, { type: 'num', val: res });
          return { title: 'Subtraction', action, rule };
        }
      }
    }
  }

  return null;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const str = input.replace(/\s+/g, '');

  while (i < str.length) {
    const ch = str[i];

    if (ch === '(' || ch === ')') {
      if (ch === '(') {
        const prev = tokens[tokens.length - 1];
        if (prev && (prev.type === 'num' || (prev.type === 'paren' && prev.paren === ')'))) {
          tokens.push({ type: 'op', op: '*' });
        }
      }
      tokens.push({ type: 'paren', paren: ch });
      i++;
      continue;
    }

    if (ch === '+' || ch === '*' || ch === '^' || ch === '×' || ch === '·') {
      const op = ch === '×' || ch === '·' ? '*' : (ch as any);
      tokens.push({ type: 'op', op });
      i++;
      continue;
    }

    if (ch === '/') {
      tokens.push({ type: 'op', op: '/' });
      i++;
      continue;
    }

    if (ch === '-') {
      // Check if unary minus
      const prev = tokens[tokens.length - 1];
      const isUnary = !prev || prev.type === 'op' || (prev.type === 'paren' && prev.paren === '(');
      if (isUnary) {
        i++;
        // Check if immediately followed by '('
        while (i < str.length && str[i] === ' ') i++;
        if (i < str.length && str[i] === '(') {
          tokens.push({ type: 'num', val: new Fraction(-1, 1) });
          tokens.push({ type: 'op', op: '*' });
          continue;
        }

        // Read the number following unary minus
        let numStr = '-';
        while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
          numStr += str[i];
          i++;
        }
        if (numStr === '-') {
          throw new Error('Unexpected minus sign.');
        }
        tokens.push({ type: 'num', val: Fraction.parse(numStr) });
        continue;
      } else {
        tokens.push({ type: 'op', op: '-' });
        i++;
        continue;
      }
    }

    if (/\d/.test(ch) || ch === '.') {
      let numStr = '';
      while (i < str.length && (/\d/.test(str[i]) || str[i] === '.')) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: 'num', val: Fraction.parse(numStr) });
      continue;
    }

    throw new Error(`Unrecognized symbol: ${ch}`);
  }

  return tokens;
}
