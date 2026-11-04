import { solveLinearEquation } from './linear-solver.ts';
import { evaluateSubstitution } from './substitution.ts';
import type { MathStep } from '../types.ts';

export interface SolutionPath {
  id: string;
  strategyLabel: string;
  steps: MathStep[];
  finalAnswer: string;
}

export function generateSolutionPaths(
  rawInput: string,
  variableValues?: Record<string, string>
): SolutionPath[] {
  const trimmed = rawInput.trim();
  const paths: SolutionPath[] = [];

  // 1. Equation with assigned variable values: e.g. 3x + 7 = 22 with x = 5
  if (trimmed.includes('=') && variableValues) {
    const rawLetters = trimmed.match(/[a-zA-Z]/g) || [];
    const activeVars: Record<string, string> = {};
    for (const [k, v] of Object.entries(variableValues)) {
      if (rawLetters.includes(k) && v !== undefined && v !== null && v.trim() !== '') {
        activeVars[k] = v.trim();
      }
    }

    if (Object.keys(activeVars).length > 0) {
      const subRes = evaluateSubstitution(trimmed, activeVars);
      const algRes = solveLinearEquation(trimmed);

      if (subRes.success && algRes.success) {
        paths.push({
          id: 'substitution',
          strategyLabel: 'Substitution First Strategy',
          steps: subRes.steps,
          finalAnswer: subRes.finalAnswer,
        });

        paths.push({
          id: 'algebra',
          strategyLabel: 'Algebra First Strategy',
          steps: algRes.steps,
          finalAnswer: algRes.finalAnswer,
        });

        return paths;
      }
    }
  }

  // 2. Equation with brackets where RHS divides evenly: e.g. 2(x - 3) = 14
  const bracketDivRegex = /^([+-]?\s*\d+)\s*\(([^()]+)\)\s*=\s*([+-]?\s*\d+)$/;
  const match = bracketDivRegex.exec(trimmed);

  if (match) {
    const multiplier = parseInt(match[1].replace(/\s+/g, ''), 10);
    const inner = match[2].trim();
    const rhs = parseInt(match[3].replace(/\s+/g, ''), 10);

    const distRes = solveLinearEquation(trimmed);

    if (multiplier !== 0 && Math.abs(multiplier) > 1 && rhs % multiplier === 0) {
      const quotient = rhs / multiplier;
      const step1Expr = `${inner} = ${quotient}`;

      // Solve remainder equation: e.g. x - 3 = 7
      const remRes = solveLinearEquation(step1Expr);

      const divSteps: MathStep[] = [
        {
          stepNumber: 1,
          title: 'Step 1: Divide Both Sides First',
          expression: step1Expr,
          action: `Divided both sides by ${multiplier} to immediately clear the bracket: (${match[1].trim()}(${inner})) / ${multiplier} = ${rhs} / ${multiplier}`,
          rule: 'Division First: Since the number on the right is evenly divisible, divide both sides first instead of expanding.',
        },
      ];

      if (remRes.success) {
        for (let i = 0; i < remRes.steps.length; i++) {
          const s = remRes.steps[i];
          divSteps.push({
            ...s,
            stepNumber: i + 2,
            title: s.isFinal ? s.title : `Step ${i + 2}: ${s.title.replace(/^Step \d+:\s*/, '')}`,
          });
        }
      }

      paths.push({
        id: 'distributive',
        strategyLabel: 'Distributive Property Strategy',
        steps: distRes.steps,
        finalAnswer: distRes.finalAnswer,
      });

      paths.push({
        id: 'division',
        strategyLabel: 'Divide First Strategy',
        steps: divSteps,
        finalAnswer: remRes.finalAnswer || distRes.finalAnswer,
      });

      return paths;
    } else {
      // Not evenly divisible: only distributive
      if (distRes.success) {
        return [
          {
            id: 'distributive',
            strategyLabel: 'Distributive Property Strategy',
            steps: distRes.steps,
            finalAnswer: distRes.finalAnswer,
          },
        ];
      }
    }
  }

  // 3. Fallback: single canonical path
  if (trimmed.includes('=')) {
    const eqRes = solveLinearEquation(trimmed);
    if (eqRes.success) {
      return [
        {
          id: 'linear',
          strategyLabel: 'Linear Equation Strategy',
          steps: eqRes.steps,
          finalAnswer: eqRes.finalAnswer,
        },
      ];
    }
  }

  return [];
}
