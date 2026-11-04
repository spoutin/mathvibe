import { solveArithmetic } from './calculator.ts';
import { Polynomial } from './polynomial.ts';
import type { MathStep, SolveResult } from '../types.ts';

export function evaluateSubstitution(
  rawInput: string,
  variableValues: Record<string, string>
): SolveResult {
  const steps: MathStep[] = [];
  const trimmed = rawInput.trim();

  // Clean and filter active variable assignments
  const activeVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(variableValues)) {
    if (v !== undefined && v !== null && v.toString().trim() !== '') {
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
        // Append arithmetic steps
        for (const s of arithRes.steps) {
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
    // Evaluate constant monomial multiplications e.g. 3(4) -> 12
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
      stepCount++;
      const isBalanced = lhsEval.finalAnswer === rhsEval.finalAnswer;
      const verifyLine = `${lhsEval.finalAnswer} = ${rhsEval.finalAnswer}`;

      steps.push({
        stepNumber: stepCount,
        title: isBalanced ? 'Equation Balance Verified' : 'Equation Not Balanced',
        expression: verifyLine,
        action: isBalanced
          ? `Verified: Left Side (${lhsEval.finalAnswer}) equals Right Side (${rhsEval.finalAnswer}). The solution is balanced!`
          : `Left Side (${lhsEval.finalAnswer}) does not equal Right Side (${rhsEval.finalAnswer}).`,
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
  for (const [varName, val] of Object.entries(vars)) {
    // Replace variable occurrences as standalone variable tokens
    const regex = new RegExp(`(?<![a-zA-Z])${varName}(?![a-zA-Z])`, 'g');
    res = res.replace(regex, `(${val})`);
  }
  return res;
}

function simplifySubstitutedExpression(expr: string): string {
  // Evaluates numerical parts like 3(4) -> 12
  let simplified = expr;
  // Match constant(constant) e.g. 3(4) or -2(5)
  const productRegex = /([+-]?\s*\d+(?:\/\d+)?)\s*\(\s*(-?\d+(?:\/\d+)?)\s*\)/g;
  simplified = simplified.replace(productRegex, (_, c1, c2) => {
    const arith = solveArithmetic(`${c1} * ${c2}`);
    if (arith.success) {
      const ans = arith.finalAnswer;
      return ans.startsWith('-') ? ans : `+ ${ans}`;
    }
    return `${c1} * ${c2}`;
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
