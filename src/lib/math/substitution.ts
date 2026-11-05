import { solveArithmetic } from './calculator.ts';
import { Polynomial } from './polynomial.ts';
import type { MathStep, SolveResult } from '../types.ts';

export function evaluateSubstitution(
  rawInput: string,
  variableValues: Record<string, string>
): SolveResult {
  const steps: MathStep[] = [];
  const trimmed = rawInput.trim();

  // Clean and filter active variable assignments that actually exist in the input
  const rawLetters = trimmed.match(/[a-zA-Z]/g) || [];
  const activeVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(variableValues)) {
    if (rawLetters.includes(k) && v !== undefined && v !== null && v.toString().trim() !== '') {
      activeVars[k] = v.toString().trim();
    }
  }

  if (Object.keys(activeVars).length === 0) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps: [],
      finalAnswer: '',
      error: 'Please enter at least one variable value to substitute.',
    };
  }

  let stepCount = 0;

  try {
    // 1. Equations (Formula evaluation or Verification)
    if (trimmed.includes('=')) {
      return evaluateEquationSubstitution(trimmed, activeVars);
    }

    // 2. Expressions: Perform substitution
    const substituted = performStringSubstitution(trimmed, activeVars);
    stepCount++;
    const varListStr = Object.entries(activeVars)
      .map(([k, v]) => `${k} = ${v}`)
      .join(', ');

    steps.push({
      stepNumber: stepCount,
      title: `Step ${stepCount}: Substitute Variable Values`,
      expression: substituted,
      action: `Replaced variables with given values in parentheses: ${varListStr}`,
      rule: 'Substitution: Wrap each number in parentheses when replacing variables so negative signs and powers stay organized.',
    });

    // Check if any letters remain
    const remainingLetters = substituted.match(/[a-zA-Z]/g) || [];

    if (remainingLetters.length === 0) {
      // Fully numerical evaluation
      const arithRes = solveArithmetic(substituted);
      if (arithRes.success) {
        // Append arithmetic steps (skipping initial echo if identical to substituted)
        for (let i = 0; i < arithRes.steps.length; i++) {
          const s = arithRes.steps[i];
          // Exclude any step that just repeats the substituted expression without work
          if (!s.isFinal && s.expression === substituted) continue;

          // If the final step is just an identical repetition of the previous line's expression, skip it
          if (s.isFinal && i > 0 && s.expression === arithRes.steps[i - 1].expression) {
            steps[steps.length - 1].isFinal = true;
            steps[steps.length - 1].title = 'Final Evaluated Value';
            steps[steps.length - 1].action = s.action;
            steps[steps.length - 1].rule = s.rule;
            continue;
          }

          stepCount++;
          steps.push({
            ...s,
            stepNumber: stepCount,
            title: s.isFinal ? 'Final Evaluated Value' : `Step ${stepCount}: ${s.title.replace(/^Step \d+:\s*/, '')}`,
          });
        }

        return {
          success: true,
          type: 'simplify',
          original: rawInput,
          steps,
          finalAnswer: arithRes.finalAnswer,
        };
      }
    }

    // Partial assignment: some variables remain
    const simplifiedExpr = simplifySubstitutedExpression(substituted);
    stepCount++;
    steps.push({
      stepNumber: stepCount,
      title: 'Final Simplified Form',
      expression: simplifiedExpr,
      action: `Evaluated numerical substitutions and collected like terms: ${simplifiedExpr}`,
      rule: 'Partial Substitution: Simplify all numerical products while preserving remaining variables.',
      isFinal: true,
    });

    return {
      success: true,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: simplifiedExpr,
    };
  } catch (err: any) {
    return {
      success: false,
      type: 'simplify',
      original: rawInput,
      steps,
      finalAnswer: '',
      error: err.message || 'Error evaluating variable substitution.',
    };
  }
}

function evaluateEquationSubstitution(
  equationStr: string,
  activeVars: Record<string, string>
): SolveResult {
  const steps: MathStep[] = [];
  const sides = equationStr.split('=').map((s) => s.trim());
  let stepCount = 0;

  const lhsSub = performStringSubstitution(sides[0], activeVars);
  const rhsSub = performStringSubstitution(sides[1], activeVars);
  const subEq = `${lhsSub} = ${rhsSub}`;

  const varListStr = Object.entries(activeVars)
    .map(([k, v]) => `${k} = ${v}`)
    .join(', ');

  stepCount++;
  steps.push({
    stepNumber: stepCount,
    title: `Step ${stepCount}: Substitute Variable Values`,
    expression: subEq,
    action: `Replaced variables with given values: ${varListStr}`,
    rule: 'Substitution: Insert given values in parentheses across both sides of the formula.',
  });

  const lhsLetters = lhsSub.match(/[a-zA-Z]/g) || [];
  const rhsLetters = rhsSub.match(/[a-zA-Z]/g) || [];

  // Case 1: Formula evaluation e.g. y = 3(5) - 4 -> y = 11
  if (lhsLetters.length === 1 && sides[0] === lhsLetters[0] && rhsLetters.length === 0) {
    const rhsEval = solveArithmetic(rhsSub);
    if (rhsEval.success) {
      for (const s of rhsEval.steps) {
        stepCount++;
        const currentLine = `${sides[0]} = ${s.expression}`;
        steps.push({
          ...s,
          stepNumber: stepCount,
          expression: currentLine,
          title: s.isFinal ? 'Final Calculated Value' : `Step ${stepCount}: ${s.title.replace(/^Step \d+:\s*/, '')}`,
        });
      }

      const finalAnswer = `${sides[0]} = ${rhsEval.finalAnswer}`;
      return {
        success: true,
        type: 'equation',
        original: equationStr,
        steps,
        finalAnswer,
      };
    }
  }

  // Case 2: Equation Verification e.g. 3(5) + 7 = 22 -> 22 = 22
  if (lhsLetters.length === 0 && rhsLetters.length === 0) {
    const lhsEval = solveArithmetic(lhsSub);
    const rhsEval = solveArithmetic(rhsSub);

    if (lhsEval.success && rhsEval.success) {
      const isBalanced = lhsEval.finalAnswer === rhsEval.finalAnswer;
      if (!isBalanced) {
        const varList = Object.entries(activeVars)
          .map(([k, v]) => `${k} = ${v}`)
          .join(', ');
        return {
          success: false,
          type: 'equation',
          original: equationStr,
          steps: [],
          finalAnswer: '',
          error: `Cannot be solved with ${varList}: The left side evaluates to ${lhsEval.finalAnswer}, which does not equal the right side (${rhsEval.finalAnswer}). Clear or change ${Object.keys(activeVars).join(', ')} to solve this equation.`,
        };
      }

      // Append intermediate steps from LHS evaluation (skipping if it already reached the final equality line)
      for (const s of lhsEval.steps) {
        if (!s.isFinal) {
          const intermediateLine = `${s.expression} = ${rhsEval.finalAnswer}`;
          if (intermediateLine !== `${lhsEval.finalAnswer} = ${rhsEval.finalAnswer}`) {
            stepCount++;
            steps.push({
              ...s,
              stepNumber: stepCount,
              expression: intermediateLine,
              title: `Step ${stepCount}: ${s.title.replace(/^Step \d+:\s*/, '')}`,
            });
          }
        }
      }

      stepCount++;
      const verifyLine = `${lhsEval.finalAnswer} = ${rhsEval.finalAnswer}`;

      steps.push({
        stepNumber: stepCount,
        title: 'Equation Balance Verified',
        expression: verifyLine,
        action: `Verified: Left Side (${lhsEval.finalAnswer}) equals Right Side (${rhsEval.finalAnswer}). The solution is balanced!`,
        rule: 'Equation Verification: Check if substituting the variable balances the equation (LS = RS).',
        isFinal: true,
      });

      return {
        success: true,
        type: 'equation',
        original: equationStr,
        steps,
        finalAnswer: verifyLine,
      };
    }
  }

  // Fallback for partial equation
  const finalAnswer = `${simplifySubstitutedExpression(lhsSub)} = ${simplifySubstitutedExpression(rhsSub)}`;
  return {
    success: true,
    type: 'equation',
    original: equationStr,
    steps,
    finalAnswer,
  };
}

function performStringSubstitution(expr: string, vars: Record<string, string>): string {
  let res = expr;
  // Sort variable keys by length descending to avoid partial prefix collisions
  const sortedKeys = Object.keys(vars).sort((a, b) => b.length - a.length);

  for (const varName of sortedKeys) {
    const val = vars[varName];
    // Replace variable occurrences
    const regex = new RegExp(varName, 'g');
    res = res.replace(regex, `(${val})`);
  }
  return res;
}

function simplifySubstitutedExpression(expr: string): string {
  let simplified = expr;

  // 1. Evaluate powers first: e.g. (4)^2 -> 16
  const powerRegex = /\(\s*(-?\d+(?:\/\d+)?)\s*\)\s*\^\s*(-?\d+)/g;
  simplified = simplified.replace(powerRegex, (_, base, exp) => {
    const b = parseFloat(base);
    const p = parseInt(exp, 10);
    const res = Math.pow(b, p);
    return `(${res})`;
  });

  // 2. Evaluate coefficient * (constant) e.g. 2(16) -> 32
  const productRegex = /([+-]?\s*\d+(?:\/\d+)?)\s*\(\s*(-?\d+(?:\/\d+)?)\s*\)(?!\s*\^)/g;
  simplified = simplified.replace(productRegex, (_, c1, c2) => {
    const arith = solveArithmetic(`${c1} * ${c2}`);
    if (arith.success) {
      const ans = arith.finalAnswer;
      return ans.startsWith('-') ? ans : `+ ${ans}`;
    }
    return `${c1} * ${c2}`;
  });

  // 3. Unwrap isolated parenthesized numbers without multipliers e.g. "+ (4)" or "-(4)"
  const isolatedRegex = /([+-]?\s*)\(\s*(-?\d+(?:\/\d+)?)\s*\)(?!\s*\^)/g;
  simplified = simplified.replace(isolatedRegex, (_, sign, val) => {
    const s = sign.trim();
    if (s === '-') {
      const num = parseFloat(val);
      const neg = -num;
      return neg < 0 ? `- ${Math.abs(neg)}` : `+ ${neg}`;
    }
    return `+ ${val}`;
  });

  try {
    const poly = Polynomial.parse(simplified);
    const combined = poly.combineLikeTerms();
    // Put variable terms before pure numerical constants
    const varTerms = combined.terms.filter((t) => t.totalDegree > 0);
    const constTerms = combined.terms.filter((t) => t.totalDegree === 0);
    return new Polynomial([...varTerms, ...constTerms]).format();
  } catch {
    return simplified.replace(/\s+/g, ' ').trim();
  }
}
